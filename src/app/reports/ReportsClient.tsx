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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Analytics & Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Verified Data
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed reporting calculated strictly from your operational records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
      </div>

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-bold">Total Filtered Records</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {data?.metrics?.totalRecords || 0}
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
                    {col.count} records ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Synthesis Callout */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Need an AI-generated Executive Report?</h4>
          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
            The AI Assistant can analyze this period&apos;s data and compare it with previous months.
          </p>
        </div>
        <Link
          href="/assistant"
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-orange-500/20"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </Link>
      </div>
    </div>
  );
}
