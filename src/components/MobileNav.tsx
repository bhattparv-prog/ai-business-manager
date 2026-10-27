"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Bot, Calendar, Plus, CheckSquare } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const leftItems = [
    { label: "Workplace", href: "/dashboard", icon: LayoutDashboard },
    { label: "Base", href: "/collections", icon: Layers },
  ];

  const rightItems = [
    { label: "Bookings", href: "/reports", icon: Calendar },
    { label: "Lark AI", href: "/assistant", icon: Bot },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#DEE0E3] shadow-[0_8px_30px_rgba(31,35,41,0.12)] flex items-center gap-2">
      {/* Left items */}
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
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
              isActive
                ? "bg-[#EBF1FF] text-[#3370FF] font-bold"
                : "text-[#646A73] hover:text-[#1F2329] hover:bg-[#F5F6F7]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}

      {/* Elevated Center (+) Quick Create Button */}
      <Link
        href="/tasks"
        title="Quick Add Task or Booking"
        className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#3370FF] to-[#2860E1] text-white flex items-center justify-center shadow-md shadow-[#3370FF]/35 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </Link>

      {/* Right items */}
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
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
              isActive
                ? "bg-[#EBF1FF] text-[#3370FF] font-bold"
                : "text-[#646A73] hover:text-[#1F2329] hover:bg-[#F5F6F7]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
