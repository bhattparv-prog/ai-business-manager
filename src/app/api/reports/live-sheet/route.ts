import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const collection = await prisma.collectionDefinition.findUnique({
      where: {
        userId_slug: {
          userId: session.userId,
          slug: "google_sheet_events",
        },
      },
      include: {
        records: {
          select: {
            id: true,
            data: true,
            createdAt: true,
          },
        },
      },
    });

    const dataSource = await prisma.dataSource.findFirst({
      where: { userId: session.userId, type: "google_sheets" },
    });

    if (!collection || collection.records.length === 0) {
      return NextResponse.json({
        hasData: false,
        totalEvents: 0,
        dataSource: null,
        message: "No Google Sheet connected yet for your business account. Connect one in Data Sources.",
      });
    }

    const records = collection.records;
    const totalEvents = records.length;

    // Parsed aggregations
    const sessionSet = new Set<string>();
    const pageCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {
      Desktop: 0,
      Mobile: 0,
      Tablet: 0,
      Other: 0,
    };
    const tagCounts: Record<string, number> = {};
    let bookingIntentCount = 0;

    const parsedEvents: any[] = [];

    for (const r of records) {
      let item: any = {};
      try {
        item = JSON.parse(r.data);
      } catch {
        continue;
      }

      parsedEvents.push({
        id: r.id,
        timestamp: item.timestamp_ist || item.timestamp || "",
        pagePath: item.page_path || item.pagepath || "/",
        pageTitle: item.page_title || "",
        elementTag: item.element_tag || "UNKNOWN",
        clickedText: item.clicked_text_label || item.clicked_text || item.label || "-",
        targetUrl: item.target_url_action || item.target_url || "-",
        deviceViewport: item.device_viewport || item.device || "Unknown",
        sessionId: item.session_id || "unknown_session",
      });

      // Sessions
      if (item.session_id) sessionSet.add(item.session_id);

      // Pages
      const p = item.page_path || "/";
      pageCounts[p] = (pageCounts[p] || 0) + 1;

      // Clicked Action / Label
      const action = (item.clicked_text_label || item.clicked_text || "").trim();
      if (action && action !== "-" && action.length > 1) {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      }

      // Booking / Conversion Intent
      const lowerAction = action.toLowerCase();
      if (
        lowerAction.includes("book") ||
        lowerAction.includes("puja") ||
        lowerAction.includes("pooja") ||
        lowerAction.includes("seva") ||
        lowerAction.includes("acharya") ||
        lowerAction.includes("₹") ||
        lowerAction.includes("instant")
      ) {
        bookingIntentCount++;
      }

      // Device
      const dev = (item.device_viewport || "").toLowerCase();
      if (dev.includes("mobile") || dev.includes("android") || dev.includes("iphone")) {
        deviceCounts.Mobile++;
      } else if (dev.includes("desktop")) {
        deviceCounts.Desktop++;
      } else if (dev.includes("tablet") || dev.includes("ipad")) {
        deviceCounts.Tablet++;
      } else {
        deviceCounts.Other++;
      }

      // Element Tag
      const tag = (item.element_tag || "OTHER").toUpperCase();
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }

    // Top Pages
    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({
        page,
        count,
        percentage: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Actions
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({
        action,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Tags
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      hasData: true,
      totalEvents,
      uniqueSessions: sessionSet.size,
      bookingIntentCount,
      uniquePages: Object.keys(pageCounts).length,
      topPages,
      topActions,
      deviceCounts,
      topTags,
      recentEvents: parsedEvents.slice(0, 50),
      lastSyncAt: dataSource?.lastSyncAt || null,
      dataSourceStatus: dataSource?.status || "active",
      collectionSlug: collection.slug,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
