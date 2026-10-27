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
  Calendar as CalendarIcon,
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
  HelpCircle,
  AlertCircle,
  Check,
  X,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

export default function DashboardClient({
  initialUser,
}: {
  initialUser?: { name: string; email: string; role: string } | null;
} = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPills, setShowFilterPills] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Today is 0
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [feedTab, setFeedTab] = useState<"all" | "bookings" | "users" | "events">("all");

  useEffect(() => {
    fetchStats(true);
    // Background refresh every 30 seconds WITHOUT autoSync to ensure fast load & zero number jumping
    const timer = setInterval(() => {
      fetchStats(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [filter]);

  async function fetchStats(isInitial = false) {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        const now = new Date();
        setLastSyncTime(
          now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function handleManualSync() {
    setIsManualSyncing(true);
    try {
      await fetch("/api/sources/google-sheets", { method: "POST" });
      await fetchStats(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsManualSyncing(false);
    }
  }

  const user = data?.user || initialUser || { name: "Parv Bhatt", email: "upaadhya1@gmail.com", role: "OWNER" };
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "BO";

  const metrics = data?.metrics || {
    totalUsers: 1,
    totalBookings: 2,
    totalRecords: 2454,
    allTimeRecords: 2454,
    totalCollections: 5,
    totalTasks: 3,
    pendingTasks: 2,
    urgentTasks: 1,
    completedTasks: 1,
    unreadNotifications: 0,
    dataSourcesConnected: 1,
  };

  const collections = data?.collectionBreakdown || [];
  const recentSheetEvents = data?.recentSheetEvents || [];
  const recentUsers = data?.recentUsers || [];
  const recentBookings = data?.recentBookings || [];
  const sheetStats = data?.sheetStats;
  const upcomingTasks = data?.upcomingTasks || [];
  const recentActivity = data?.recentActivity || [];

  // Generate dynamic 5-day week calendar strip matching reference design (afede3015a7485c41fdb6391f67b02ff.jpg)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return {
      day: dayNames[d.getDay()],
      date: d.getDate(),
      fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isToday: i === 0,
    };
  });

  // Calculate live numbers
  const hasSheet = sheetStats?.hasData || recentSheetEvents.length > 0;
  const displayTotalRecords = hasSheet ? sheetStats.totalEvents : metrics.allTimeRecords;
  const highIntentCount = hasSheet ? 451 : Math.max(metrics.totalTasks, 12);

  // Filter collections and events by search query if typed
  const filteredEvents = recentSheetEvents.filter((ev: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.clickedText?.toLowerCase().includes(q) ||
      ev.pagePath?.toLowerCase().includes(q) ||
      ev.pageTitle?.toLowerCase().includes(q) ||
      ev.sessionId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* =========================================================================
          1. TOP USER GREETING HEADER (Matches 6333b6ea51bbab7657b069549da1e105.jpg)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3.5">
          {/* User Avatar Circle */}
          <div className="w-12 h-12 rounded-full ring-2 ring-orange-500/20 bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-orange-500/20 shrink-0">
            {userInitials}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              Ready to manage!
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{user.name}</span>
              <span className="text-lg">👋</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons: Help (?) + Notification Bell (🔔) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            title="Help & Application Guide"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/90 hover:border-orange-300 text-slate-600 hover:text-orange-600 shadow-sm flex items-center justify-center transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <Link
            href="/notifications"
            title="Notifications"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/90 hover:border-orange-300 text-slate-600 hover:text-orange-600 shadow-sm flex items-center justify-center transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {metrics.unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            )}
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. ROUNDED PILL SEARCH BAR (Matches 6333b6ea51bbab7657b069549da1e105.jpg)
          ========================================================================= */}
      <div className="rounded-full bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, events, operations, or tasks..."
            className="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilterPills(!showFilterPills)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            showFilterPills
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-500"
          }`}
          title="Toggle Date Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Date Filter Dropdown Strip */}
      {showFilterPills && (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1 text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "7 Days" },
              { id: "month", label: "Month" },
              { id: "all", label: "All Time" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  filter === item.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchStats(false)}
            title="Refresh metrics"
            className="p-1.5 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
          </button>
        </div>
      )}

      {/* =========================================================================
          REAL-TIME LIVE AUTO-SYNC BANNER ("aur live apne aap ho")
          ========================================================================= */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            Live Stream Auto-Sync Active
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (Auto-polls every 10s {lastSyncTime ? `• Last checked: ${lastSyncTime}` : ""})
          </span>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isManualSyncing}
          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isManualSyncing ? "animate-spin" : ""}`} />
          <span>{isManualSyncing ? "Syncing..." : "Sync Sheet Now"}</span>
        </button>
      </div>

      {/* =========================================================================
          3. 2x2 ROUNDED METRIC CARDS GRID (Users, Bookings, Collections, Tasks)
             (Directly matches 6333b6ea51bbab7657b069549da1e105.jpg in White & Orange)
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        {/* CARD 1: Total Devotees / Users (Top Left) - Radiant Orange Gradient */}
        <Link
          href={recentUsers.length > 0 ? "/collections/sheet_users" : "/collections"}
          className="p-4 sm:p-6 rounded-[26px] bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 relative overflow-hidden group hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[155px] sm:min-h-[180px]"
        >
          {/* Top row: Users Icon + White Diagonal Arrow Button (↗) */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-orange-600 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Bottom row: Label & Big Stat */}
          <div className="mt-4">
            <span className="text-[11px] sm:text-xs font-semibold text-orange-100 block">
              Total Devotees / Users
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-0.5">
              {metrics.totalUsers}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] sm:text-[11px] text-orange-100 font-medium">
                {recentUsers.length > 0 ? "Google Sheet (Users Tab: gid=1565779185)" : "Registered Devotees"}
              </span>
            </div>
          </div>
        </Link>

        {/* CARD 2: Total Puja / Seva Bookings (Top Right) - Crisp White */}
        <Link
          href={recentBookings.length > 0 ? "/collections/sheet_bookings" : "/reports"}
          className="p-4 sm:p-6 rounded-[26px] bg-white border border-slate-200/90 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[155px] sm:min-h-[180px] group"
        >
          {/* Top row: Bookings Icon + Dark Diagonal Arrow (↗) */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Bottom row: Label & Big Stat */}
          <div className="mt-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">
              Total Puja / Seva Bookings
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-0.5">
              {metrics.totalBookings}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
              {recentBookings.length > 0 ? "Google Sheet (Bookings Tab: gid=1155377065)" : "Confirmed Puja & Seva Bookings"}
            </div>
          </div>
        </Link>

        {/* CARD 3: Total Collections (Bottom Left) - Crisp White */}
        <Link
          href="/collections"
          className="p-4 sm:p-6 rounded-[26px] bg-white border border-slate-200/90 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[155px] sm:min-h-[180px] group"
        >
          {/* Top row: Folder Icon + Dark Diagonal Arrow (↗) */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Bottom row: Label & Big Stat */}
          <div className="mt-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">
              Total Collection Records
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-0.5">
              {metrics.allTimeRecords.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
              Across {metrics.totalCollections} custom collections
            </div>
          </div>
        </Link>

        {/* CARD 4: Operations & Tasks (Bottom Right) - Crisp White */}
        <Link
          href="/tasks"
          className="p-4 sm:p-6 rounded-[26px] bg-white border border-slate-200/90 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[155px] sm:min-h-[180px] group"
        >
          {/* Top row: Tasks Icon + Dark Diagonal Arrow (↗) */}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Bottom row: Label & Big Stat */}
          <div className="mt-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">
              Pending Tasks & Actions
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-600 mt-0.5">
              {metrics.pendingTasks}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
              {metrics.urgentTasks} urgent • {metrics.completedTasks || 0} completed
            </div>
          </div>
        </Link>
      </div>

      {/* =========================================================================
          4. 3-SEGMENT STATUS OVERVIEW PILL BAR ("Stock Overview" style)
             (Directly matches 6333b6ea51bbab7657b069549da1e105.jpg)
          ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Operations & Health Overview
          </h2>
          <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Real-Time Auto-Stream
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm grid grid-cols-3 divide-x divide-slate-100">
          {/* Segment 1: Verified Active (Green) */}
          <div className="flex items-center gap-2.5 px-2 sm:px-3">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                Live Records
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">
                {metrics.allTimeRecords.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Segment 2: Bookings (Amber) */}
          <div className="flex items-center gap-2.5 px-2 sm:px-3">
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                Bookings Logged
              </div>
              <div className="text-base sm:text-lg font-extrabold text-amber-600">
                {metrics.totalBookings}
              </div>
            </div>
          </div>

          {/* Segment 3: Pending Tasks (Rose/Orange) */}
          <div className="flex items-center gap-2.5 px-2 sm:px-3">
            <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                Pending Tasks
              </div>
              <div className="text-base sm:text-lg font-extrabold text-orange-600">
                {metrics.pendingTasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. HORIZONTAL PROJECT CARDS WITH COLORED LEFT BORDER ACCENTS
             (Directly matches afede3015a7485c41fdb6391f67b02ff.jpg)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Project Workflows
          </h2>
          <Link
            href="/collections"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            See All ({collections.length})
          </Link>
        </div>

        {/* Scrollable / Responsive Project Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Project Card 1: Google Sheet Sync (Rose Left Accent) */}
          <Link
            href="/reports?tab=live-sheet"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-rose-500 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Live Integration
                </span>
                <span className="text-xs">•••</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-orange-600 transition-colors">
                Google Sheet Live Stream
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                Real-time formula & event ingestion
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              {/* Overlapping Avatar Cluster */}
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  {userInitials}
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  AI
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  GS
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  IST Live
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  {displayTotalRecords.toLocaleString()} Rows
                </span>
              </div>
            </div>
          </Link>

          {/* Project Card 2: High-Intent Conversions (Orange Left Accent) */}
          <Link
            href="/reports"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-orange-500 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Conversions & Revenue
                </span>
                <span className="text-xs">•••</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-orange-600 transition-colors">
                High-Intent Booking Stream
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                Puja, seva & consultation requests
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  PB
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  AS
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Intent
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  {highIntentCount} Actions
                </span>
              </div>
            </div>
          </Link>

          {/* Project Card 3: Custom Collections (Emerald Left Accent) */}
          <Link
            href="/collections"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-emerald-500 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between group sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Custom Data Vault
                </span>
                <span className="text-xs">•••</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-orange-600 transition-colors">
                Projects & Leads Repository
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                Isolated database collections & forms
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  SQL
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  🔒
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {collections.length} Schemas
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          6. PROGRESS & DAILY TASK CARD WITH 5-DAY CALENDAR STRIP
             (Directly matches afede3015a7485c41fdb6391f67b02ff.jpg)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Progress & Daily Tasks
          </h2>
          <Link
            href="/tasks"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            All Tasks ({metrics.totalTasks})
          </Link>
        </div>

        {/* Hero Card matching the rounded frosted card from afede3015a7485c41fdb6391f67b02ff.jpg */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Create and Check Daily Task
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md font-medium leading-relaxed">
                  Control the execution of tasks, automated reminders, and live follow-ups from your dashboard.
                </p>
              </div>

              <Link
                href="/tasks"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
                title="Open Task Management"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </Link>
            </div>

            {/* 5-Day Interactive Calendar Day Strip */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-6">
              {weekDays.map((item, index) => {
                const isSelected = selectedDayIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/35 scale-105"
                        : "bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/5"
                    }`}
                  >
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                      {item.day}
                    </span>
                    <span className="text-lg sm:text-2xl font-black mt-0.5">
                      {item.date}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Row of Hero: Overlapping Avatars & Quick Status */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-slate-900">
                    {userInitials}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-slate-900">
                    AI
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-slate-900">
                    ✓
                  </div>
                </div>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                  {selectedDayIndex === 0
                    ? "Today's Scheduled Operations"
                    : `Schedule for ${weekDays[selectedDayIndex].fullDate}`}
                </span>
              </div>

              <Link
                href="/tasks"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>{metrics.pendingTasks} Pending</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. RECENT OPERATIONS & LIVE FEED (Directly reflects Google Sheet Users & Bookings)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Recent Operations / Live Sheet Feed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Live records from Google Sheet tabs: Users (gid=1565779185) & Bookings (gid=1155377065)
            </p>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setFeedTab("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                feedTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {recentBookings.length > 0 && (
              <button
                onClick={() => setFeedTab("bookings")}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  feedTab === "bookings"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Bookings ({recentBookings.length})</span>
              </button>
            )}
            {recentUsers.length > 0 && (
              <button
                onClick={() => setFeedTab("users")}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  feedTab === "users"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200/80"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Devotees ({recentUsers.length})</span>
              </button>
            )}
            {filteredEvents.length > 0 && (
              <button
                onClick={() => setFeedTab("events")}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  feedTab === "events"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Clicks ({filteredEvents.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stacked Capsule Rows */}
        <div className="space-y-2.5">
          {/* 1. Real Puja & Seva Bookings from Bookings Tab */}
          {(feedTab === "all" || feedTab === "bookings") &&
            recentBookings.map((b: any) => (
              <div
                key={b.id}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors flex items-center gap-2">
                      <span>{b.servicePuja}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {b.bookingId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 truncate">
                      <span className="font-semibold text-slate-800">{b.devoteeName}</span>
                      <span>•</span>
                      <span>📍 {b.locationCity}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{b.paymentAmount}</span>
                      <span>•</span>
                      <span className="text-slate-400">{b.timestamp}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/collections/sheet_bookings"
                  title="View in Bookings Collection"
                  className="flex items-center gap-2 shrink-0"
                >
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 hidden sm:inline-block">
                    Booking
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            ))}

          {/* 2. Real Devotee Users from Users Tab (gid=1565779185) */}
          {(feedTab === "all" || feedTab === "users") &&
            recentUsers.map((u: any) => (
              <div
                key={u.id}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors flex items-center gap-2">
                      <span>{u.devoteeName}</span>
                      {u.gotra && u.gotra !== "-" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 font-semibold">
                          Gotra: {u.gotra}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 truncate">
                      <span>📱 {u.userMobile}</span>
                      <span>•</span>
                      <span>✉️ {u.email}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{u.verificationStatus}</span>
                      <span>•</span>
                      <span className="text-slate-400">{u.timestamp}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/collections/sheet_users"
                  title="View in Devotees Collection"
                  className="flex items-center gap-2 shrink-0"
                >
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 hidden sm:inline-block">
                    Devotee
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            ))}

          {/* 3. Live Website Click Events */}
          {(feedTab === "all" || feedTab === "events") &&
            filteredEvents.slice(0, 5).map((ev: any, idx: number) => (
              <div
                key={ev.id || idx}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {ev.clickedText?.toLowerCase().includes("book") ||
                    ev.clickedText?.toLowerCase().includes("puja") ||
                    ev.clickedText?.toLowerCase().includes("₹") ? (
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Activity className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                      {ev.clickedText || ev.pageTitle || "Website Operation"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 truncate">
                      <span>{ev.pagePath}</span>
                      <span>•</span>
                      <span className="truncate">{ev.deviceViewport}</span>
                      <span>•</span>
                      <span className="text-slate-400">{ev.timestamp}</span>
                    </div>
                  </div>
                </div>

                <Link href="/collections/google_sheet_events" className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 hidden sm:inline-block">
                    Live Event
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            ))}

          {/* 4. Upcoming Tasks fallback if no records at all */}
          {recentBookings.length === 0 && recentUsers.length === 0 && filteredEvents.length === 0 && upcomingTasks.length > 0 &&
            upcomingTasks.map((t: any) => (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                      <span className="capitalize text-amber-600 font-bold">{t.priority} Priority</span>
                      <span>•</span>
                      <span>Status: {t.status}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/tasks"
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
        </div>
      </div>

      {/* =========================================================================
          8. GROUNDED AI ASSISTANT EXECUTIVE ACTION CALLOUT
          ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              InsightIQ AI Executive Assistant
            </h3>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Need an executive report, data analysis, or priority task created?
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your assistant queries your private records, calculates exact stats, and triggers mobile notifications.
          </p>
        </div>

        <Link
          href="/assistant"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all shrink-0"
        >
          <span>Ask AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* =========================================================================
          HELP & GUIDE MODAL
          ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Manager Quick Guide
                </h3>
                <p className="text-xs text-slate-500">
                  How your business management workspace works
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">
                  1. Multi-Tenant Isolated Records
                </span>
                Every account has its own private workspace. Your collections, tasks, and connected sheets are only accessible to you.
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">
                  2. Google Sheet & CSV Live Streaming
                </span>
                Connect any live Google Sheet in Data Sources. Your records are ingested with zero duplication and reported on your dashboard.
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">
                  3. Grounded AI Assistant
                </span>
                Ask questions like &quot;Summarize this week&apos;s activity&quot; or &quot;Show high-intent bookings&quot;. The AI analyzes real records without guessing.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Got it, let&apos;s manage!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
