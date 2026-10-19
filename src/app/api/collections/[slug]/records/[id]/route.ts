import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug, id } = await params;
    const body = await req.json();

    const record = await prisma.recordItem.findUnique({
      where: { id },
      include: { collection: true },
    });

    if (!record || record.collection.slug !== slug) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await prisma.recordItem.update({
      where: { id },
      data: {
        data: JSON.stringify(body),
        updatedById: session.userId,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "UPDATE_RECORD",
      entityType: "RECORD",
      entityId: id,
      details: { collection: slug },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug, id } = await params;

    const record = await prisma.recordItem.findUnique({
      where: { id },
      include: { collection: true },
    });

    if (!record || record.collection.slug !== slug) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.recordItem.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "DELETE_RECORD",
      entityType: "RECORD",
      entityId: id,
      details: { collection: slug },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
