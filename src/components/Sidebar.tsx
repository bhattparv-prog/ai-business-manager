"use client";

import Link from "next/link";
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
  Sparkles,
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
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/80 bg-[#0c1222]/90 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-100 tracking-tight text-base leading-snug">
            AI Business Manager
          </h1>
          <p className="text-xs text-sky-400 font-medium">Personal Assistant</p>
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected (₹0 Dev)
          </span>
        </div>
      </div>
    </aside>
  );
}
