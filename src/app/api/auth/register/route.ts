import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Determine role: if first non-seed user or specified, can be OWNER
    const userCount = await prisma.user.count();
    const role = userCount <= 1 ? "OWNER" : "EMPLOYEE";

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Account Created Successfully",
        message: `Welcome ${user.name}! Your ${role.toLowerCase()} workspace is ready to manage your business operations.`,
        type: "success",
        link: "/dashboard",
      },
    });

    // Sign session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "EMPLOYEE",
    });

    await logAuditEvent({
      userId: user.id,
      action: "REGISTER",
      entityType: "USER",
      entityId: user.id,
      details: { role },
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
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
