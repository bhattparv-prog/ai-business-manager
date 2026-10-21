"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Bot,
  Zap,
  CheckSquare,
  Database,
  Bell,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  unreadCount?: number;
}

export default function Sidebar({ userRole = "OWNER", unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Collections", href: "/collections", icon: Layers },
    { label: "AI Assistant", href: "/assistant", icon: Bot, badge: "AI" },
    { label: "Tasks & Reminders", href: "/tasks", icon: CheckSquare },
    { label: "Automations", href: "/automations", icon: Zap },
    { label: "Data Sources", href: "/sources", icon: Database },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      count: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: "Analytics & Reports", href: "/reports", icon: BarChart3 },
    ...(userRole === "OWNER" ? [{ label: "Team & Access", href: "/team", icon: Users }] : []),
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header with Custom Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 p-1 flex items-center justify-center shadow-sm">
          <Image
            src="/logo.png"
            alt="InsightIQ"
            width={38}
            height={38}
            className="rounded-xl object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight text-base leading-snug">
            InsightIQ
          </h1>
          <p className="text-xs text-orange-600 font-semibold">Personal Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-600 border border-orange-200/90 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected (₹0 Dev)
          </span>
        </div>
      </div>
    </aside>
  );
}
