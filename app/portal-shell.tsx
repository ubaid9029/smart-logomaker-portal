"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { X } from "lucide-react";

interface PortalShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function PortalShell({ title, description, children }: PortalShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden brand-page-shell">
      <div className="sr-only" aria-live="polite">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {/* Navbar (Full Width at Top) */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div className={`fixed inset-y-0 left-0 z-55 w-72 transform bg-sidebar transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-lg font-black tracking-tight text-white">
              SMART LOGO
            </span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Sidebar />
        </div>

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {children}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
