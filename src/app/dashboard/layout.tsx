"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Wand2, Lightbulb, Clock, Briefcase, Settings, LogOut, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Create", icon: Wand2 },
    { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
    { href: "/dashboard/calendar", label: "Schedule", icon: Clock },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 border-r border-white/5 bg-zinc-900/95 backdrop-blur-xl transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="OnePost AI" className="h-8 w-auto" />
          </Link>
          <button className="lg:hidden p-1 text-zinc-500 hover:text-zinc-300" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {pathname === item.href && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-medium">
                D
              </div>
              <span className="text-sm text-zinc-400">Demo Creator</span>
            </div>
            <button onClick={() => router.push("/")} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-medium">
            ✅ Pro Plan — auto-publishing active
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <button className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-500">
              <LayoutDashboard className="w-4 h-4" />
              <span>{pathname === "/dashboard" ? "Create Content" : pathname.split("/").pop()}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-indigo-300 font-medium">AI Engine Ready</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}