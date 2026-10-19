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
      select: { id: true, name: true, type: true, status: true, lastSyncAt: true },
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

    // 7. Collection distribution breakdown for THIS user only
    const collectionBreakdown = collections.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      count: c._count.records,
    }));

    return NextResponse.json({
      metrics: {
        totalRecords,
        allTimeRecords,
        totalCollections: collections.length,
        totalTasks,
        pendingTasks,
        urgentTasks,
        unreadNotifications,
        dataSourcesConnected: dataSources.length,
      },
      collectionBreakdown,
      dataSources,
      upcomingTasks,
      recentActivity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
