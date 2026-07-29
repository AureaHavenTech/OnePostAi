"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Lightbulb, CalendarDays, Briefcase, Settings, LogOut, Menu, X, Sparkles, Gift, Coins, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartSearch, type SearchResult } from "@/components/smart-search";
import { Breadcrumbs } from "@/components/breadcrumbs";
import ThemeToggle from "@/components/theme-toggle";

const SEARCH_RESULTS: SearchResult[] = [
  { label: "Dashboard", href: "/dashboard", category: "Page" },
  { label: "Create Content", href: "/dashboard", category: "Action", keywords: "generate video post" },
  { label: "Content Ideas", href: "/dashboard/ideas", category: "Page", keywords: "viral trending" },
  { label: "Schedule Posts", href: "/dashboard/calendar", category: "Page", keywords: "calendar plan" },
  { label: "Portfolio", href: "/dashboard/portfolio", category: "Page", keywords: "brands" },
  { label: "Publish", href: "/dashboard/publish", category: "Action", keywords: "post share" },
  { label: "Affiliates", href: "/dashboard/affiliates", category: "Page", keywords: "referral earn" },
  { label: "Settings", href: "/dashboard/settings", category: "Page", keywords: "profile account" },
  { label: "Founder Access", href: "/dashboard/owner", category: "Admin", keywords: "ceo admin" },
  { label: "Pricing", href: "/pricing", category: "Page", keywords: "upgrade plan" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Create", icon: Wand2 },
    { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
    { href: "/dashboard/calendar", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/dashboard/publish", label: "Publish", icon: Send },
    { href: "/dashboard/affiliates", label: "Affiliates", icon: Gift },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const sidebarWidth = collapsed ? "w-16" : "w-56";

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 bg-white/80 backdrop-blur-xl border-r border-gold/10 z-50 transform transition-all duration-200",
          sidebarWidth,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className={cn("p-4 border-b border-gold/10 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-dark">O</span>
                </div>
                <span className="text-xs font-semibold text-dark">OnePost AI</span>
              </Link>
              <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
                <span className="text-[10px] font-bold text-dark">O</span>
              </div>
            </Link>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} title={collapsed ? item.label : undefined}>
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-gray-400 hover:text-dark hover:bg-gold/5"
                )}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && item.label}
                </div>
              </Link>
            );
          })}

          {!collapsed && (
            <div className="pt-3 mt-3 border-t border-gold/10">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs mb-2 bg-gold/5 border border-gold/10">
                <Coins className="w-3.5 h-3.5 text-gold" />
                <span className="text-gray-400">Credits</span>
                <span className="ml-auto font-semibold text-gold">50</span>
              </div>

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

              {/* Keyboard shortcuts hint */}
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-dark hover:bg-gold/5 transition-all w-full text-left mt-1"
                title="Keyboard shortcuts"
              >
                <span>⌨</span>
                <span>Shortcuts</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-gold/10 rounded text-gold/60">?</kbd>
              </button>
            </div>
          )}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gold/10 items-center justify-center hover:bg-gold/5 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-gold" /> : <ChevronLeft className="w-3 h-3 text-gold" />}
        </button>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-200", collapsed ? "lg:ml-16" : "lg:ml-56")}>
        {/* Sticky header (desktop + mobile) */}
        <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-gold/10">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <button className="p-1.5" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5 text-dark" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-dark">O</span>
                </div>
                <span className="text-xs font-semibold text-dark">OnePost AI</span>
              </Link>
            </div>

            {/* Smart Search */}
            <div className="flex-1 max-w-md mx-auto px-2 lg:px-0">
              <SmartSearch results={SEARCH_RESULTS} placeholder="Search pages, features..." />
            </div>

            {/* Right side: theme toggle + spacer */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-20 lg:hidden" />
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
