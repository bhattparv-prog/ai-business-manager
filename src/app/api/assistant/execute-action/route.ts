import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { actionType, data } = await req.json();

    if (!actionType || !data) {
      return NextResponse.json({ error: "Action type and data are required" }, { status: 400 });
    }

    if (actionType === "create_task") {
      const task = await prisma.task.create({
        data: {
          userId: session.userId,
          title: data.title || "AI Follow-up Task",
          description: data.description || "Created from AI Assistant conversation",
          priority: data.priority || "medium",
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          createdById: session.userId,
          assignedToId: session.userId,
        },
      });

      await logAuditEvent({
        userId: session.userId,
        action: "AI_EXECUTE_ACTION",
        entityType: "TASK",
        entityId: task.id,
        details: { actionType, title: task.title },
      });

      return NextResponse.json({ success: true, result: task });
    }

    if (actionType === "create_record") {
      const { collectionSlug, recordData } = data;
      const collection = await prisma.collectionDefinition.findUnique({
        where: {
          userId_slug: {
            userId: session.userId,
            slug: collectionSlug,
          },
        },
      });

      if (!collection) {
        return NextResponse.json({ error: `Collection ${collectionSlug} not found in your workspace` }, { status: 404 });
      }

      const record = await prisma.recordItem.create({
        data: {
          collectionId: collection.id,
          createdById: session.userId,
          data: JSON.stringify(recordData),
        },
      });

      await logAuditEvent({
        userId: session.userId,
        action: "AI_EXECUTE_ACTION",
        entityType: "RECORD",
        entityId: record.id,
        details: { actionType, collection: collectionSlug },
      });

      return NextResponse.json({ success: true, result: record });
    }

    return NextResponse.json({ error: "Unsupported action type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
