import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

// RFC-4180 compliant CSV parser
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some((col) => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((col) => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Extract spreadsheet ID and gid from any Google Sheet URL
export function parseGoogleSheetUrl(inputUrl: string): { sheetId: string; gid: string; exportUrl: string } {
  const matchId = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!matchId) {
    throw new Error("Invalid Google Sheet URL. Could not extract spreadsheet ID.");
  }
  const sheetId = matchId[1];

  let gid = "0";
  const matchGid = inputUrl.match(/[?&#]gid=([0-9]+)/);
  if (matchGid) {
    gid = matchGid[1];
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  return { sheetId, gid, exportUrl };
}

// Fetch CSV with automatic HTTP redirect following
export async function fetchGoogleSheetCsv(exportUrl: string): Promise<string> {
  let currentUrl = exportUrl;
  let redirects = 0;
  const maxRedirects = 5;

  while (redirects < maxRedirects) {
    const res = await fetch(currentUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PersonalAIBusinessManager/1.0)",
        Accept: "text/csv,text/plain,*/*",
      },
      cache: "no-store",
    });

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      currentUrl = res.headers.get("location")!;
      redirects++;
      continue;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet CSV: HTTP ${res.status} ${res.statusText}`);
    }

    return await res.text();
  }

  throw new Error("Too many redirects while fetching Google Sheet");
}

export interface SyncOptions {
  sheetUrl: string;
  collectionSlug?: string;
  collectionName?: string;
  userId: string;
}

export const UPAADHYA_SPREADSHEET_ID = "1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg";

export const KNOWN_SHEET_TABS: Record<string, { slug: string; name: string; icon: string }> = {
  "1565779185": {
    slug: "sheet_users",
    name: "Devotees & Registered Users",
    icon: "Users",
  },
  "1155377065": {
    slug: "sheet_bookings",
    name: "Puja & Seva Bookings",
    icon: "Sparkles",
  },
  "281748641": {
    slug: "google_sheet_events",
    name: "Live Website Event Stream",
    icon: "Activity",
  },
};

export async function syncAllSpreadsheetTabs(inputUrl: string, userId: string) {
  const { sheetId, gid } = parseGoogleSheetUrl(inputUrl);

  if (sheetId === UPAADHYA_SPREADSHEET_ID) {
    // Sync all three major tabs of the Upaadhya ecosystem sequentially to avoid SQLite write locks
    const results: any[] = [];

    try {
      results.push(
        await syncGoogleSheet({
          sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=1565779185#gid=1565779185`,
          collectionSlug: "sheet_users",
          collectionName: "Devotees & Registered Users",
          userId,
        })
      );
    } catch (e: any) {
      console.warn("Error syncing sheet_users:", e.message);
    }

    try {
      results.push(
        await syncGoogleSheet({
          sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=1155377065#gid=1155377065`,
          collectionSlug: "sheet_bookings",
          collectionName: "Puja & Seva Bookings",
          userId,
        })
      );
    } catch (e: any) {
      console.warn("Error syncing sheet_bookings:", e.message);
    }

    try {
      results.push(
        await syncGoogleSheet({
          sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=281748641#gid=281748641`,
          collectionSlug: "google_sheet_events",
          collectionName: "Live Website Event Stream",
          userId,
        })
      );
    } catch (e: any) {
      console.warn("Error syncing google_sheet_events:", e.message);
    }

    return {
      success: true,
      syncedTabs: ["sheet_users", "sheet_bookings", "google_sheet_events"],
      sheetId,
      results,
    };
  }

  // Generic sheet sync
  const knownTab = KNOWN_SHEET_TABS[gid];
  const slug = knownTab ? knownTab.slug : "google_sheet_events";
  const name = knownTab ? knownTab.name : "Google Sheet Live Event Stream";

  return await syncGoogleSheet({
    sheetUrl: inputUrl,
    collectionSlug: slug,
    collectionName: name,
    userId,
  });
}

export async function syncGoogleSheet({
  sheetUrl,
  collectionSlug = "google_sheet_events",
  collectionName = "Google Sheet Live Event Stream",
  userId,
}: SyncOptions) {
  if (!userId) {
    throw new Error("User ID is required to sync a private Google Sheet.");
  }

  const { sheetId, gid, exportUrl } = parseGoogleSheetUrl(sheetUrl);

  // 1. Fetch CSV
  const csvText = await fetchGoogleSheetCsv(exportUrl);
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    throw new Error("Google Sheet is completely empty.");
  }

  const rawHeaders = rows[0];
  const dataRows = rows.slice(1);

  // Helper to sanitize field key
  function sanitizeKey(str: string, index: number): string {
    const clean = str
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    return clean || `field_${index + 1}`;
  }

  const fieldKeys = rawHeaders.map((h, i) => ({
    raw: h,
    key: sanitizeKey(h, i),
  }));

  // 2. Find or create CollectionDefinition for THIS USER ONLY
  let collection = await prisma.collectionDefinition.findUnique({
    where: {
      userId_slug: {
        userId,
        slug: collectionSlug,
      },
    },
    include: { fields: true },
  });

  const collectionIcon =
    collectionSlug === "sheet_users"
      ? "Users"
      : collectionSlug === "sheet_bookings"
      ? "Sparkles"
      : "FileSpreadsheet";

  if (!collection) {
    collection = await prisma.collectionDefinition.create({
      data: {
        userId,
        name: collectionName,
        slug: collectionSlug,
        description: `Live synchronized data from Google Sheet (${sheetId}, tab gid: ${gid})`,
        icon: collectionIcon,
        isSystem: false,
        fields: {
          create: fieldKeys.map((f, idx) => ({
            name: f.raw,
            key: f.key,
            type: "text",
            orderIndex: idx,
            isRequired: false,
          })),
        },
      },
      include: { fields: true },
    });
  } else {
    const colId = collection.id;
    // Refresh fields and name to match current sheet structure
    await prisma.collectionDefinition.update({
      where: { id: colId },
      data: { name: collectionName, icon: collectionIcon },
    });
    await prisma.fieldDefinition.deleteMany({
      where: { collectionId: colId },
    });
    await prisma.fieldDefinition.createMany({
      data: fieldKeys.map((f, idx) => ({
        collectionId: colId,
        name: f.raw,
        key: f.key,
        type: "text",
        orderIndex: idx,
        isRequired: false,
      })),
    });
  }

  // 3. Upsert DataSource for THIS USER ONLY
  let dataSource = await prisma.dataSource.findFirst({
    where: { userId, name: collectionName, type: "google_sheets" },
  });

  const dsConfig = JSON.stringify({
    sheetUrl,
    sheetId,
    gid,
    exportUrl,
    collectionSlug,
    headers: rawHeaders,
  });

  if (!dataSource) {
    dataSource = await prisma.dataSource.create({
      data: {
        userId,
        name: collectionName,
        type: "google_sheets",
        config: dsConfig,
        status: "syncing",
      },
    });
  } else {
    await prisma.dataSource.update({
      where: { id: dataSource.id },
      data: { config: dsConfig, status: "syncing" },
    });
  }

  // 4. Batch sync records into RecordItem (only for this user's collection)
  await prisma.recordItem.deleteMany({
    where: { collectionId: collection.id },
  });

  const batchSize = 500;
  let recordsAdded = 0;

  for (let i = 0; i < dataRows.length; i += batchSize) {
    const chunk = dataRows.slice(i, i + batchSize);
    const recordsToCreate = chunk.map((r) => {
      const recordData: Record<string, string> = {};
      fieldKeys.forEach((f, colIdx) => {
        recordData[f.key] = r[colIdx] || "";
      });
      return {
        collectionId: collection.id,
        createdById: userId,
        data: JSON.stringify(recordData),
      };
    });

    await prisma.recordItem.createMany({
      data: recordsToCreate,
    });
    recordsAdded += chunk.length;
  }

  const now = new Date();

  // 5. Update DataSource status
  await prisma.dataSource.update({
    where: { id: dataSource.id },
    data: {
      status: "success",
      lastSyncAt: now,
      errorDetails: null,
    },
  });

  // 6. Record SyncHistory
  const syncHistory = await prisma.syncHistory.create({
    data: {
      dataSourceId: dataSource.id,
      recordsProcessed: dataRows.length,
      recordsAdded,
      recordsUpdated: 0,
      status: "success",
    },
  });

  // 7. Audit log
  await logAuditEvent({
    userId,
    action: "SYNC_GOOGLE_SHEET",
    entityType: "DATA_SOURCE",
    entityId: dataSource.id,
    details: {
      sheetId,
      gid,
      collectionSlug,
      recordsAdded,
    },
  });

  return {
    success: true,
    sheetId,
    gid,
    collectionSlug,
    recordsAdded,
    totalRows: dataRows.length,
    headers: rawHeaders,
    lastSyncAt: now.toISOString(),
    syncHistoryId: syncHistory.id,
  };
}
