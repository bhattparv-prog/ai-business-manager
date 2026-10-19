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

    // Every registered user is an independent OWNER of their own business workspace
    const role = "OWNER";

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role,
      },
    });

    // Initialize starter default collections for this new owner's private workspace
    await prisma.collectionDefinition.create({
      data: {
        userId: user.id,
        name: "Projects",
        slug: "projects",
        description: "Track client deliverables, scopes, and milestones",
        icon: "Briefcase",
        fields: {
          create: [
            { name: "Project Name", key: "name", type: "text", isRequired: true, orderIndex: 0 },
            { name: "Client Name", key: "client", type: "text", isRequired: false, orderIndex: 1 },
            { name: "Status", key: "status", type: "select", options: JSON.stringify(["Discovery", "In Progress", "Review", "Completed"]), isRequired: false, orderIndex: 2 },
            { name: "Budget", key: "budget", type: "number", isRequired: false, orderIndex: 3 },
            { name: "Due Date", key: "due_date", type: "date", isRequired: false, orderIndex: 4 },
          ],
        },
      },
    });

    await prisma.collectionDefinition.create({
      data: {
        userId: user.id,
        name: "Leads & Inquiries",
        slug: "leads",
        description: "Incoming customer inquiries and prospects",
        icon: "Users",
        fields: {
          create: [
            { name: "Contact Name", key: "contact_name", type: "text", isRequired: true, orderIndex: 0 },
            { name: "Email", key: "email", type: "email", isRequired: false, orderIndex: 1 },
            { name: "Phone", key: "phone", type: "phone", isRequired: false, orderIndex: 2 },
            { name: "Stage", key: "stage", type: "select", options: JSON.stringify(["New", "Contacted", "Proposal Sent", "Won", "Lost"]), isRequired: false, orderIndex: 3 },
            { name: "Deal Value", key: "deal_value", type: "number", isRequired: false, orderIndex: 4 },
          ],
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Private Workspace Ready",
        message: `Welcome ${user.name}! Your independent business workspace has been initialized. All your data, sheets, and records are completely private to your account.`,
        type: "success",
        link: "/dashboard",
      },
    });

    // Sign session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "OWNER",
    });

    await logAuditEvent({
      userId: user.id,
      action: "REGISTER",
      entityType: "USER",
      entityId: user.id,
      details: { role: "OWNER" },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
