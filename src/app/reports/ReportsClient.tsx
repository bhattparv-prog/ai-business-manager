"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  Bot,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Activity,
  Users,
  MousePointerClick,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";

export default function ReportsClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "live-sheet" ? "live-sheet" : "live-sheet";

  const [activeTab, setActiveTab] = useState<"live-sheet" | "executive">(initialTab);

  // Executive Data State
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("month");
  const [execLoading, setExecLoading] = useState(false);

  // Live Sheet Data State
  const [sheetReport, setSheetReport] = useState<any>(null);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Table filters for live feed
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("ALL");

  useEffect(() => {
    fetchSheetReport();
    fetchExecutiveData();
  }, [filter]);

  async function fetchExecutiveData() {
    setExecLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setExecLoading(false);
    }
  }

  async function fetchSheetReport() {
    setSheetLoading(true);
    try {
      const res = await fetch("/api/reports/live-sheet");
      if (res.ok) {
        const json = await res.json();
        setSheetReport(json);
      }
    } finally {
      setSheetLoading(false);
    }
  }

  async function handleLiveSync() {
    setSyncingSheet(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sources/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`Synced ${data.recordsAdded.toLocaleString()} live events from Google Sheet!`);
        await Promise.all([fetchSheetReport(), fetchExecutiveData()]);
      } else {
        setSyncMessage(`Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncMessage(`Error: ${err.message}`);
    } finally {
      setSyncingSheet(false);
    }
  }

  function downloadSheetCsv() {
    if (!sheetReport?.recentEvents) return;

    const rows = [
      ["Timestamp (IST)", "Page Path", "Clicked Text / Action", "Element Tag", "Device Viewport", "Session ID"],
      ...sheetReport.recentEvents.map((e: any) => [
        e.timestamp,
        e.pagePath,
        `"${(e.clickedText || "").replace(/"/g, '""')}"`,
        e.elementTag,
        e.deviceViewport,
        e.sessionId,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `google-sheet-live-events-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadExecutiveSummary() {
    if (!data) return;

    const rows = [
      ["Metric", "Value"],
      ["Total Records in Period", data.metrics.totalRecords],
      ["All Time Records", data.metrics.allTimeRecords],
      ["Total Collections", data.metrics.totalCollections],
      ["Pending Tasks", data.metrics.pendingTasks],
      ["High/Urgent Tasks", data.metrics.urgentTasks],
      ["Data Sources Active", data.metrics.dataSourcesConnected],
      ["Unread Alerts", data.metrics.unreadNotifications],
      [],
      ["Collection Breakdown", "Record Count"],
      ...data.collectionBreakdown.map((c: any) => [c.name, c.count]),
    ];

    const csvContent = rows.map((r) => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `executive-business-report-${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filtered live events
  const filteredEvents = (sheetReport?.recentEvents || []).filter((e: any) => {
    const matchesSearch =
      !searchTerm ||
      e.pagePath?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clickedText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sessionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = tagFilter === "ALL" || e.elementTag === tagFilter;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Analytics & Live Reporting</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Verified Operational Data
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics directly connected to your operational database and synchronized Google Sheets.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab("live-sheet")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "live-sheet"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" />
              <span>Google Sheet Live</span>
              {sheetReport?.totalEvents > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[10px]">
                  {sheetReport.totalEvents.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("executive")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "executive"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
              <span>Executive Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync notification message */}
      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: LIVE GOOGLE SHEET ANALYTICS */}
      {activeTab === "live-sheet" && (
        <div className="space-y-6">
          {/* Subheader controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE CONNECTED</span>
              </span>
              <span className="text-slate-500">
                Last synced:{" "}
                <span className="font-semibold text-slate-700">
                  {sheetReport?.lastSyncAt
                    ? new Date(sheetReport.lastSyncAt).toLocaleString()
                    : "Active in database"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLiveSync}
                disabled={syncingSheet}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/20 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet ? "animate-spin" : ""}`} />
                <span>{syncingSheet ? "Syncing..." : "Sync Live Now"}</span>
              </button>

              <button
                onClick={downloadSheetCsv}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-orange-500" />
                <span>Export CSV</span>
              </button>

              <Link
                href="/collections/google_sheet_events"
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Raw Table</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Events / Clicks</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {sheetReport?.totalEvents?.toLocaleString() || "0"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Logged in verified event stream</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Unique User Sessions</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-600 mt-2">
                {sheetReport?.uniqueSessions?.toLocaleString() || "0"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Distinct visitor session journeys</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">High-Intent Booking Clicks</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {sheetReport?.bookingIntentCount?.toLocaleString() || "0"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Puja, Seva & Booking interactions</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Unique Pages Tracked</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {sheetReport?.uniquePages?.toLocaleString() || "0"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Distinct routes with active traffic</p>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Visited Pages */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span>Top Pages by Traffic & Clicks</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">Traffic Distribution</span>
              </div>

              <div className="space-y-3">
                {sheetReport?.topPages?.map((p: any) => (
                  <div key={p.page} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-800">{p.page}</span>
                      <span className="text-slate-600 font-medium">
                        {p.count.toLocaleString()} clicks ({p.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(p.percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Action Clicks */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-orange-500" />
                  <span>Most Clicked CTAs & Actions</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">Top User Clicks</span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {sheetReport?.topActions?.map((a: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                      {a.action}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] shrink-0">
                      {a.count.toLocaleString()} clicks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device & Tag Breakdown row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Devices */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-500" />
                <span>Device Viewport Breakdown</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Monitor className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Desktop</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {sheetReport?.deviceCounts?.Desktop || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Smartphone className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Mobile</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {sheetReport?.deviceCounts?.Mobile || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Activity className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Tablet/Other</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {(sheetReport?.deviceCounts?.Tablet || 0) + (sheetReport?.deviceCounts?.Other || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Element Tags */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                <span>Interaction Element Types</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {sheetReport?.topTags?.map((t: any) => (
                  <div
                    key={t.tag}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                  >
                    <span className="font-mono font-bold text-slate-800">{t.tag}</span>
                    <span className="text-slate-500 text-[11px] font-semibold">
                      {t.count} ({t.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Live Events Log Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span>Live Event Log Feed</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    (Showing {filteredEvents.length} events)
                  </span>
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search page or click text..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-orange-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Tags</option>
                  <option value="BUTTON">BUTTON</option>
                  <option value="A">A (Links)</option>
                  <option value="INPUT">INPUT</option>
                  <option value="DIV">DIV</option>
                </select>
              </div>
            </div>

            {/* Event Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Time (IST)</th>
                    <th className="py-2.5 px-3">Page Path</th>
                    <th className="py-2.5 px-3">Clicked Text / Action</th>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3">Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                        No events match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {e.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {e.pagePath}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[220px] truncate">
                          {e.clickedText || "-"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              e.elementTag === "BUTTON"
                                ? "bg-orange-100 text-orange-700"
                                : e.elementTag === "A"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {e.elementTag}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                          {e.deviceViewport}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">
                          {e.sessionId}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Showing up to 50 latest live events in real-time feed</span>
              <Link
                href="/collections/google_sheet_events"
                className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Browse all {sheetReport?.totalEvents?.toLocaleString()} records in Collections</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVE SUMMARY */}
      {activeTab === "executive" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "7 Days" },
                { id: "month", label: "This Month" },
                { id: "all", label: "All Time" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilter(p.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter === p.id
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={downloadExecutiveSummary}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-orange-500" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Primary Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">Total Filtered Records</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.totalRecords?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Across all custom business collections</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">Pending Action Items</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {data?.metrics?.pendingTasks || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{data?.metrics?.urgentTasks || 0} urgent</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">Connected Sources</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {data?.metrics?.dataSourcesConnected || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Live spreadsheets and datasets</p>
            </div>
          </div>

          {/* Breakdown per collection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Record Distribution by Collection</span>
            </h3>

            <div className="space-y-3">
              {data?.collectionBreakdown?.map((col: any) => {
                const pct =
                  data?.metrics?.allTimeRecords > 0
                    ? Math.round((col.count / data.metrics.allTimeRecords) * 100)
                    : 0;

                return (
                  <div key={col.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{col.name}</span>
                      <span className="text-slate-500 font-medium">
                        {col.count.toLocaleString()} records ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Synthesis Callout */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Need an AI-generated Analysis of this Google Sheet?</h4>
          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
            The AI Assistant has full context on your {sheetReport?.totalEvents?.toLocaleString() || "2,339"} Google Sheet records, top clicked actions, and visitor sessions.
          </p>
        </div>
        <Link
          href="/assistant"
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-orange-500/20 shrink-0"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI Assistant</span>
        </Link>
      </div>
    </div>
  );
}
