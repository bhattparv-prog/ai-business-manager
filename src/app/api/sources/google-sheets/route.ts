import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { syncAllSpreadsheetTabs } from "@/lib/google-sheets";

const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg/edit?gid=1565779185#gid=1565779185";

export async function GET() {
  try {
    const session = await requireOwner();

    const dataSource = await prisma.dataSource.findFirst({
      where: { userId: session.userId, type: "google_sheets" },
      include: {
        history: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const [eventsCol, usersCol, bookingsCol] = await Promise.all([
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId: session.userId, slug: "google_sheet_events" } },
        include: { _count: { select: { records: true } } },
      }),
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId: session.userId, slug: "sheet_users" } },
        include: { _count: { select: { records: true } } },
      }),
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId: session.userId, slug: "sheet_bookings" } },
        include: { _count: { select: { records: true } } },
      }),
    ]);

    return NextResponse.json({
      connected: !!dataSource,
      dataSource,
      defaultUrl: DEFAULT_SHEET_URL,
      recordsCount: eventsCol?._count?.records || 0,
      usersCount: usersCol?._count?.records || 0,
      bookingsCount: bookingsCol?._count?.records || 0,
      collectionSlug: eventsCol?.slug || "google_sheet_events",
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

    const result = await syncAllSpreadsheetTabs(sheetUrl, session.userId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Google Sheets Sync Error:", err);
    return NextResponse.json({ error: err.message || "Failed to sync Google Sheet" }, { status: 500 });
  }
}
