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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Data Sources & Import</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              CSV & Google Sheets
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect external spreadsheets or upload structured CSV files directly into custom collections.
          </p>
        </div>
      </div>

      {/* CSV Import Flow Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Import Records from CSV / Spreadsheet</h2>
            <p className="text-xs text-slate-500 font-medium">Preview and map columns before saving to database</p>
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

            {/* Preview First 3 Rows */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Data Preview (First 3 rows)
              </span>
              <div className="mt-1 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="py-2.5 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.slice(0, 3).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-slate-700">
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
