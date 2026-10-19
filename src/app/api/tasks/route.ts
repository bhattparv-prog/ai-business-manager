import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    // Employees see only assigned tasks or tasks they created; Owner sees all
    if (session.role !== "OWNER") {
      where.OR = [{ assignedToId: session.userId }, { createdById: session.userId }];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { title, description, priority = "medium", dueDate, assignedToId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        createdById: session.userId,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CREATE_TASK",
      entityType: "TASK",
      entityId: task.id,
      details: { title, priority },
    });

    // Notify assigned user if different from creator
    if (assignedToId && assignedToId !== session.userId) {
      await sendNotification({
        userId: assignedToId,
        title: "New Task Assigned",
        message: `You were assigned: "${title}"`,
        type: "info",
        link: "/tasks",
      });
    }

    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const { id, status, priority, title, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "UPDATE_TASK",
      entityType: "TASK",
      entityId: id,
      details: { status, priority },
    });

    return NextResponse.json({ task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    await prisma.task.delete({ where: { id } });

    await logAuditEvent({
      userId: session.userId,
      action: "DELETE_TASK",
      entityType: "TASK",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
