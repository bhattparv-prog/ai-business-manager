import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { syncGoogleSheet } from "@/lib/google-sheets";

const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg/edit?gid=281748641#gid=281748641";

export async function GET() {
  try {
    await requireOwner();

    const dataSource = await prisma.dataSource.findFirst({
      where: { type: "google_sheets" },
      include: {
        history: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Also get record count from the google_sheet_events collection if it exists
    const collection = await prisma.collectionDefinition.findUnique({
      where: { slug: "google_sheet_events" },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });

    return NextResponse.json({
      connected: !!dataSource,
      dataSource,
      defaultUrl: DEFAULT_SHEET_URL,
      recordsCount: collection?._count?.records || 0,
      collectionSlug: collection?.slug || "google_sheet_events",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json().catch(() => ({}));

    const sheetUrl = body.sheetUrl || DEFAULT_SHEET_URL;
    const collectionName = body.collectionName || "Google Sheet Live Event Stream";
    const collectionSlug = body.collectionSlug || "google_sheet_events";

    const result = await syncGoogleSheet({
      sheetUrl,
      collectionSlug,
      collectionName,
      userId: session.userId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Google Sheets Sync Error:", err);
    return NextResponse.json({ error: err.message || "Failed to sync Google Sheet" }, { status: 500 });
  }
}
