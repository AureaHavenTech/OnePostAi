"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Lightbulb, CalendarDays, Briefcase, Settings, LogOut, Menu, X, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard/create", label: "Create", icon: Wand2 },
    { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
    { href: "/dashboard/calendar", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/dashboard/affiliates", label: "Affiliates", icon: Gift },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-56 bg-white/80 backdrop-blur-xl border-r border-gold/10 z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gold/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
                <span className="text-[10px] font-bold text-dark">O</span>
              </div>
              <span className="text-xs font-semibold text-dark">OnePost AI</span>
            </Link>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                  active 
                    ? "bg-gold/10 text-gold font-medium" 
                    : "text-gray-400 hover:text-dark hover:bg-gold/5"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-gold/10">
            <Link href="/dashboard/owner" onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                pathname === "/dashboard/owner"
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-gray-400 hover:text-dark hover:bg-gold/5"
              )}>
                <Sparkles className="w-4 h-4" />
                Founder Access
              </div>
            </Link>
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-dark hover:bg-gold/5 transition-all">
                <LogOut className="w-4 h-4" />
                Sign Out
              </div>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-56">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-gold/10 px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
              <span className="text-[10px] font-bold text-dark">O</span>
            </div>
            <span className="text-xs font-semibold text-dark">OnePost AI</span>
          </Link>
          <button className="p-1.5" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-dark" />
          </button>
        </div>

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}