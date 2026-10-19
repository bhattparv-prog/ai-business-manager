"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, ShieldCheck, UserCheck, Smartphone } from "lucide-react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: "OWNER" | "EMPLOYEE";
  } | null;
  onRefresh?: () => void;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  useEffect(() => {
    fetchNotifications();
    checkPushSupport();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }

  async function checkPushSupport() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsPushSupported(true);
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsPushSubscribed(!!sub);
      }
    }
  }

  async function enablePushNotifications() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Push notifications were denied in your browser settings.");
        return;
      }

      const res = await fetch("/api/push/vapid-key");
      const { publicKey } = await res.json();
      if (!publicKey) return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setIsPushSubscribed(true);
      alert("✅ Mobile push notifications successfully enabled for this device!");
    } catch (err: any) {
      console.error(err);
      alert("Could not enable push: " + err.message);
    }
  }

  function urlB64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setUnreadCount(0);
    fetchNotifications();
  }

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel bg-[#0c1222]/80 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Search / Status */}
      <div className="flex items-center gap-3">
        <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          Workspace Active
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Push Button */}
        {isPushSupported && (
          <button
            onClick={enablePushNotifications}
            className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
              isPushSubscribed
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20"
            }`}
            title={isPushSubscribed ? "Push notifications active" : "Enable mobile push notifications"}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPushSubscribed ? "Push Active" : "Enable Push"}
            </span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-semibold text-sm text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 text-xs rounded hover:bg-slate-800/40 transition-colors ${
                        !n.read ? "bg-sky-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-200">{n.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  View all in Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Role Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200 leading-none">
              {user?.name || "Business User"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
              {user?.role === "OWNER" ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  Owner
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  Employee
                </>
              )}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
