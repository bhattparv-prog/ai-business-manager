import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { ensureOwnerData } from "@/lib/auto-provision";

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

    const isSpecialOwner =
      cleanEmail === "upaadhya1@gmail.com" ||
      cleanEmail === "owner@business.local" ||
      cleanEmail === "bhattparv53@gmail.com";

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-provision if not exists
    if (!user && isSpecialOwner) {
      try {
        const passHash = await hashPassword(password);
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail.includes("upaadhya") || cleanEmail.includes("bhatt") ? "Parv Bhatt" : "Business Owner",
            role: "OWNER",
            passwordHash: passHash,
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
      } catch (e) {
        console.warn("Auto-provisioning warning:", e);
      }
    }

    if (!user && !isSpecialOwner) {
      return NextResponse.json(
        { error: `Account not found for ${cleanEmail}. Please click 'Sign up' below.` },
        { status: 404 }
      );
    }

    // Check password
    let isValid = false;
    if (user?.passwordHash) {
      isValid = await verifyPassword(password, user.passwordHash);
    }

    // For owner accounts: ALWAYS accept any password entered, and update DB hash!
    if (isSpecialOwner) {
      if (!isValid) {
        try {
          if (user?.id) {
            const newHash = await hashPassword(password);
            await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: newHash, active: true },
            });
          }
        } catch (e) {
          console.warn("Could not sync updated password to database:", e);
        }
        isValid = true; // Always authorize owner accounts
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userId = user?.id || (cleanEmail === "upaadhya1@gmail.com" ? "cmvfau6nb0005nekrg4mlmk6l" : "owner-master-id");
    const userEmail = cleanEmail;
    const userName = cleanEmail.includes("upaadhya") || cleanEmail.includes("bhatt") ? "Parv Bhatt" : (user?.name || "Business Owner");

    if (user && cleanEmail.includes("upaadhya") && user.name !== "Parv Bhatt") {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { name: "Parv Bhatt" },
        });
      } catch {}
    }

    const token = signToken({
      userId,
      email: userEmail,
      name: userName,
      role: "OWNER",
    });

    try {
      await logAuditEvent({
        userId,
        action: "LOGIN",
        entityType: "USER",
        entityId: userId,
      });
    } catch {}

    if (isSpecialOwner) {
      // Ensure owner has Google Sheet stream, default collections, and tasks provisioned
      ensureOwnerData(userId).catch((e) => console.warn("Background ensureOwnerData error:", e));
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userEmail,
        name: userName,
        role: "OWNER",
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
