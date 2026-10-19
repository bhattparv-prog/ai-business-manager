import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({ needsSetup: userCount === 0 });
}

export async function POST(req: Request) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ error: "Setup already completed. Please log in." }, { status: 400 });
    }

    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "OWNER",
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "OWNER",
    });

    await logAuditEvent({
      userId: user.id,
      action: "INITIAL_SETUP",
      entityType: "USER",
      entityId: user.id,
    });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
