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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery to desktop browsers and Android mobile devices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={testPush}
            disabled={testingPush}
            className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-600" />
            <span>{testingPush ? "Sending Alert..." : "Test Mobile Push"}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold shadow-sm">
          {testResult}
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <Bell className="w-10 h-10 text-orange-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Events triggered by records, tasks, or automations will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? "bg-white border-orange-300 shadow-sm shadow-orange-500/5 ring-1 ring-orange-200/50"
                  : "bg-white/70 border-slate-200 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    n.type === "alert"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : n.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-orange-50 border-orange-200 text-orange-600"
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
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{n.message}</p>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2 font-medium">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.link && (
                      <>
                        <span>•</span>
                        <a
                          href={n.link}
                          className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-bold"
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
