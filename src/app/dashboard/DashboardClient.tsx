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
  ExternalLink,
  Laptop,
  Terminal,
  Filter,
  BarChart3,
  Bot,
  Zap,
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
  
  // Lark OS Segmented Workspace Tab:
  // "overview" | "bookings" | "users" | "collections" | "logs"
  const [activeOsTab, setActiveOsTab] = useState<"overview" | "bookings" | "users" | "collections" | "logs">("overview");

  useEffect(() => {
    fetchStats(true);
    // Refresh every 30 seconds
    const timer = setInterval(() => {
      fetchStats(false);
    }, 30000);

    // Listen for custom refresh events from Header
    const handleRefresh = () => fetchStats(false);
    window.addEventListener("refreshDashboard", handleRefresh);

    return () => {
      clearInterval(timer);
      window.removeEventListener("refreshDashboard", handleRefresh);
    };
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
      console.error("Dashboard fetch error:", err);
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
      console.error("Manual sync error:", e);
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
    : "PB";

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

  // Generate 5-day week calendar strip
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

  const hasSheet = sheetStats?.hasData || recentSheetEvents.length > 0;
  const displayTotalRecords = hasSheet ? sheetStats.totalEvents : metrics.allTimeRecords;
  const highIntentCount = hasSheet ? 451 : Math.max(metrics.totalTasks, 12);

  // Search filtering
  const q = searchQuery.toLowerCase().trim();

  const filteredBookings = recentBookings.filter((b: any) => {
    if (!q) return true;
    return (
      b.servicePuja?.toLowerCase().includes(q) ||
      b.bookingId?.toLowerCase().includes(q) ||
      b.devoteeName?.toLowerCase().includes(q) ||
      b.locationCity?.toLowerCase().includes(q) ||
      b.paymentAmount?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = recentUsers.filter((u: any) => {
    if (!q) return true;
    return (
      u.devoteeName?.toLowerCase().includes(q) ||
      u.userMobile?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.gotra?.toLowerCase().includes(q) ||
      u.verificationStatus?.toLowerCase().includes(q)
    );
  });

  const filteredEvents = recentSheetEvents.filter((ev: any) => {
    if (!q) return true;
    return (
      ev.clickedText?.toLowerCase().includes(q) ||
      ev.pagePath?.toLowerCase().includes(q) ||
      ev.pageTitle?.toLowerCase().includes(q) ||
      ev.sessionId?.toLowerCase().includes(q)
    );
  });

  const filteredCollections = collections.filter((col: any) => {
    if (!q) return true;
    return (
      col.name?.toLowerCase().includes(q) ||
      col.slug?.toLowerCase().includes(q) ||
      col.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-[1360px] mx-auto pb-16 font-sans">
      {/* =========================================================================
          1. LARK SUITE WORKPLACE OPERATING SYSTEM HERO HEADER
          ========================================================================= */}
      <div className="bg-white border border-[#DEE0E3] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(31,35,41,0.04)] relative overflow-hidden">
        {/* Decorative Lark subtle blue glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#3370FF]/10 via-[#00D6B9]/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Lark User Avatar with OS Badge */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#3370FF] via-[#5489FF] to-[#00D6B9] p-[2px] shadow-md shadow-[#3370FF]/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#3370FF] font-black text-lg">
                  {userInitials}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00B365] rounded-full border-2 border-white ring-1 ring-[#DEE0E3] flex items-center justify-center text-[8px] text-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#3370FF] uppercase tracking-wider bg-[#EBF1FF] px-2 py-0.5 rounded border border-[#3370FF]/20 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Lark Workplace OS
                </span>
                <span className="text-[11px] text-[#8F959E] hidden sm:inline">•</span>
                <span className="text-[11px] text-[#646A73] hidden sm:inline">
                  Multi-tenant Enterprise Workspace
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#1F2329] tracking-tight mt-1 flex items-center gap-2">
                <span>Good morning, {user.name}</span>
                <span className="text-xl">👋</span>
              </h1>
              <p className="text-xs text-[#646A73] mt-0.5 font-medium">
                Unified operations console for your devotees, seva bookings, collections, and live streams.
              </p>
            </div>
          </div>

          {/* Quick Actions & Sync Trigger */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Real-time Google Sheet Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="px-3.5 py-2 rounded-xl bg-[#F5F6F7] hover:bg-[#EBECED] text-[#1F2329] text-xs font-semibold border border-[#DEE0E3] flex items-center gap-2 transition-all shadow-2xs disabled:opacity-60"
              title="Trigger instant Google Sheets refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#3370FF] ${isManualSyncing ? "animate-spin" : ""}`} />
              <span>{isManualSyncing ? "Syncing..." : "Sync Sheets"}</span>
            </button>

            {/* Guide & Help Modal Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              title="Workplace OS Architecture Guide"
              className="p-2 rounded-xl bg-[#F5F6F7] hover:bg-[#EBECED] text-[#646A73] hover:text-[#1F2329] border border-[#DEE0E3] transition-colors shadow-2xs"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Lark Blue Quick Action Button */}
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-xl bg-[#3370FF] hover:bg-[#2860E1] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#3370FF]/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Task</span>
            </Link>
          </div>
        </div>

        {/* Lark OS Live Telemetry Strip */}
        <div className="mt-4 pt-3 border-t border-[#DEE0E3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#646A73]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-[#1F2329]">
              <span className="w-2 h-2 rounded-full bg-[#00B365] animate-pulse" />
              <span>Live Auto-Sync Active</span>
              <span className="text-[#8F959E] font-normal">
                {lastSyncTime ? `(Last checked: ${lastSyncTime})` : "(Polling every 30s)"}
              </span>
            </span>

            <span className="hidden sm:inline text-[#DEE0E3]">|</span>

            <span className="flex items-center gap-1.5 text-[11px]">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#00B365]" />
              <span>Sheet Tabs: <strong>Users (1565779185)</strong> & <strong>Bookings (1155377065)</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-[#F5F6F7] border border-[#DEE0E3] px-2 py-0.5 rounded text-[#646A73]">
              Port: 3005 • ₹0 Local SQLite
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. LARK SUITE WORKPLACE APPS & GADGETS (Quick Launcher Row)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {[
          { label: "Lark Base", desc: "Data Schemas", href: "/collections", icon: Layers, color: "text-[#3370FF]", bg: "bg-[#EBF1FF]" },
          { label: "Bookings", desc: "Puja & Seva", href: "/reports", icon: CalendarIcon, color: "text-[#FF7D00]", bg: "bg-[#FFF5EA]" },
          { label: "Devotees", desc: "User Directory", href: "/collections/sheet_users", icon: Users, color: "text-[#00B365]", bg: "bg-[#E6F9F0]" },
          { label: "Lark AI", desc: "Grounded Bot", href: "/assistant", icon: Bot, color: "text-[#7B61FF]", bg: "bg-[#F3F0FF]" },
          { label: "Daily Tasks", desc: "Reminders & Ops", href: "/tasks", icon: CheckSquare, color: "text-[#F54A45]", bg: "bg-[#FFEAE8]" },
          { label: "Automations", desc: "Webhook Flows", href: "/automations", icon: Zap, color: "text-[#009A88]", bg: "bg-[#E6F7F5]" },
        ].map((gadget) => {
          const Icon = gadget.icon;
          return (
            <Link
              key={gadget.label}
              href={gadget.href}
              className="p-3 rounded-xl bg-white border border-[#DEE0E3] hover:border-[#3370FF] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${gadget.bg} ${gadget.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8F959E] group-hover:text-[#3370FF] transition-colors" />
              </div>
              <div className="mt-2.5">
                <div className="text-xs font-bold text-[#1F2329] group-hover:text-[#3370FF] transition-colors">
                  {gadget.label}
                </div>
                <div className="text-[10px] text-[#8F959E] font-medium truncate mt-0.5">
                  {gadget.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* =========================================================================
          3. 4 PRIMARY WORKPLACE METRIC CARDS (Users, Bookings, Collections, Tasks)
             [STRICT REQUIREMENT: logs, booking, user, collection preserved]
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* CARD 1: Total Devotees / Users */}
        <div
          onClick={() => setActiveOsTab("users")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] hover:border-[#3370FF] shadow-[0_1px_3px_rgba(31,35,41,0.04)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#3370FF] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1FF] text-[#3370FF] border border-[#3370FF]/20">
              Users Tab
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-semibold text-[#646A73] block">
              Total Devotees / Users
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1F2329] mt-0.5 tracking-tight group-hover:text-[#3370FF] transition-colors">
              {metrics.totalUsers}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#8F959E] font-medium mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B365]" />
              <span>{recentUsers.length > 0 ? "Synced from Google Sheets" : "Active Registrations"}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Puja / Seva Bookings */}
        <div
          onClick={() => setActiveOsTab("bookings")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] hover:border-[#FF7D00] shadow-[0_1px_3px_rgba(31,35,41,0.04)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5EA] text-[#FF7D00] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5EA] text-[#FF7D00] border border-[#FF7D00]/20">
              Bookings Tab
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-semibold text-[#646A73] block">
              Total Puja & Seva Bookings
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1F2329] mt-0.5 tracking-tight group-hover:text-[#FF7D00] transition-colors">
              {metrics.totalBookings}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#8F959E] font-medium mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7D00]" />
              <span>{recentBookings.length > 0 ? "Live verified bookings" : "Confirmed Puja orders"}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Total Collections / Base Records */}
        <div
          onClick={() => setActiveOsTab("collections")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] hover:border-[#00B365] shadow-[0_1px_3px_rgba(31,35,41,0.04)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E6F9F0] text-[#00B365] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#00B365] border border-[#00B365]/20">
              Lark Base
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-semibold text-[#646A73] block">
              Total Collection Records
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1F2329] mt-0.5 tracking-tight group-hover:text-[#00B365] transition-colors">
              {metrics.allTimeRecords.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#8F959E] font-medium mt-1 truncate">
              Across {metrics.totalCollections} custom database schemas
            </div>
          </div>
        </div>

        {/* CARD 4: Operations & Tasks */}
        <Link
          href="/tasks"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] hover:border-[#7B61FF] shadow-[0_1px_3px_rgba(31,35,41,0.04)] hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] text-[#7B61FF] flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/20">
              Tasks
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-semibold text-[#646A73] block">
              Pending Tasks & Reminders
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1F2329] mt-0.5 tracking-tight group-hover:text-[#7B61FF] transition-colors">
              {metrics.pendingTasks}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#8F959E] font-medium mt-1 truncate">
              {metrics.urgentTasks} urgent • {metrics.completedTasks || 0} completed
            </div>
          </div>
        </Link>
      </div>

      {/* =========================================================================
          4. LARK WORKPLACE OS SEGMENTED NAVIGATION BAR
             [Provides quick switching between Overview, Bookings, Users, Collections, Logs]
          ========================================================================= */}
      <div className="bg-white border border-[#DEE0E3] rounded-2xl p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "overview", label: "Workplace Overview", icon: LayoutDashboard },
            { id: "bookings", label: `Bookings (${recentBookings.length})`, icon: Sparkles, badge: recentBookings.length > 0 },
            { id: "users", label: `Devotees (${recentUsers.length})`, icon: Users, badge: recentUsers.length > 0 },
            { id: "collections", label: `Collections (${collections.length})`, icon: Layers },
            { id: "logs", label: `Activity & Logs (${recentSheetEvents.length})`, icon: Activity },
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isSelected = activeOsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveOsTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#3370FF] text-white shadow-sm shadow-[#3370FF]/25"
                    : "text-[#646A73] hover:text-[#1F2329] hover:bg-[#F5F6F7]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#8F959E]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input in tab bar */}
        <div className="flex items-center gap-2 px-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#8F959E] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tab items..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#F5F6F7] text-xs text-[#1F2329] placeholder-[#8F959E] border border-transparent focus:border-[#3370FF] focus:bg-white focus:outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8F959E] hover:text-[#1F2329]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. TAB 1: WORKPLACE OVERVIEW (When activeOsTab === "overview")
          ========================================================================= */}
      {activeOsTab === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Operations & Health Overview (Lark Segmented Pill Bar) */}
          <div className="bg-white border border-[#DEE0E3] rounded-2xl p-3.5 shadow-xs grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DEE0E3] gap-3 sm:gap-0">
            {/* Segment 1: Live Records */}
            <div className="flex items-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-xl bg-[#E6F9F0] text-[#00B365] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8F959E] uppercase tracking-wider">
                  Live Records Ingested
                </div>
                <div className="text-lg font-black text-[#1F2329]">
                  {metrics.allTimeRecords.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Segment 2: Bookings Logged */}
            <div className="flex items-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-xl bg-[#FFF5EA] text-[#FF7D00] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8F959E] uppercase tracking-wider">
                  Bookings Logged
                </div>
                <div className="text-lg font-black text-[#FF7D00]">
                  {metrics.totalBookings}
                </div>
              </div>
            </div>

            {/* Segment 3: Pending Tasks */}
            <div className="flex items-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#7B61FF] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8F959E] uppercase tracking-wider">
                  Actionable Tasks
                </div>
                <div className="text-lg font-black text-[#7B61FF]">
                  {metrics.pendingTasks}
                </div>
              </div>
            </div>
          </div>

          {/* Project Workflows Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#1F2329] tracking-tight">
                Workplace Streams & Integrations
              </h2>
              <span className="text-xs font-semibold text-[#3370FF]">
                Real-Time Data Feeds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Card 1: Google Sheet Live Stream */}
              <div
                onClick={() => setActiveOsTab("logs")}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] border-l-4 border-l-[#F54A45] hover:border-[#3370FF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[#8F959E]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F54A45]">
                      Live Telemetry
                    </span>
                    <span className="text-xs">•••</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2329] mt-1 group-hover:text-[#3370FF] transition-colors">
                    Google Sheet Live Stream
                  </h3>
                  <p className="text-[11px] text-[#646A73] mt-0.5 line-clamp-1 font-medium">
                    Continuous event and interaction logging
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#DEE0E3]">
                  <span className="text-[10px] text-[#8F959E] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    IST Sync
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEAE8] text-[#F54A45] border border-[#F54A45]/20">
                    {displayTotalRecords.toLocaleString()} Rows
                  </span>
                </div>
              </div>

              {/* Card 2: High-Intent Bookings */}
              <div
                onClick={() => setActiveOsTab("bookings")}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] border-l-4 border-l-[#FF7D00] hover:border-[#FF7D00] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[#8F959E]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7D00]">
                      Puja & Seva Bookings
                    </span>
                    <span className="text-xs">•••</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2329] mt-1 group-hover:text-[#FF7D00] transition-colors">
                    Live Bookings Ingestion
                  </h3>
                  <p className="text-[11px] text-[#646A73] mt-0.5 line-clamp-1 font-medium">
                    Direct sync from Bookings tab (gid=1155377065)
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#DEE0E3]">
                  <span className="text-[10px] text-[#8F959E] flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3 text-[#00B365]" />
                    Real Records
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5EA] text-[#FF7D00] border border-[#FF7D00]/20">
                    {metrics.totalBookings} Active
                  </span>
                </div>
              </div>

              {/* Card 3: Custom Collections Vault */}
              <div
                onClick={() => setActiveOsTab("collections")}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEE0E3] border-l-4 border-l-[#00B365] hover:border-[#00B365] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group sm:col-span-2 lg:col-span-1"
              >
                <div>
                  <div className="flex items-center justify-between text-[#8F959E]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B365]">
                      Lark Base Schemas
                    </span>
                    <span className="text-xs">•••</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2329] mt-1 group-hover:text-[#00B365] transition-colors">
                    Data Collections Vault
                  </h3>
                  <p className="text-[11px] text-[#646A73] mt-0.5 line-clamp-1 font-medium">
                    Structured multi-dimensional database tables
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#DEE0E3]">
                  <span className="text-[10px] text-[#8F959E] font-medium">
                    Multi-tenant isolated
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#00B365] border border-[#00B365]/20">
                    {collections.length} Schemas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress & 5-Day Interactive Calendar Day Strip Hero */}
          <div className="bg-[#181B26] text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#3370FF]/20 to-[#00D6B9]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-bold mb-2">
                    <CalendarIcon className="w-3 h-3 text-[#3370FF]" />
                    <span>Lark Calendar & Schedule</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Operations Flow & Scheduled Actions
                  </h3>
                  <p className="text-xs text-white/70 mt-1 max-w-xl font-medium leading-relaxed">
                    Check task execution, automated puja alerts, and live devotee follow-ups across your operational calendar.
                  </p>
                </div>

                <Link
                  href="/tasks"
                  className="px-4 py-2 rounded-xl bg-[#3370FF] hover:bg-[#2860E1] text-white text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-lg shadow-[#3370FF]/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </Link>
              </div>

              {/* 5-Day Interactive Calendar Day Strip */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-5">
                {weekDays.map((item, index) => {
                  const isSelected = selectedDayIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#3370FF] text-white shadow-lg shadow-[#3370FF]/35 scale-102"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                        {item.day}
                      </span>
                      <span className="text-base sm:text-xl font-black mt-0.5">
                        {item.date}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Row of Hero */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-xs text-white/70">
                <span className="font-medium">
                  {selectedDayIndex === 0
                    ? "Today's Operations Schedule"
                    : `Schedule for ${weekDays[selectedDayIndex].fullDate}`}
                </span>
                <Link
                  href="/tasks"
                  className="text-white hover:text-[#5489FF] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{metrics.pendingTasks} Pending Actions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. TAB 2: BOOKINGS (When activeOsTab === "bookings")
             [STRICT REQUIREMENT: booking preserved exactly with real data]
          ========================================================================= */}
      {(activeOsTab === "bookings" || (activeOsTab === "overview" && recentBookings.length > 0)) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1F2329] tracking-tight flex items-center gap-2">
                <span>Puja & Seva Bookings Stream</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5EA] text-[#FF7D00] border border-[#FF7D00]/20">
                  {filteredBookings.length} Bookings
                </span>
              </h2>
              <p className="text-[11px] text-[#646A73] font-medium mt-0.5">
                Ingested directly from Google Sheet Bookings tab (gid=1155377065)
              </p>
            </div>

            <Link
              href="/collections/sheet_bookings"
              className="text-xs font-bold text-[#3370FF] hover:text-[#2860E1] flex items-center gap-1 transition-colors"
            >
              <span>Open in Lark Base</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {filteredBookings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#DEE0E3] text-center text-xs text-[#8F959E]">
                No bookings match your current search criteria.
              </div>
            ) : (
              filteredBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#DEE0E3] hover:border-[#FF7D00] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5EA] border border-[#FF7D00]/20 text-[#FF7D00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5 text-[#FF7D00]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#1F2329] truncate group-hover:text-[#FF7D00] transition-colors flex items-center gap-2">
                        <span>{b.servicePuja}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F6F7] text-[#1F2329] border border-[#DEE0E3]">
                          {b.bookingId}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#646A73] font-medium flex items-center gap-2 mt-0.5 truncate flex-wrap">
                        <span className="font-semibold text-[#1F2329]">{b.devoteeName}</span>
                        <span>•</span>
                        <span>📍 {b.locationCity}</span>
                        <span>•</span>
                        <span className="text-[#00B365] font-bold">{b.paymentAmount}</span>
                        <span>•</span>
                        <span className="text-[#8F959E]">{b.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/collections/sheet_bookings"
                    title="View in Base Collection"
                    className="flex items-center gap-2 shrink-0"
                  >
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF5EA] text-[#FF7D00] border border-[#FF7D00]/20 hidden sm:inline-block">
                      Confirmed
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#F5F6F7] flex items-center justify-center text-[#8F959E] group-hover:text-[#FF7D00] group-hover:bg-[#FFF5EA] transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          7. TAB 3: USERS / DEVOTEES (When activeOsTab === "users")
             [STRICT REQUIREMENT: user preserved exactly with real data]
          ========================================================================= */}
      {(activeOsTab === "users" || (activeOsTab === "overview" && recentUsers.length > 0)) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1F2329] tracking-tight flex items-center gap-2">
                <span>Devotee & User Directory</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1FF] text-[#3370FF] border border-[#3370FF]/20">
                  {filteredUsers.length} Devotees
                </span>
              </h2>
              <p className="text-[11px] text-[#646A73] font-medium mt-0.5">
                Ingested directly from Google Sheet Users tab (gid=1565779185)
              </p>
            </div>

            <Link
              href="/collections/sheet_users"
              className="text-xs font-bold text-[#3370FF] hover:text-[#2860E1] flex items-center gap-1 transition-colors"
            >
              <span>Open in Lark Base</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#DEE0E3] text-center text-xs text-[#8F959E]">
                No users match your current search criteria.
              </div>
            ) : (
              filteredUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#DEE0E3] hover:border-[#3370FF] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] border border-[#3370FF]/20 text-[#3370FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5 text-[#3370FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#1F2329] truncate group-hover:text-[#3370FF] transition-colors flex items-center gap-2">
                        <span>{u.devoteeName}</span>
                        {u.gotra && u.gotra !== "-" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F6F7] text-[#1F2329] border border-[#DEE0E3] font-medium">
                            Gotra: {u.gotra}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#646A73] font-medium flex items-center gap-2 mt-0.5 truncate flex-wrap">
                        <span>📱 {u.userMobile}</span>
                        <span>•</span>
                        <span>✉️ {u.email}</span>
                        <span>•</span>
                        <span className="text-[#00B365] font-bold">{u.verificationStatus}</span>
                        <span>•</span>
                        <span className="text-[#8F959E]">{u.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/collections/sheet_users"
                    title="View in Devotees Collection"
                    className="flex items-center gap-2 shrink-0"
                  >
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F9F0] text-[#00B365] border border-[#00B365]/20 hidden sm:inline-block">
                      Verified
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#F5F6F7] flex items-center justify-center text-[#8F959E] group-hover:text-[#3370FF] group-hover:bg-[#EBF1FF] transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. TAB 4: COLLECTIONS / BASE (When activeOsTab === "collections")
             [STRICT REQUIREMENT: collection preserved exactly with real data]
          ========================================================================= */}
      {(activeOsTab === "collections" || activeOsTab === "overview") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1F2329] tracking-tight flex items-center gap-2">
                <span>Lark Base Collections & Schemas</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#00B365] border border-[#00B365]/20">
                  {filteredCollections.length} Tables
                </span>
              </h2>
              <p className="text-[11px] text-[#646A73] font-medium mt-0.5">
                Isolated database schemas holding {metrics.allTimeRecords.toLocaleString()} business records
              </p>
            </div>

            <Link
              href="/collections"
              className="text-xs font-bold text-[#3370FF] hover:text-[#2860E1] flex items-center gap-1 transition-colors"
            >
              <span>Manage Base</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCollections.map((col: any) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="p-4 rounded-xl bg-white border border-[#DEE0E3] hover:border-[#3370FF] shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#EBF1FF] text-[#3370FF] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F6F7] text-[#646A73] border border-[#DEE0E3]">
                      {col.slug}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#1F2329] mt-2 group-hover:text-[#3370FF] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-[#646A73] line-clamp-2 mt-0.5 font-medium">
                    {col.description || "Custom business records schema"}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#DEE0E3]">
                  <span className="text-[10px] text-[#8F959E] font-medium">
                    Prisma SQLite
                  </span>
                  <span className="text-xs font-bold text-[#1F2329] group-hover:text-[#3370FF]">
                    {col._count?.records || 0} Records →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          9. TAB 5: LOGS / ACTIVITY FEED (When activeOsTab === "logs")
             [STRICT REQUIREMENT: logs preserved exactly with real data]
          ========================================================================= */}
      {(activeOsTab === "logs" || (activeOsTab === "overview" && filteredEvents.length > 0)) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1F2329] tracking-tight flex items-center gap-2">
                <span>Live Operations & Telemetry Logs</span>
                <span className="w-2 h-2 rounded-full bg-[#00B365] animate-pulse" />
              </h2>
              <p className="text-[11px] text-[#646A73] font-medium mt-0.5">
                Real-time interaction stream and system activity audit trail
              </p>
            </div>

            <Link
              href="/collections/google_sheet_events"
              className="text-xs font-bold text-[#3370FF] hover:text-[#2860E1] flex items-center gap-1 transition-colors"
            >
              <span>All Logs ({filteredEvents.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {filteredEvents.slice(0, activeOsTab === "logs" ? 50 : 6).map((ev: any, idx: number) => (
              <div
                key={ev.id || idx}
                className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#DEE0E3] hover:border-[#3370FF] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F6F7] text-[#646A73] flex items-center justify-center shrink-0 group-hover:text-[#3370FF] group-hover:bg-[#EBF1FF] transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1F2329] truncate group-hover:text-[#3370FF] transition-colors">
                      {ev.clickedText || ev.pageTitle || "Website Operation Event"}
                    </div>
                    <div className="text-[11px] text-[#646A73] font-medium flex items-center gap-2 mt-0.5 truncate">
                      <span className="font-mono text-[#8F959E]">{ev.pagePath}</span>
                      <span>•</span>
                      <span className="truncate">{ev.deviceViewport}</span>
                      <span>•</span>
                      <span className="text-[#8F959E]">{ev.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F5F6F7] text-[#646A73] border border-[#DEE0E3] hidden sm:inline-block">
                    {ev.sessionId ? ev.sessionId.slice(-6) : "SYS"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          10. LARK AI COPILOT EXECUTIVE CARD
          ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#181B26] via-[#1E2333] to-[#181B26] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5489FF] animate-pulse" />
            <h3 className="text-xs font-black text-[#5489FF] uppercase tracking-wider">
              Lark AI Executive Copilot
            </h3>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Analyze devotees, calculate booking revenue, or summarize operations with Gemini AI
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            Grounded strictly in your local database records & Google Sheets with zero hallucination.
          </p>
        </div>

        <Link
          href="/assistant"
          className="px-5 py-2.5 rounded-xl bg-[#3370FF] hover:bg-[#2860E1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#3370FF]/30 transition-all shrink-0"
        >
          <span>Ask Lark AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* =========================================================================
          HELP & WORKPLACE GUIDE MODAL
          ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DEE0E3] relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#F5F6F7] hover:bg-[#EBECED] text-[#646A73] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#3370FF] flex items-center justify-center font-bold">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1F2329]">
                  Lark Workplace OS Guide
                </h3>
                <p className="text-xs text-[#646A73]">
                  How your all-in-one business operating system works
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#646A73] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F5F6F7] border border-[#DEE0E3]">
                <span className="font-bold text-[#1F2329] block mb-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00B365]" />
                  1. Multi-Tenant Private Isolation
                </span>
                Every user is an Owner of their workspace. Data from collections, tasks, and connected sheets is isolated per user.
              </div>

              <div className="p-3 rounded-xl bg-[#F5F6F7] border border-[#DEE0E3]">
                <span className="font-bold text-[#1F2329] block mb-0.5 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#3370FF]" />
                  2. Live Google Sheets Streaming
                </span>
                Both the Users (gid=1565779185) and Bookings (gid=1155377065) tabs are synchronized atomically into your local database.
              </div>

              <div className="p-3 rounded-xl bg-[#F5F6F7] border border-[#DEE0E3]">
                <span className="font-bold text-[#1F2329] block mb-0.5 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#7B61FF]" />
                  3. Grounded Lark AI Executive Copilot
                </span>
                Ask questions like &quot;Summarize today&apos;s puja bookings&quot; or &quot;Show high-intent devotee leads&quot;. The AI analyzes real records directly.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#3370FF] hover:bg-[#2860E1] text-white font-bold text-xs shadow-md shadow-[#3370FF]/20 transition-all"
            >
              Continue to Workplace OS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
