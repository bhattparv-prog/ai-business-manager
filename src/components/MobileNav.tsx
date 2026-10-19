"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Bot, CheckSquare, Bell } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Data", href: "/collections", icon: Layers },
    { label: "AI", href: "/assistant", icon: Bot },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Alerts", href: "/notifications", icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel bg-[#090d16]/95 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-50 pb-[env(safe-area-inset-bottom,8px)]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? "text-sky-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-sky-400 scale-110" : "text-slate-400"} transition-transform`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
