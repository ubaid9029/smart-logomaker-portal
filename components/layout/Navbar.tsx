"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu, User, ChevronDown, LogOut, Settings, Shield } from "lucide-react";
import { signOut } from "@/app/actions";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-white/40 px-4 backdrop-blur-3xl sm:px-6 lg:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center group">
          <img 
            src="/logo.svg" 
            alt="Smart Logo Maker" 
            className="h-9 w-auto transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
          />
        </Link>

        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground md:hidden hover:bg-slate-50 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center relative sm:flex">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search everything..."
            className="h-9 w-64 rounded-xl bg-slate-50/50 pl-10 pr-4 text-xs outline-none transition-all focus:ring-4 focus:ring-brand-primary/5 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-slate-50 hover:text-foreground transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-secondary border-2 border-white" />
          </button>
          
          <div className="h-8 w-[1px] bg-slate-100 mx-1" />

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`group flex items-center gap-2 rounded-xl p-1 pr-2 transition-all ${
                isProfileOpen ? "bg-slate-50 shadow-sm" : "hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isProfileOpen ? "brand-gradient-bg text-white shadow-md" : "bg-slate-100 text-slate-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
              }`}>
                <User className="h-5 w-5" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[11px] font-bold text-foreground leading-none">Admin</p>
                <p className="text-[9px] font-medium text-muted-foreground">Superuser</p>
              </div>
              <ChevronDown className={`hidden h-3 w-3 text-muted-foreground sm:block transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Account</p>
                  <p className="text-xs font-bold text-foreground truncate">devsinntechnologies@gmail.com</p>
                </div>
                
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-foreground">
                  <Shield className="h-4 w-4 text-slate-400" />
                  My Profile
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-foreground">
                  <Settings className="h-4 w-4 text-slate-400" />
                  Settings
                </button>
                
                <div className="h-[1px] bg-slate-50 my-1" />
                
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
