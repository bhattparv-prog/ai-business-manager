import { prisma } from "@/lib/prisma";
import { syncAllSpreadsheetTabs } from "@/lib/google-sheets";

export async function ensureOwnerData(userId: string) {
  try {
    const defaultSheetUrl =
      "https://docs.google.com/spreadsheets/d/1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg/edit?gid=1565779185#gid=1565779185";

    // 1. Check if users, bookings, and events collections exist with records
    const [usersCol, bookingsCol, sheetCol] = await Promise.all([
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId, slug: "sheet_users" } },
        include: { _count: { select: { records: true } } },
      }),
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId, slug: "sheet_bookings" } },
        include: { _count: { select: { records: true } } },
      }),
      prisma.collectionDefinition.findUnique({
        where: { userId_slug: { userId, slug: "google_sheet_events" } },
        include: { _count: { select: { records: true } } },
      }),
    ]);

    if (!usersCol || !bookingsCol || !sheetCol || sheetCol._count.records === 0) {
      await syncAllSpreadsheetTabs(defaultSheetUrl, userId);
    }

    // 2. Ensure standard template tasks exist
    const taskCount = await prisma.task.count({ where: { userId } });
    if (taskCount === 0) {
      await prisma.task.createMany({
        data: [
          {
            userId,
            title: "Follow up on Real Devotee Puja & Seva Bookings",
            description: "Reach out to high-intent leads captured in the Google Sheet stream",
            status: "pending",
            priority: "urgent",
            createdById: userId,
          },
          {
            userId,
            title: "Setup Automated Mobile Push & SMS Alerts",
            description: "Connect notifications to trigger immediately on new booking intents",
            status: "pending",
            priority: "high",
            createdById: userId,
          },
          {
            userId,
            title: "Verify Google Sheet Devotees & Bookings Sync",
            description: "All historical and live website events synced with 0 duplicates",
            status: "completed",
            priority: "medium",
            createdById: userId,
          },
        ],
      });
    }
  } catch (err) {
    console.warn("Auto-provisioning owner data warning:", err);
  }
}
