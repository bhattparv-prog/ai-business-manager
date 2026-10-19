"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Bot, BarChart3, Plus, Bell } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Records", href: "/collections", icon: Layers },
    { label: "Analytics", href: "/reports", icon: BarChart3 },
    { label: "AI", href: "/assistant", icon: Bot },
    { label: "Alerts", href: "/notifications", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_16px_48px_rgba(0,0,0,0.14)] flex items-center gap-1.5 sm:gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isActive
                ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        );
      })}

      {/* Floating Action Button (+) */}
      <Link
        href="/collections"
        title="Add Record or Manage Data"
        className="w-9 h-9 sm:w-10 sm:h-10 ml-1 rounded-full bg-slate-950 hover:bg-black text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
      </Link>
    </nav>
  );
}
