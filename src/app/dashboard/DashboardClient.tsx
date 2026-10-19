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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Executive Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business records, automated tasks, and grounded AI insights.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "Month" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === item.id
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Records
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.totalRecords}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-orange-600 font-bold">{metrics.allTimeRecords}</span> all-time across {metrics.totalCollections} collections
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.pendingTasks}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              <span className="text-rose-600 font-bold">{metrics.urgentTasks}</span> high / urgent priority
            </div>
          </div>
        </div>

        {/* Connected Sources */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Data Sources
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.dataSourcesConnected}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              CSV & Google Sheets integrations
            </div>
          </div>
        </div>

        {/* Unread Alerts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Alerts & Notifs
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.unreadNotifications}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Unread mobile / in-app notifications
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Warm Callout Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Personal AI Assistant Grounded in Your Records
            </h2>
            <p className="text-xs text-orange-100 mt-0.5">
              Ask questions about your data, generate executive reports, or delegate automated tasks.
            </p>
          </div>
        </div>
        <Link
          href="/assistant"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Chat with Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Collections & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Data Collections (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <h2 className="font-bold text-sm text-slate-900">Custom Business Collections</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
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
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-orange-200/50">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                        {col.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{col.count} records stored</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Priority Pending Tasks (1 Col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-sm text-slate-900">Pending Actions</h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-orange-600 hover:text-orange-700 font-bold"
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
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {task.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === "urgent" || task.priority === "high"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.dueDate && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
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
            className="mt-4 w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold text-center transition-colors block border border-orange-200"
          >
            + Create New Task
          </Link>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">Live Audit & Activity Log</h2>
          </div>
          <span className="text-[11px] text-slate-500">Strictly recorded from actual system events</span>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {data?.recentActivity?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
          ) : (
            data?.recentActivity?.map((act: any) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-[10px] font-bold text-orange-700 font-mono">
                    {act.action}
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {act.entityType} {act.entityId ? `#${act.entityId.slice(0, 8)}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
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
