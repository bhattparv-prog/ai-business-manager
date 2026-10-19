import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    await requireOwner();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users, invitations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const { action, name, email, password, role = "EMPLOYEE", userId, active } = await req.json();

    if (action === "create_user") {
      if (!name || !email || !password) {
        return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existing) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          role,
        },
        select: { id: true, name: true, email: true, role: true, active: true },
      });

      await logAuditEvent({
        userId: session.userId,
        action: "CREATE_EMPLOYEE",
        entityType: "USER",
        entityId: user.id,
        details: { email: user.email, role },
      });

      return NextResponse.json({ user });
    }

    if (action === "toggle_active") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

      // Owner cannot deactivate themselves
      if (userId === session.userId) {
        return NextResponse.json({ error: "Cannot deactivate your own owner account" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { active },
        select: { id: true, name: true, email: true, role: true, active: true },
      });

      await logAuditEvent({
        userId: session.userId,
        action: active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entityType: "USER",
        entityId: userId,
      });

      return NextResponse.json({ user: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
