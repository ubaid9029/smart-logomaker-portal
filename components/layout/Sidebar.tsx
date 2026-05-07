"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  FileText,
  X
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Logs", href: "/logs", icon: Activity },
  { label: "API Documentation", href: "/api-docs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 bg-white p-6 md:block">
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-orange-50 text-orange-500 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                  }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="mt-auto px-2 py-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Live</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
