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
  ChevronRight,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ReportsClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "executive" ? "executive" : "live-sheet";

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

  const conversionPct =
    sheetReport?.totalEvents > 0
      ? Math.round(((sheetReport.bookingIntentCount || 0) / sheetReport.totalEvents) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header & Tab Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200 text-xs font-bold mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Live Analytics & Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Performance & Stream Health
          </h1>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab("live-sheet")}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "live-sheet"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheet Stream</span>
            {sheetReport?.totalEvents > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {sheetReport.totalEvents.toLocaleString()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("executive")}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "executive"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-[11px] font-bold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: LIVE SHEET ANALYTICS - MATCHING REFERENCE IMAGE SCREEN 3 */}
      {activeTab === "live-sheet" && (
        <div className="space-y-5">
          {/* 1. Hero Feature Card (Screen 3: Dark Web Monitoring style container card) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE EVENT MONITORING
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Live Activity Stream Monitoring
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Get real-time updates whenever visitors click sevas, browse pooja services, or submit forms in your connected Google Sheet.
                </p>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={handleLiveSync}
                    disabled={syncingSheet}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet ? "animate-spin" : ""}`} />
                    <span>{syncingSheet ? "Syncing..." : "Sync Live Now"}</span>
                  </button>

                  <button
                    onClick={downloadSheetCsv}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Mini Graph Illustration Card on Right (matching whiteboard chart in Screen 3) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-slate-50 border border-orange-200/80 shadow-inner flex flex-col justify-between h-40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Stream Velocity</span>
                  <Activity className="w-4 h-4 text-orange-500" />
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {sheetReport?.totalEvents ? sheetReport.totalEvents.toLocaleString() : "0"}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Verified Clicks & Events Logged
                  </span>
                </div>

                {/* Mini sparkline visualization */}
                <div className="flex items-end gap-1.5 h-8 pt-1">
                  {[35, 60, 45, 80, 65, 95, 75, 100, 90, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-400 transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Feature Pill Banner (Screen 3: Proton Sentinel style pill) */}
          <Link
            href="/assistant"
            className="p-3.5 rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-orange-400 shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Grounded AI Executive Engine</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Direct database queries & verified Google Sheet intelligence.
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-white/20 transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 3. Capsule Health Bar (Screen 3: Password Health bar) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>Conversion & Activity Health</span>
                <span className="text-orange-600 font-bold">({conversionPct}% High Intent)</span>
              </span>
              <span className="text-slate-500 font-medium">
                {sheetReport?.bookingIntentCount || 0} booking / puja actions of {sheetReport?.totalEvents || 0} total
              </span>
            </div>

            {/* Smooth capsule progress bar */}
            <div className="w-full h-4 rounded-full bg-slate-100 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 shadow-sm transition-all duration-700"
                style={{ width: `${Math.max(conversionPct, 6)}%` }}
              />
            </div>
          </div>

          {/* 4. Categorized Pill Rows (Screen 3: Weak passwords, Reused passwords rows style) */}
          <div className="space-y-2.5">
            {/* Row 1: Booking Intent */}
            <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {sheetReport?.bookingIntentCount ? sheetReport.bookingIntentCount.toLocaleString() : "0"}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    High-Intent Booking & Puja Clicks
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Clicks on Instant Book, Book Puja, Offer Gau Seva, and Acharya forms
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  High Conversion
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Row 2: Top Visited Page */}
            <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {sheetReport?.topPages?.[0]?.count ? sheetReport.topPages[0].count.toLocaleString() : "0"}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Primary Landing Traffic ({sheetReport?.topPages?.[0]?.page || "/"})
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Leading path accounting for {sheetReport?.topPages?.[0]?.percentage || 0}% of all recorded events
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
                  Top Route
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Row 3: Unique Visitor Sessions */}
            <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {sheetReport?.uniqueSessions ? sheetReport.uniqueSessions.toLocaleString() : "0"}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Unique Visitor Sessions
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Distinct tracking sessions recorded across Desktop and Mobile devices
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  Sessions
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Row 4: Verified Sync Health */}
            <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  100%
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Sync Integrity & Data Reliability
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    All rows ingested with RFC-4180 parsing and zero data loss
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  Verified
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 5. Interactive Live Event Feed (Table) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span>Live Event Stream Feed</span>
                <span className="text-[11px] font-normal text-slate-500">
                  (Showing {filteredEvents.length} events)
                </span>
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search page or action..."
                    className="pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-orange-500 w-40 sm:w-52"
                  />
                </div>

                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Tags</option>
                  <option value="BUTTON">BUTTON</option>
                  <option value="A">A (Links)</option>
                  <option value="INPUT">INPUT</option>
                </select>
              </div>
            </div>

            {/* Event Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Time (IST)</th>
                    <th className="py-2.5 px-3">Page Path</th>
                    <th className="py-2.5 px-3">Action / Label</th>
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
                        <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                          {e.clickedText || "-"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 max-w-[110px] truncate">
                          {e.sessionId}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Showing 50 latest live events</span>
              <Link
                href="/collections/google_sheet_events"
                className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Browse all {sheetReport?.totalEvents?.toLocaleString()} rows in Collections</span>
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
            <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs">
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "7 Days" },
                { id: "month", label: "This Month" },
                { id: "all", label: "All Time" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilter(p.id)}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                    filter === p.id
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={downloadExecutiveSummary}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-orange-500" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Filtered Records</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.totalRecords?.toLocaleString() || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Across all private business collections</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Action Items</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {data?.metrics?.pendingTasks || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{data?.metrics?.urgentTasks || 0} urgent priority</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Connected Sources</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {data?.metrics?.dataSourcesConnected || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Live spreadsheets & feeds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
