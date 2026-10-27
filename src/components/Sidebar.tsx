"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Bot,
  Zap,
  CheckSquare,
  FileSpreadsheet,
  Bell,
  Users,
  BarChart3,
  Settings,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  unreadCount?: number;
}

export default function Sidebar({ userRole = "OWNER", unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Workplace", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Base", href: "/collections", icon: Layers, badge: undefined },
    { label: "Lark AI", href: "/assistant", icon: Bot, badge: "AI" },
    { label: "Bookings", href: "/reports", icon: Calendar },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Sheets", href: "/sources", icon: FileSpreadsheet },
    { label: "Flows", href: "/automations", icon: Zap },
    { label: "Analytics", href: "/reports", icon: BarChart3 },
    ...(userRole === "OWNER" ? [{ label: "Contacts", href: "/team", icon: Users }] : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-[72px] bg-[#181B26] border-r border-[#242838] h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Lark Suite OS Brand Emblem */}
      <div className="pt-3.5 pb-2 flex flex-col items-center justify-center">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3370FF] via-[#5489FF] to-[#00D6B9] p-[2px] flex items-center justify-center shadow-lg shadow-[#3370FF]/25 hover:scale-105 active:scale-95 transition-transform group relative"
          title="InsightIQ Lark Workplace OS"
        >
          <div className="w-full h-full bg-[#181B26] rounded-[10px] flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Lark OS"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
          {/* Subtle OS Active Dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00B365] rounded-full border-2 border-[#181B26]" />
        </Link>
      </div>

      <div className="w-8 mx-auto my-1 border-b border-white/10" />

      {/* Lark OS Icon Dock (Icon + 10px Label underneath) */}
      <nav className="flex-1 overflow-y-auto py-1 px-1.5 space-y-1 scrollbar-none flex flex-col items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              title={`${item.label} (${item.href})`}
              className={`w-[60px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                isActive
                  ? "bg-[#3370FF]/15 text-[#5489FF] shadow-xs"
                  : "text-[#8F959E] hover:text-[#FFFFFF] hover:bg-white/10"
              }`}
            >
              {/* Left active vertical indicator pill */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3370FF] rounded-r-full" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? "text-[#3370FF] stroke-[2.2]" : "text-current stroke-[1.8]"
                  }`}
                />

                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 text-[8px] font-black bg-gradient-to-r from-[#FF7D00] to-[#FF4D4F] text-white px-1 py-0.2 rounded-full leading-none shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-1 leading-tight text-center ${
                  isActive ? "text-[#5489FF] font-bold" : "text-current"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="w-8 mx-auto my-1 border-b border-white/10" />

      {/* Bottom Dock: Notifications, Settings, Live Status */}
      <div className="pb-3 pt-1 px-1.5 flex flex-col items-center space-y-1.5">
        <Link
          href="/notifications"
          title="Notification Center"
          className={`w-[60px] py-1.5 rounded-xl flex flex-col items-center justify-center relative text-[#8F959E] hover:text-white hover:bg-white/10 transition-colors ${
            pathname === "/notifications" ? "bg-[#3370FF]/15 text-[#3370FF]" : ""
          }`}
        >
          <div className="relative">
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F54A45] rounded-full ring-2 ring-[#181B26] animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Alerts</span>
        </Link>

        <Link
          href="/settings"
          title="Workplace Settings"
          className={`w-[60px] py-1.5 rounded-xl flex flex-col items-center justify-center relative text-[#8F959E] hover:text-white hover:bg-white/10 transition-colors ${
            pathname === "/settings" ? "bg-[#3370FF]/15 text-[#3370FF]" : ""
          }`}
        >
          <Settings className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] font-medium mt-1">Settings</span>
        </Link>

        {/* Live Status indicator */}
        <div
          title="Lark Enterprise OS: All Services Operational"
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-[#00B365] hover:bg-white/10 transition-colors cursor-default"
        >
          <span className="w-2 h-2 rounded-full bg-[#00B365] animate-ping" />
        </div>
      </div>
    </aside>
  );
}
