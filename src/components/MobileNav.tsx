"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Bot, BarChart3, Plus, Bell } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const leftItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Records", href: "/collections", icon: Layers },
  ];

  const rightItems = [
    { label: "Analytics", href: "/reports", icon: BarChart3 },
    { label: "Assistant", href: "/assistant", icon: Bot },
  ];

  return (
    <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex items-center gap-3">
      {/* Left 2 items */}
      {leftItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isActive
                ? "bg-orange-50 text-orange-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}

      {/* Elevated Center (+) Button */}
      <Link
        href="/tasks"
        title="Quick Add Task or Record"
        className="w-12 h-12 -my-3 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/35 border-2 border-white hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </Link>

      {/* Right 2 items */}
      {rightItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isActive
                ? "bg-orange-50 text-orange-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </nav>
  );
}
