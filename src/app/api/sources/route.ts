import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    await requireOwner();
    const sources = await prisma.dataSource.findMany({
      include: {
        history: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const { name, type, collectionSlug, rows, columnMapping } = await req.json();

    if (!name || !type || !collectionSlug || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Name, type, collectionSlug, and rows are required" }, { status: 400 });
    }

    const collection = await prisma.collectionDefinition.findUnique({
      where: { slug: collectionSlug },
      include: { fields: true },
    });

    if (!collection) {
      return NextResponse.json({ error: `Collection ${collectionSlug} not found` }, { status: 404 });
    }

    // Create or find data source
    let dataSource = await prisma.dataSource.findFirst({
      where: { name, type },
    });

    if (!dataSource) {
      dataSource = await prisma.dataSource.create({
        data: {
          name,
          type,
          config: JSON.stringify({ collectionSlug, columnMapping }),
          status: "syncing",
        },
      });
    }

    let recordsAdded = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const recordData: Record<string, any> = {};

        // Apply column mapping: key is collection field key, value is row column
        for (const [fieldKey, colName] of Object.entries(columnMapping || {})) {
          if (row[colName as string] !== undefined) {
            recordData[fieldKey] = row[colName as string];
          }
        }

        // If no mapping, use raw row keys
        if (Object.keys(recordData).length === 0) {
          Object.assign(recordData, row);
        }

        await prisma.recordItem.create({
          data: {
            collectionId: collection.id,
            createdById: session.userId,
            data: JSON.stringify(recordData),
          },
        });
        recordsAdded++;
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    const syncStatus = errors.length === 0 ? "success" : recordsAdded > 0 ? "partial" : "failed";

    await prisma.dataSource.update({
      where: { id: dataSource.id },
      data: {
        status: syncStatus,
        lastSyncAt: new Date(),
        errorDetails: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    const syncHistory = await prisma.syncHistory.create({
      data: {
        dataSourceId: dataSource.id,
        recordsProcessed: rows.length,
        recordsAdded,
        recordsUpdated: 0,
        status: syncStatus,
        error: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "IMPORT_DATA",
      entityType: "DATA_SOURCE",
      entityId: dataSource.id,
      details: { collection: collectionSlug, recordsAdded, total: rows.length },
    });

    return NextResponse.json({
      success: true,
      recordsAdded,
      syncHistory,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
