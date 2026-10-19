"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Download, Calendar, Layers, Bot, ArrowRight } from "lucide-react";

export default function ReportsClient() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Analytics & Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30">
              Verified Data
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed reporting calculated strictly from your operational records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass-panel bg-slate-900 border border-slate-800 text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "7 Days" },
              { id: "month", label: "This Month" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilter(p.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filter === p.id ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={downloadExecutiveSummary}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Filtered Records</span>
          <div className="text-3xl font-extrabold text-slate-100 mt-2">
            {data?.metrics?.totalRecords || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all custom business collections</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pending Action Items</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {data?.metrics?.pendingTasks || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{data?.metrics?.urgentTasks || 0} urgent</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Connected Sources</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {data?.metrics?.dataSourcesConnected || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live spreadsheets and datasets</p>
        </div>
      </div>

      {/* Breakdown per collection */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
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
                  <span className="font-semibold text-slate-200">{col.name}</span>
                  <span className="text-slate-400">
                    {col.count} records ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Synthesis Callout */}
      <div className="rounded-2xl p-5 glass-panel bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Need an AI-generated Executive Report?</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            The AI Assistant can analyze this period&apos;s data and compare it with previous months.
          </p>
        </div>
        <Link
          href="/assistant"
          className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </Link>
      </div>
    </div>
  );
}
