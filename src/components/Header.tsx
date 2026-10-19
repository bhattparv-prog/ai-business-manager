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
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Workspace Indicator */}
      <div className="flex items-center gap-3">
        <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Workspace Active
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Push Button */}
        {isPushSupported && (
          <button
            onClick={enablePushNotifications}
            className={`text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border transition-all ${
              isPushSubscribed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 font-medium"
            }`}
            title={isPushSubscribed ? "Push notifications active" : "Enable mobile push notifications"}
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">
              {isPushSubscribed ? "Push Active" : "Enable Push"}
            </span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 text-xs rounded-lg hover:bg-slate-50 transition-colors ${
                        !n.read ? "bg-orange-50/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                >
                  View all in Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Role Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 leading-none">
              {user?.name || "Business User"}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
              {user?.role === "OWNER" ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-700 font-semibold">Owner</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Employee</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
