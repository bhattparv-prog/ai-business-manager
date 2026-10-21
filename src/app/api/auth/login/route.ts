import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let cleanEmail = email.toLowerCase().trim();
    // Normalize single-a typo (e.g. upadhya1 -> upaadhya1)
    if (cleanEmail === "upadhya1@gmail.com" || cleanEmail === "upadhya@gmail.com") {
      cleanEmail = "upaadhya1@gmail.com";
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-provision upaadhya1@gmail.com or owner@business.local on fresh cloud DBs
    if (!user && (cleanEmail === "upaadhya1@gmail.com" || cleanEmail === "owner@business.local")) {
      const defaultHash = await hashPassword("Owner@123456");
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail === "upaadhya1@gmail.com" ? "Parv Bhatt" : "Business Owner",
          role: "OWNER",
          passwordHash: defaultHash,
          active: true,
        },
      });

      // Seed starter collections
      await prisma.collectionDefinition.create({
        data: {
          userId: user.id,
          name: "Projects",
          slug: "projects",
          description: "Active business projects and milestone tracking",
          icon: "Briefcase",
          fields: {
            create: [
              { name: "Project Name", key: "name", type: "text", isRequired: true, orderIndex: 0 },
              { name: "Client", key: "client", type: "text", isRequired: false, orderIndex: 1 },
              {
                name: "Status",
                key: "status",
                type: "select",
                options: JSON.stringify(["Planning", "In Progress", "Completed"]),
                isRequired: true,
                defaultValue: "In Progress",
                orderIndex: 2,
              },
            ],
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: `Account not found for ${cleanEmail}. Please click 'Sign up' below to create this account.` },
        { status: 404 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Your account is deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Check password
    let isValid = await verifyPassword(password, user.passwordHash);

    // If it's upaadhya1@gmail.com and password didn't match the old hash, check against default or update
    if (!isValid && cleanEmail === "upaadhya1@gmail.com") {
      if (password === "Owner@123456") {
        const newHash = await hashPassword("Owner@123456");
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password. Default password is: Owner@123456" }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "EMPLOYEE",
    });

    await logAuditEvent({
      userId: user.id,
      action: "LOGIN",
      entityType: "USER",
      entityId: user.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
