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
} from "lucide-react";

export default function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Executive Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time business records, automated tasks, and grounded AI insights.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel bg-slate-900/60 border border-slate-800 text-xs">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "Month" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === item.id
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {metrics.totalRecords}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-sky-400 font-semibold">{metrics.allTimeRecords}</span> all-time across {metrics.totalCollections} collections
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {metrics.pendingTasks}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-rose-400 font-semibold">{metrics.urgentTasks}</span> high / urgent priority
            </div>
          </div>
        </div>

        {/* Connected Sources */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Data Sources
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {metrics.dataSourcesConnected}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              CSV & Google Sheets integrations
            </div>
          </div>
        </div>

        {/* Unread Alerts */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alerts & Notifs
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {metrics.unreadNotifications}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Unread mobile / in-app notifications
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Callout Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-sky-950/60 via-indigo-950/50 to-slate-900/80 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Personal AI Assistant Grounded in Your Records
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Ask questions about your data, generate executive reports, or delegate automated tasks.
            </p>
          </div>
        </div>
        <Link
          href="/assistant"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20 shrink-0"
        >
          <span>Chat with Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Collections & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Data Collections (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h2 className="font-semibold text-sm text-slate-100">Custom Business Collections</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>Manage Collections</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data?.collectionBreakdown?.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                No collections defined yet. Create your first collection in Collections!
              </div>
            ) : (
              data?.collectionBreakdown?.map((col: any) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                        {col.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{col.count} records stored</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Priority Pending Tasks (1 Col) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <h2 className="font-semibold text-sm text-slate-100">Pending Actions</h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                View all →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {data?.upcomingTasks?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No pending tasks!</p>
              ) : (
                data?.upcomingTasks?.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 line-clamp-1">
                        {task.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === "urgent" || task.priority === "high"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.dueDate && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/tasks"
            className="mt-4 w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold text-center transition-colors block"
          >
            + Create New Task
          </Link>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-semibold text-sm text-slate-100">Live Audit & Activity Log</h2>
          </div>
          <span className="text-[11px] text-slate-400">Strictly recorded from actual system events</span>
        </div>

        <div className="mt-3 divide-y divide-slate-800/60">
          {data?.recentActivity?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
          ) : (
            data?.recentActivity?.map((act: any) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-sky-300 font-mono">
                    {act.action}
                  </span>
                  <span className="text-slate-300 font-medium">
                    {act.entityType} {act.entityId ? `#${act.entityId.slice(0, 8)}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{act.user?.name || "System"}</span>
                  <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
