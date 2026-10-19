"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  CheckSquare,
  Bell,
  Database,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Search,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStats();
  }, [filter]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const metrics = data?.metrics || {
    totalRecords: 0,
    allTimeRecords: 0,
    totalCollections: 0,
    totalTasks: 0,
    pendingTasks: 0,
    urgentTasks: 0,
    unreadNotifications: 0,
    dataSourcesConnected: 0,
  };

  const collections = data?.collectionBreakdown || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Dynamic Big Headline matching reference image Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200 text-xs font-bold mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Executive Business Manager</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Run{" "}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-base sm:text-lg font-bold shadow-sm shadow-orange-500/20 align-middle">
              ⚡ Live
            </span>
            <br />
            <span className="text-slate-400 font-light">##</span> Your Business
            <br />
            Smart{" "}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-base sm:text-lg font-bold shadow-sm align-middle">
              💼 AI
            </span>
          </h1>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-semibold self-start sm:self-auto">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "Month" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                filter === item.id
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={fetchStats}
            title="Refresh live data"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Rounded Pill Search Bar matching reference image Screen 2 */}
      <div className="rounded-full bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, spreadsheets, tasks, or operations..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
          />
        </div>
        <Link
          href="/collections"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-500 flex items-center justify-center transition-colors shrink-0"
          title="Browse collections"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. Magic Highlight Card matching reference image Screen 2 ("Enjoy the magic of ...") */}
      <Link
        href="/reports?tab=live-sheet"
        className="block p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.08] to-white border-2 border-orange-200/90 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Live Google Sheet Synchronization
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SYNC ACTIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                {metrics.totalRecords > 0
                  ? `${metrics.totalRecords.toLocaleString()} verified operational event rows logged & reported in real-time.`
                  : "Connect your live spreadsheet or CSV dataset in Data Sources to activate."}
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:border-orange-300 transition-all shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* 4. Section Header matching reference image ("Today" / "See All") */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Active Workflows & Sources</h2>
        <Link
          href="/collections"
          className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
        >
          See All ({collections.length})
        </Link>
      </div>

      {/* 5. Stacked Capsule Cards matching reference image Screen 2 (Netflix, Proton VPN, Google rows) */}
      <div className="space-y-3">
        {/* Row 1: Google Sheet Live Stream */}
        <Link
          href="/reports?tab=live-sheet"
          className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Google Sheet Live Stream
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {metrics.totalRecords > 0 ? `${metrics.totalRecords.toLocaleString()} records • Live feed active` : "Ready to connect"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-100 hidden sm:inline-block">
              ● Connected
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Dynamic Collections Rows */}
        {collections.map((col: any) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-xs shrink-0">
                {col.slug === "projects" ? (
                  <Briefcase className="w-5 h-5" />
                ) : col.slug === "leads" ? (
                  <Users className="w-5 h-5" />
                ) : (
                  <FolderOpen className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {col.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {col.count.toLocaleString()} records • Custom dynamic collection
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] hidden sm:inline-block">
                {col.count} items
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}

        {/* Row: Tasks & Reminders */}
        <Link
          href="/tasks"
          className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Action Items & Reminders
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {metrics.pendingTasks} pending tasks • {metrics.urgentTasks} urgent
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {metrics.urgentTasks > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                {metrics.urgentTasks} Urgent
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* 6. Executive KPI Mini-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Records
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {metrics.allTimeRecords.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            Across {metrics.totalCollections} collections
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Pending Tasks
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {metrics.pendingTasks}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            {metrics.urgentTasks} marked urgent
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Data Sources
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {metrics.dataSourcesConnected}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            Live sync connected
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Unread Alerts
          </span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">
            {metrics.unreadNotifications}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            Notifications pending
          </span>
        </div>
      </div>

      {/* 7. AI Executive Callout matching reference design */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Grounded AI Business Assistant
            </h3>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Need an executive summary or instant data breakdown?
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your assistant queries real SQLite records, calculates exact statistics, and prepares reports.
          </p>
        </div>

        <Link
          href="/assistant"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all shrink-0"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
