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

  if (rows.length < 2) {
    throw new Error("Google Sheet does not contain enough data (less than 2 rows).");
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

  if (!collection) {
    collection = await prisma.collectionDefinition.create({
      data: {
        userId,
        name: collectionName,
        slug: collectionSlug,
        description: `Live synchronized data from Google Sheet (${sheetId}, tab gid: ${gid})`,
        icon: "FileSpreadsheet",
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
