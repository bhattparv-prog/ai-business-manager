"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Send,
  ExternalLink,
} from "lucide-react";

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testingPush, setTestingPush] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    fetchNotifications();
  }

  async function testPush() {
    setTestingPush(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTestResult("✅ Push notification dispatched! Check your device lock screen & notification tray.");
        fetchNotifications();
      } else {
        setTestResult("⚠️ " + (data.error || "Failed to trigger test push"));
      }
    } catch (err: any) {
      setTestResult("⚠️ " + err.message);
    } finally {
      setTestingPush(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery to desktop browsers and Android mobile devices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={testPush}
            disabled={testingPush}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{testingPush ? "Sending Alert..." : "Test Mobile Push"}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-sky-500/20"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs font-medium">
          {testResult}
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-2xl p-8 border border-slate-800">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">No notifications yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Events triggered by records, tasks, or automations will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? "bg-slate-900/90 border-sky-500/40 shadow-sm"
                  : "glass-panel bg-slate-900/40 border-slate-800/60 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === "alert"
                      ? "bg-rose-500/20 text-rose-400"
                      : n.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {n.type === "alert" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : n.type === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.link && (
                      <>
                        <span>•</span>
                        <a
                          href={n.link}
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                        >
                          <span>Open related view</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
