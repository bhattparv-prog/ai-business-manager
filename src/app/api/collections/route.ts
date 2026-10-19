import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireOwner } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const session = await requireAuth();
    const collections = await prisma.collectionDefinition.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { records: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ collections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const { name, slug, description, icon = "Folder", fields = [] } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

    const existing = await prisma.collectionDefinition.findUnique({
      where: {
        userId_slug: {
          userId: session.userId,
          slug: cleanSlug,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "A collection with this slug already exists in your workspace" }, { status: 400 });
    }

    const collection = await prisma.collectionDefinition.create({
      data: {
        userId: session.userId,
        name,
        slug: cleanSlug,
        description,
        icon,
        fields: {
          create: fields.map((f: any, idx: number) => ({
            name: f.name,
            key: f.key || f.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
            type: f.type || "text",
            options: f.options ? JSON.stringify(f.options) : null,
            isRequired: Boolean(f.isRequired),
            defaultValue: f.defaultValue || null,
            orderIndex: idx,
          })),
        },
      },
      include: { fields: true },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CREATE_COLLECTION",
      entityType: "COLLECTION",
      entityId: collection.id,
      details: { name, slug: cleanSlug, fieldCount: fields.length },
    });

    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message.includes("FORBIDDEN") ? 403 : 500 });
  }
}
