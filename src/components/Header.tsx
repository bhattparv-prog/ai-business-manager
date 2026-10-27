"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck,
  Smartphone,
  Search,
  Plus,
  RefreshCw,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react";

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
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState("Just now");

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
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsPushSupported(true);
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsPushSubscribed(!!sub);
      }
    }
  }

  async function handleHeaderSync() {
    setIsSyncing(true);
    try {
      await fetch("/api/sources/google-sheets", { method: "POST" });
      const now = new Date();
      setLastSyncText(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
      window.dispatchEvent(new CustomEvent("refreshDashboard"));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }

  async function enablePushNotifications() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Push notifications were denied in browser settings.");
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
      alert("✅ Lark Workplace OS Mobile push notifications enabled!");
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

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "BO";

  return (
    <header className="h-[54px] border-b border-[#DEE0E3] bg-white sticky top-0 z-30 px-3 md:px-5 flex items-center justify-between shadow-[0_1px_3px_rgba(31,35,41,0.04)] select-none">
      {/* 1. Left: Lark Workplace OS Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3370FF] to-[#00D6B9] flex items-center justify-center text-white font-black text-xs shadow-xs">
            OS
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-[#1F2329] tracking-tight hover:text-[#3370FF] transition-colors">
                InsightIQ Workplace
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F959E] group-hover:text-[#1F2329]" />
            </div>
            <span className="text-[10px] text-[#8F959E] leading-none hidden sm:inline">
              Enterprise OS • Multi-tenant
            </span>
          </div>
        </div>

        {/* Live Status Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#00B365] border border-[#00B365]/20 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B365] animate-pulse" />
          <span>Operational</span>
        </div>
      </div>

      {/* 2. Center: Lark Suite Global Search Pill (⌘K) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div
          onClick={() => {
            const input = document.getElementById("lark-global-search") as HTMLInputElement;
            if (input) input.focus();
          }}
          className="w-full bg-[#F5F6F7] hover:bg-[#EBECED] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3370FF]/20 focus-within:border-[#3370FF] border border-[#DEE0E3] rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-[#646A73] transition-all cursor-text shadow-xs"
        >
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-3.5 h-3.5 text-[#8F959E] shrink-0" />
            <input
              id="lark-global-search"
              type="text"
              placeholder="Search or jump to... (Bookings, Devotees, Logs, Collections)"
              className="bg-transparent text-xs text-[#1F2329] placeholder-[#8F959E] focus:outline-none w-full font-medium"
            />
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white border border-[#DEE0E3] text-[#8F959E] px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Live Sync, Quick Create (+), Alerts, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Google Sheets Live Sync Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F6F7] border border-[#DEE0E3] rounded-lg px-2.5 py-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00B365] animate-pulse" />
          <span className="text-[11px] font-medium text-[#1F2329]">Sheet Live</span>
          <button
            onClick={handleHeaderSync}
            disabled={isSyncing}
            title="Instant Google Sheet Sync"
            className="ml-1 p-0.5 text-[#8F959E] hover:text-[#3370FF] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-[#3370FF]" : ""}`} />
          </button>
        </div>

        {/* Quick Action "+ Create" Lark Blue Button */}
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="bg-[#3370FF] hover:bg-[#2860E1] text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#DEE0E3] rounded-xl shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8F959E]">
                Quick Create
              </div>
              <Link
                href="/tasks"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-[#3370FF]" />
                <span>New Task / Reminder</span>
              </Link>
              <Link
                href="/collections"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <Layers className="w-4 h-4 text-[#00B365]" />
                <span>New Base Collection</span>
              </Link>
              <Link
                href="/assistant"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#FF7D00]" />
                <span>Ask Lark AI Copilot</span>
              </Link>
              <Link
                href="/sources"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#7B61FF]" />
                <span>Connect Google Sheet</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Push Notification Indicator */}
        {isPushSupported && (
          <button
            onClick={enablePushNotifications}
            className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:flex items-center justify-center ${
              isPushSubscribed
                ? "bg-[#E6F9F0] text-[#00B365] border-[#00B365]/30"
                : "bg-white text-[#646A73] border-[#DEE0E3] hover:text-[#3370FF] hover:border-[#3370FF]"
            }`}
            title={isPushSubscribed ? "Mobile Push Connected" : "Enable Mobile Push"}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-1.5 rounded-lg text-[#646A73] hover:text-[#1F2329] hover:bg-[#F5F6F7] relative transition-colors"
            title="Workplace Notifications"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F54A45] rounded-full animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F54A45] rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DEE0E3] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#DEE0E3]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#1F2329]">Workplace Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#EBF1FF] text-[#3370FF] px-1.5 py-0.2 rounded">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#3370FF] hover:text-[#2860E1] font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#F5F6F7] my-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#8F959E] text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 text-xs rounded-lg hover:bg-[#F5F6F7] transition-colors ${
                        !n.read ? "bg-[#EBF1FF]/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#1F2329]">{n.title}</p>
                        <span className="text-[10px] text-[#8F959E]">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[#646A73] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#DEE0E3] text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-[#3370FF] hover:text-[#2860E1] font-semibold"
                >
                  Open Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative pl-1 border-l border-[#DEE0E3]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F5F6F7] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3370FF] to-[#00D6B9] flex items-center justify-center text-white font-extrabold text-[11px] shadow-xs relative">
              {userInitials}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#00B365] rounded-full ring-2 ring-white" />
            </div>
            <span className="text-xs font-semibold text-[#1F2329] hidden xl:inline max-w-[100px] truncate">
              {user?.name || "Business User"}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DEE0E3] rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-100">
              <div className="px-3 pb-2 border-b border-[#DEE0E3]">
                <p className="font-bold text-[#1F2329] truncate">{user?.name || "Parv Bhatt"}</p>
                <p className="text-[11px] text-[#8F959E] truncate">{user?.email || "upaadhya1@gmail.com"}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#3370FF]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Workplace {user?.role || "OWNER"}</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center justify-between px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <span>Workplace Preferences</span>
              </Link>
              <Link
                href="/team"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center justify-between px-3 py-2 text-[#1F2329] hover:bg-[#F5F6F7] transition-colors"
              >
                <span>Members & Roles</span>
              </Link>

              <div className="border-t border-[#DEE0E3] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[#F54A45] hover:bg-[#FFEAE8] transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out of Workplace OS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
