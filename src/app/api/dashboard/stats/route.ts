import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "all"; // "today", "week", "month", "all"

    const now = new Date();
    let dateFilter: Date | undefined;

    if (filter === "today") {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === "week") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === "month") {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const recordWhere: any = {
      collection: { userId: session.userId },
    };
    if (dateFilter) {
      recordWhere.createdAt = { gte: dateFilter };
    }

    // 1. Total records and collections for THIS user only
    const collections = await prisma.collectionDefinition.findMany({
      where: { userId: session.userId },
      include: {
        _count: { select: { records: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRecords = await prisma.recordItem.count({ where: recordWhere });
    const allTimeRecords = await prisma.recordItem.count({
      where: { collection: { userId: session.userId } },
    });

    // 2. Tasks stats for THIS user only
    const totalTasks = await prisma.task.count({ where: { userId: session.userId } });
    const pendingTasks = await prisma.task.count({
      where: { userId: session.userId, status: "pending" },
    });
    const urgentTasks = await prisma.task.count({
      where: {
        userId: session.userId,
        status: "pending",
        priority: { in: ["high", "urgent"] },
      },
    });

    // 3. Data sources for THIS user only
    const dataSources = await prisma.dataSource.findMany({
      where: { userId: session.userId },
      select: { id: true, name: true, type: true, status: true, lastSyncAt: true, config: true },
    });

    // 4. Notifications unread for THIS user only
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: session.userId,
        read: false,
      },
    });

    // 5. Recent Activity from Audit Logs for THIS user only
    const recentActivity = await prisma.auditLog.findMany({
      where: { userId: session.userId },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
    });

    // 6. Upcoming pending tasks for THIS user only
    const upcomingTasks = await prisma.task.findMany({
      where: { userId: session.userId, status: "pending" },
      take: 5,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      include: { assignedTo: { select: { name: true } } },
    });

    // 8. If google_sheet_events exists, get sample recent events and compute users & bookings
    const sheetCol = collections.find((c) => c.slug === "google_sheet_events");
    let sheetStats: any = null;
    let recentSheetEvents: any[] = [];
    let uniqueUsersCount = 0;
    let bookingsCount = 0;

    // Optional background auto-sync if requested
    const autoSync = url.searchParams.get("autoSync");
    const googleSheetSource = dataSources.find((d) => d.type === "google_sheets");
    if (autoSync === "true" && googleSheetSource) {
      const nowMs = Date.now();
      const lastSyncMs = googleSheetSource.lastSyncAt
        ? new Date(googleSheetSource.lastSyncAt).getTime()
        : 0;
      // If last sync was > 30 seconds ago, trigger background sync
      if (nowMs - lastSyncMs > 30 * 1000) {
        import("@/lib/google-sheets").then(({ syncGoogleSheet }) => {
          let cfg: any = {};
          try {
            cfg = JSON.parse(googleSheetSource.config);
          } catch {}
          const sheetUrl =
            cfg.sheetUrl ||
            "https://docs.google.com/spreadsheets/d/1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg/edit?gid=281748641#gid=281748641";
          syncGoogleSheet({
            sheetUrl,
            collectionSlug: "google_sheet_events",
            collectionName: "Live Website Event Stream",
            userId: session.userId,
          }).catch(console.error);
        });
      }
    }

    if (sheetCol && sheetCol._count.records > 0) {
      const recentRaw = await prisma.recordItem.findMany({
        where: { collection: { userId: session.userId, slug: "google_sheet_events" } },
        take: 6,
        orderBy: { createdAt: "desc" },
      });

      recentSheetEvents = recentRaw.map((r) => {
        try {
          const item = JSON.parse(r.data);
          return {
            id: r.id,
            timestamp: item.timestamp_ist || item.timestamp || r.createdAt.toISOString(),
            pagePath: item.page_path || item.pagepath || "/",
            pageTitle: item.page_title || "Page View",
            clickedText: item.clicked_text_label || item.clicked_text || item.label || "Live Event",
            deviceViewport: item.device_viewport || item.device || "Mobile",
            sessionId: item.session_id || "session",
          };
        } catch {
          return {
            id: r.id,
            timestamp: r.createdAt.toISOString(),
            pagePath: "/",
            pageTitle: "Event",
            clickedText: "Action",
            deviceViewport: "Mobile",
            sessionId: "session",
          };
        }
      });

      // Calculate distinct visitors / sessions and booking intent requests
      const allSheetRecords = await prisma.recordItem.findMany({
        where: { collection: { userId: session.userId, slug: "google_sheet_events" } },
        select: { data: true },
      });

      const userSessions = new Set<string>();
      for (const r of allSheetRecords) {
        try {
          const item = JSON.parse(r.data);
          if (item.session_id) userSessions.add(item.session_id);
          const text = (item.clicked_text_label || item.clicked_text || item.label || "").toLowerCase();
          if (
            text.includes("book") ||
            text.includes("puja") ||
            text.includes("pooja") ||
            text.includes("seva") ||
            text.includes("acharya") ||
            text.includes("₹") ||
            text.includes("instant") ||
            text.includes("consult")
          ) {
            bookingsCount++;
          }
        } catch {}
      }
      uniqueUsersCount = userSessions.size;

      sheetStats = {
        totalEvents: sheetCol._count.records,
        uniqueUsers: uniqueUsersCount,
        totalBookings: bookingsCount,
        hasData: true,
        lastSyncAt: googleSheetSource?.lastSyncAt || null,
      };
    }

    // Collection distribution breakdown for THIS user only
    const collectionBreakdown = collections.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      count: c._count.records,
    }));

    const completedTasks = await prisma.task.count({
      where: { userId: session.userId, status: "completed" },
    });

    return NextResponse.json({
      user: {
        name: session.name || "Business Owner",
        email: session.email,
        role: session.role,
      },
      metrics: {
        totalUsers: uniqueUsersCount || 1,
        totalBookings: bookingsCount,
        totalRecords,
        allTimeRecords,
        totalCollections: collections.length,
        totalTasks,
        pendingTasks,
        urgentTasks,
        completedTasks,
        unreadNotifications,
        dataSourcesConnected: dataSources.length,
      },
      collectionBreakdown,
      dataSources,
      upcomingTasks,
      recentActivity,
      sheetStats,
      recentSheetEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
