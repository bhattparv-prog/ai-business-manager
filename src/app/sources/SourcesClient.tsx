"use client";

import { useState, useEffect } from "react";
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Layers,
  History,
} from "lucide-react";

export default function SourcesClient() {
  const [sources, setSources] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Import State
  const [selectedCol, setSelectedCol] = useState("");
  const [sourceName, setSourceName] = useState("CSV Dataset Import");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
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

    // Auto-map matching field names
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
      setCsvText("");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Data Sources & Import</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
              CSV & Google Sheets
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect external spreadsheets or upload structured CSV files directly into custom collections.
          </p>
        </div>
      </div>

      {/* CSV Import Flow Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Import Records from CSV / Spreadsheet</h2>
            <p className="text-xs text-slate-400">Preview and map columns before saving to database</p>
          </div>
        </div>

        {importResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              importResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {importResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Destination Collection
            </label>
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Column Mapping Table */}
        {headers.length > 0 && activeCollection && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200">
              Map CSV Columns to Collection Fields ({parsedRows.length} rows detected)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {activeCollection.fields?.map((f: any) => (
                <div
                  key={f.key}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-200">
                    {f.name} <span className="text-[10px] text-slate-500">({f.type})</span>
                  </span>
                  <select
                    value={columnMapping[f.key] || ""}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [f.key]: e.target.value })
                    }
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
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

            {/* Preview First 3 Rows */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Data Preview (First 3 rows)
              </span>
              <div className="mt-1 overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="py-2 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                    {parsedRows.slice(0, 3).map((r, i) => (
                      <tr key={i}>
                        {headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-slate-300">
                            {r[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>{importing ? "Importing records..." : "Import into Database"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync History */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <History className="w-4 h-4 text-sky-400" />
          <h2 className="font-semibold text-sm text-slate-100">Data Synchronization History</h2>
        </div>

        <div className="mt-3 divide-y divide-slate-800/60">
          {sources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No sources connected yet.</p>
          ) : (
            sources.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{s.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Type: <span className="uppercase font-mono">{s.type}</span> • Status:{" "}
                    <span className="text-emerald-400 font-semibold">{s.status}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
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
