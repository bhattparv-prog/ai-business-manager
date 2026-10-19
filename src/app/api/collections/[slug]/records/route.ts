import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { processAutomations } from "@/lib/automations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug } = await params;
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const collection = await prisma.collectionDefinition.findUnique({
      where: {
        userId_slug: {
          userId: session.userId,
          slug,
        },
      },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found in your workspace" }, { status: 404 });
    }

    const records = await prisma.recordItem.findMany({
      where: {
        collectionId: collection.id,
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse records and perform in-memory search filtering if query provided
    const parsedRecords = records
      .map((r) => {
        let parsedData: Record<string, any> = {};
        try {
          parsedData = JSON.parse(r.data);
        } catch {}
        return {
          id: r.id,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          ...parsedData,
        };
      })
      .filter((rec) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return Object.values(rec).some((val) => String(val).toLowerCase().includes(s));
      });

    return NextResponse.json({
      collection,
      records: parsedRecords,
      total: parsedRecords.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug } = await params;
    const body = await req.json();

    const collection = await prisma.collectionDefinition.findUnique({
      where: {
        userId_slug: {
          userId: session.userId,
          slug,
        },
      },
      include: { fields: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found in your workspace" }, { status: 404 });
    }

    // Validate required fields
    for (const field of collection.fields) {
      if (field.isRequired && (body[field.key] === undefined || body[field.key] === "")) {
        return NextResponse.json(
          { error: `Field "${field.name}" (${field.key}) is required.` },
          { status: 400 }
        );
      }
    }

    const record = await prisma.recordItem.create({
      data: {
        collectionId: collection.id,
        createdById: session.userId,
        data: JSON.stringify(body),
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CREATE_RECORD",
      entityType: "RECORD",
      entityId: record.id,
      details: { collection: collection.name, slug },
    });

    // Fire Automation Engine
    processAutomations({
      triggerType: "new_record",
      collectionId: collection.id,
      collectionSlug: collection.slug,
      recordId: record.id,
      recordData: body,
      userId: session.userId,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        createdAt: record.createdAt,
        ...body,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
