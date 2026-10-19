import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireOwner } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAuth();
    const { slug } = await params;

    const collection = await prisma.collectionDefinition.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireOwner();
    const { slug } = await params;

    const collection = await prisma.collectionDefinition.findUnique({
      where: { slug },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    await prisma.collectionDefinition.delete({
      where: { id: collection.id },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "DELETE_COLLECTION",
      entityType: "COLLECTION",
      entityId: collection.id,
      details: { slug, name: collection.name },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
