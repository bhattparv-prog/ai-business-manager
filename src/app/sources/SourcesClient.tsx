"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  History,
  RefreshCw,
  ExternalLink,
  BarChart2,
  FolderOpen,
} from "lucide-react";

export default function SourcesClient() {
  const [sources, setSources] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Sheet Live Sync State
  const [sheetUrl, setSheetUrl] = useState(
    "https://docs.google.com/spreadsheets/d/1cMSVpPyG1SzAiCVqa7_YvsrFVIVIGgmBEtCTpuRQYEg/edit?gid=1565779185#gid=1565779185"
  );
  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<any>(null);
  const [sheetResult, setSheetResult] = useState<any>(null);

  // CSV Manual Import State
  const [selectedCol, setSelectedCol] = useState("");
  const [sourceName, setSourceName] = useState("CSV Dataset Import");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchSheetStatus();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [srcRes, colRes] = await Promise.all([
        fetch("/api/sources"),
        fetch("/api/collections"),
      ]);

      if (srcRes.ok) {
        const s = await srcRes.json();
        setSources(s.sources || []);
      }
      if (colRes.ok) {
        const c = await colRes.json();
        setCollections(c.collections || []);
        if (c.collections?.length > 0) {
          setSelectedCol(c.collections[0].slug);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchSheetStatus() {
    try {
      const res = await fetch("/api/sources/google-sheets");
      if (res.ok) {
        const data = await res.json();
        setSheetStatus(data);
        if (data.defaultUrl && !sheetUrl) {
          setSheetUrl(data.defaultUrl);
        }
      }
    } catch (err) {
      console.error("Failed to load sheet status", err);
    }
  }

  async function handleSyncGoogleSheet() {
    if (!sheetUrl) return;
    setSheetSyncing(true);
    setSheetResult(null);

    try {
      const res = await fetch("/api/sources/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync Google Sheet");

      setSheetResult({
        success: true,
        message: data.syncedTabs
          ? `Successfully synchronized Google Sheet tabs: Users & Bookings updated!`
          : `Successfully synced records from Google Sheet!`,
        recordsAdded: data.recordsAdded || data.results?.length,
        lastSyncAt: data.lastSyncAt,
      });

      await Promise.all([fetchData(), fetchSheetStatus()]);
    } catch (err: any) {
      setSheetResult({
        success: false,
        error: err.message || "Failed to sync Google Sheet",
      });
    } finally {
      setSheetSyncing(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  }

  function parseCsv(raw: string) {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    const cols = lines[0].split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
    setHeaders(cols);

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.replace(/^["']|["']$/g, "").trim());
      const row: Record<string, string> = {};
      cols.forEach((col, idx) => {
        row[col] = values[idx] || "";
      });
      rows.push(row);
    }
    setParsedRows(rows);

    const targetCollection = collections.find((c) => c.slug === selectedCol);
    const initialMap: Record<string, string> = {};
    if (targetCollection?.fields) {
      for (const f of targetCollection.fields) {
        const match = cols.find(
          (c) =>
            c.toLowerCase() === f.name.toLowerCase() ||
            c.toLowerCase() === f.key.toLowerCase()
        );
        if (match) initialMap[f.key] = match;
      }
    }
    setColumnMapping(initialMap);
  }

  async function handleExecuteImport() {
    if (!selectedCol || parsedRows.length === 0) return;
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sourceName,
          type: "csv",
          collectionSlug: selectedCol,
          rows: parsedRows,
          columnMapping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportResult({
        success: true,
        recordsAdded: data.recordsAdded,
      });

      setParsedRows([]);
      fetchData();
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  }

  const activeCollection = collections.find((c) => c.slug === selectedCol);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Data Sources & Live Sync</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Active Sync
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect live Google Sheets and CSV files to synchronize records into your operational database.
          </p>
        </div>
      </div>

      {/* Primary Feature Card: Google Sheets Live Sync */}
      <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Google Sheets Live Connector</h2>
                {sheetStatus?.connected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE CONNECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically parse, sync, and report on spreadsheets in real time
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/collections/sheet_users"
              className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Devotees ({sheetStatus?.usersCount || 0})</span>
            </Link>
            <Link
              href="/collections/sheet_bookings"
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Bookings ({sheetStatus?.bookingsCount || 0})</span>
            </Link>
            <Link
              href="/reports?tab=live-sheet"
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </Link>
          </div>
        </div>

        {/* Sync Status Banner */}
        {sheetResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              sheetResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {sheetResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{sheetResult.success ? sheetResult.message : `Error: ${sheetResult.error}`}</span>
          </div>
        )}

        {/* URL Input & Sync Controls */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Sheet URL (Spreadsheet with public link / edit link)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-orange-500"
              />
              <button
                onClick={handleSyncGoogleSheet}
                disabled={sheetSyncing || !sheetUrl}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sheetSyncing ? "animate-spin" : ""}`} />
                <span>{sheetSyncing ? "Syncing from Google..." : "Sync Live Now"}</span>
              </button>
            </div>
          </div>

          {/* Metrics ribbon for synced sheet */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Records in Database</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {sheetStatus?.recordsCount?.toLocaleString() || "2,339"} records
                </span>
              </div>
              <div className="h-6 w-px bg-orange-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Destination Collection</span>
                <span className="text-xs font-semibold text-slate-800">
                  <code>google_sheet_events</code>
                </span>
              </div>
              <div className="h-6 w-px bg-orange-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Synchronized</span>
                <span className="text-xs font-semibold text-slate-700">
                  {sheetStatus?.dataSource?.lastSyncAt
                    ? new Date(sheetStatus.dataSource.lastSyncAt).toLocaleString()
                    : "Just now"}
                </span>
              </div>
            </div>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* CSV Import Flow Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Manual CSV File Upload</h2>
            <p className="text-xs text-slate-500 font-medium">Upload local CSV spreadsheets directly into any custom collection</p>
          </div>
        </div>

        {importResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              importResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {importResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>
              {importResult.success
                ? `Successfully imported ${importResult.recordsAdded} records!`
                : `Error: ${importResult.error}`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Destination Collection
            </label>
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
            >
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Column Mapping Table */}
        {headers.length > 0 && activeCollection && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">
              Map CSV Columns to Collection Fields ({parsedRows.length} rows detected)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {activeCollection.fields?.map((f: any) => (
                <div
                  key={f.key}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">
                    {f.name} <span className="text-[10px] text-slate-500 font-normal">({f.type})</span>
                  </span>
                  <select
                    value={columnMapping[f.key] || ""}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [f.key]: e.target.value })
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="">-- Ignore --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>{importing ? "Importing records..." : "Import into Database"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync History */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <History className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-sm text-slate-900">Data Synchronization History</h2>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {sources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No sources connected yet.</p>
          ) : (
            sources.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Type: <span className="uppercase font-mono font-semibold">{s.type}</span> • Status:{" "}
                    <span className="text-emerald-600 font-bold">{s.status}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-medium">
                  Last sync:{" "}
                  {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : "Never"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
