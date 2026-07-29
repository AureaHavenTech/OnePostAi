"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Wand2, Lightbulb, CalendarDays, Briefcase, Settings,
  LogOut, Menu, X, Sparkles, Gift, Coins, Send, Search, ChevronRight,
  Home, Moon, Sun, Keyboard, Copy, Check, Wifi, WifiOff, Bell, BellOff,
  ArrowUp, ArrowDown, CornerDownLeft, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  tooltip?: string;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface SearchResult {
  label: string;
  href: string;
  icon: string;
  category: string;
}

// ── Search index ───────────────────────────────────────────
const SEARCH_INDEX: SearchResult[] = [
  { label: "AI Chat / Create", href: "/dashboard", icon: "✨", category: "Core" },
  { label: "Content Ideas", href: "/dashboard/ideas", icon: "💡", category: "Core" },
  { label: "Schedule Calendar", href: "/dashboard/calendar", icon: "📅", category: "Core" },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: "💼", category: "Core" },
  { label: "Publish Posts", href: "/dashboard/publish", icon: "📤", category: "Core" },
  { label: "Brand Kit", href: "/dashboard/brand-kit", icon: "🎨", category: "Core" },
  { label: "Affiliates", href: "/dashboard/affiliates", icon: "🎁", category: "Growth" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊", category: "Growth" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️", category: "System" },
  { label: "Founder Access", href: "/dashboard/owner", icon: "👑", category: "System" },
  { label: "Pricing Plans", href: "/pricing", icon: "💳", category: "System" },
  { label: "Support", href: "/support", icon: "🆘", category: "System" },
];

// ── Breadcrumb resolver ────────────────────────────────────
function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Dashboard", href: "/dashboard" }];
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return crumbs;

  const map: Record<string, string> = {
    ideas: "Ideas", calendar: "Schedule", portfolio: "Portfolio",
    publish: "Publish", "brand-kit": "Brand Kit", affiliates: "Affiliates",
    analytics: "Analytics", settings: "Settings", owner: "Founder Access",
  };

  let path = "/dashboard";
  for (let i = 1; i < parts.length; i++) {
    path += "/" + parts[i];
    crumbs.push({ label: map[parts[i]] || parts[i], href: path });
  }
  return crumbs;
}

// ── Component ──────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Announcement
  const [announceVisible, setAnnounceVisible] = useState(true);
  const [emailCapture, setEmailCapture] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Offline
  const [isOnline, setIsOnline] = useState(true);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Tooltip onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Create", icon: Wand2, shortcut: "1", tooltip: "AI chat & content generation" },
    { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb, shortcut: "2", tooltip: "Viral content ideas" },
    { href: "/dashboard/calendar", label: "Schedule", icon: CalendarDays, shortcut: "3", tooltip: "Content calendar" },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase, shortcut: "4", tooltip: "Your content library" },
    { href: "/dashboard/publish", label: "Publish", icon: Send, shortcut: "5", tooltip: "Post to all platforms" },
    { href: "/dashboard/affiliates", label: "Affiliates", icon: Gift, shortcut: "6", tooltip: "Earn commissions" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, shortcut: "7", tooltip: "Account & preferences" },
  ];

  const breadcrumbs = getBreadcrumbs(pathname);

  // ── Init ─────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("onepost_darkMode");
    if (saved === "true") { setDarkMode(true); document.body.classList.add("dark-mode"); }
    const onboarded = localStorage.getItem("onepost_onboarded");
    if (onboarded) setOnboardingDone(true);
    setIsOnline(navigator.onLine);
  }, []);

  // ── Dark mode toggle ─────────────────────────────────────
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("onepost_darkMode", String(next));
      if (next) document.body.classList.add("dark-mode");
      else document.body.classList.remove("dark-mode");
      return next;
    });
  }, []);

  // ── Online/offline detection ─────────────────────────────
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  // ── Session auto-save ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem("onepost_session_ts", Date.now().toString());
      } catch { /* quota exceeded */ }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd+K / Ctrl+K → Search
      if (mod && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
        return;
      }

      // Cmd+B / Ctrl+B → Toggle sidebar
      if (mod && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
        return;
      }

      // Cmd+D / Ctrl+D → Dark mode
      if (mod && e.key === "d" && !e.shiftKey) {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // Escape → Close search / sidebar
      if (e.key === "Escape") {
        if (searchOpen) { setSearchOpen(false); return; }
        if (sidebarOpen) { setSidebarOpen(false); return; }
      }

      // Number shortcuts for nav when not in input
      if (!mod && !searchOpen && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= navItems.length) {
          e.preventDefault();
          router.push(navItems[num - 1].href);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, sidebarOpen, navItems, router, toggleDarkMode]);

  // ── Search logic ─────────────────────────────────────────
  const filteredResults = searchQuery.trim()
    ? SEARCH_INDEX.filter(r =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_INDEX;

  const navigateSearch = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSearchIndex(prev => Math.min(prev + 1, filteredResults.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSearchIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[searchIndex]) {
        router.push(filteredResults[searchIndex].href);
        setSearchOpen(false);
        setSearchQuery("");
        setSearchIndex(0);
      }
    }
  };

  // ── Email capture ────────────────────────────────────────
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCapture.includes("@")) {
      setEmailSubmitted(true);
      try { localStorage.setItem("onepost_email_captured", emailCapture); } catch {}
    }
  };

  // ── Push notification opt-in ─────────────────────────────
  const requestNotifications = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const result = await Notification.requestPermission();
      if (result === "granted") setNotificationsEnabled(true);
    } else if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  };

  // ── Copy page URL ────────────────────────────────────────
  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Haptic press ─────────────────────────────────────────
  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // ── Onboarding complete ──────────────────────────────────
  const finishOnboarding = () => {
    setOnboardingDone(true);
    setOnboardingStep(0);
    localStorage.setItem("onepost_onboarded", "true");
  };

  const onboardingTips = [
    { target: "search-btn", text: "Press ⌘K to search anywhere", icon: Search },
    { target: "sidebar-toggle", text: "Press ⌘B to collapse sidebar", icon: Menu },
    { target: "dark-toggle", text: "Press ⌘D for dark mode", icon: Moon },
  ];

  return (
    <div className={cn("min-h-screen bg-cream transition-colors duration-300")}>
      {/* ── Announcement Bar ──────────────────────────── */}
      {announceVisible && (
        <div className="sticky top-0 z-[60] bg-gradient-to-r from-gold via-[#d4b87a] to-gold text-dark">
          <div className="flex items-center justify-center gap-4 px-4 py-2 text-xs font-medium">
            {!emailSubmitted ? (
              <form onSubmit={submitEmail} className="flex items-center gap-2">
                <span className="hidden sm:inline">🎉 <strong>50% off</strong> your first month — </span>
                <input
                  type="email"
                  value={emailCapture}
                  onChange={e => setEmailCapture(e.target.value)}
                  placeholder="Enter your email..."
                  className="px-3 py-1 rounded-lg bg-dark/10 text-dark placeholder:text-dark/50 text-xs border-none outline-none w-40 sm:w-48"
                />
                <button type="submit" className="px-3 py-1 rounded-lg bg-dark text-gold text-xs font-semibold haptic">
                  Claim Offer
                </button>
              </form>
            ) : (
              <span>✅ Offer claimed! Check your inbox for the discount code.</span>
            )}
            <button onClick={() => setAnnounceVisible(false)} className="p-1 hover:bg-dark/10 rounded haptic">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sticky Header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-gold/10">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: hamburger + breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="sidebar-toggle"
              onClick={() => { setSidebarCollapsed(prev => !prev); haptic(); }}
              className="p-2 rounded-lg hover:bg-gold/5 haptic tooltip-trigger hidden lg:flex"
            >
              <Menu className="w-5 h-5 text-dark" />
              <span className="tooltip-content">Toggle sidebar (⌘B)</span>
            </button>
            <button onClick={() => { setSidebarOpen(true); haptic(); }} className="p-2 rounded-lg hover:bg-gold/5 haptic lg:hidden">
              <Menu className="w-5 h-5 text-dark" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-charcoal/50">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  {crumb.href && i < breadcrumbs.length - 1 ? (
                    <Link href={crumb.href} className="hover:text-gold transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-dark font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: search + actions */}
          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              id="search-btn"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/10 text-xs text-charcoal/50 hover:border-gold/30 hover:text-dark transition-all haptic tooltip-trigger"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-mono">⌘K</kbd>
              <span className="tooltip-content">Search pages, features & settings</span>
            </button>

            {/* Copy URL */}
            <button onClick={() => { copyPageUrl(); haptic(); }}
              className="p-2 rounded-lg hover:bg-gold/5 haptic tooltip-trigger hidden sm:flex">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-charcoal/50" />}
              <span className="tooltip-content">{copied ? "Copied!" : "Copy page URL"}</span>
            </button>

            {/* Dark mode */}
            <button id="dark-toggle" onClick={() => { toggleDarkMode(); haptic(); }}
              className="p-2 rounded-lg hover:bg-gold/5 haptic tooltip-trigger">
              {darkMode ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-charcoal/50" />}
              <span className="tooltip-content">Dark mode (⌘D)</span>
            </button>

            {/* Online/Offline */}
            <span className="p-2 tooltip-trigger hidden sm:flex">
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              <span className="tooltip-content">{isOnline ? "Online — auto-saving" : "Offline — drafts saved locally"}</span>
            </span>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-700 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            You're offline. Changes are saved locally and will sync when reconnected.
          </div>
        )}
      </header>

      {/* ── Search overlay ────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gold/10">
              <Search className="w-5 h-5 text-gold shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchIndex(0); }}
                onKeyDown={navigateSearch}
                placeholder="Search pages, features, settings..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-dark placeholder:text-charcoal/40"
                autoFocus
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-mono">esc</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-charcoal/50">No results for "{searchQuery}"</div>
              ) : (
                filteredResults.map((result, i) => (
                  <button
                    key={result.href}
                    onClick={() => { router.push(result.href); setSearchOpen(false); setSearchQuery(""); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all",
                      i === searchIndex ? "bg-gold/10 text-dark font-medium" : "text-charcoal/70 hover:bg-gold/5"
                    )}
                    onMouseEnter={() => setSearchIndex(i)}
                  >
                    <span className="text-lg">{result.icon}</span>
                    <span className="flex-1">{result.label}</span>
                    <span className="text-[10px] text-charcoal/40">{result.category}</span>
                    {i === searchIndex && <CornerDownLeft className="w-3.5 h-3.5 text-gold" />}
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-gold/10 flex items-center gap-3 text-[10px] text-charcoal/40">
              <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigate</span>
              <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Open</span>
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 bg-white/90 backdrop-blur-xl border-r border-gold/10 transition-all duration-300 flex flex-col",
        sidebarCollapsed && !sidebarOpen ? "w-0 lg:w-16 -translate-x-full lg:translate-x-0" : "w-56",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        {/* Logo */}
        <div className={cn("p-4 border-b border-gold/10 flex items-center", sidebarCollapsed && !sidebarOpen ? "justify-center" : "justify-between")}>
          <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md shrink-0">
              <span className="text-[10px] font-bold text-dark">O</span>
            </div>
            {(!sidebarCollapsed || sidebarOpen) && <span className="text-xs font-semibold text-dark">OnePost AI</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => { setSidebarOpen(false); haptic(); }}>
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all haptic",
                  active
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-gray-400 hover:text-dark hover:bg-gold/5",
                  sidebarCollapsed && !sidebarOpen && "justify-center px-2"
                )}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {(!sidebarCollapsed || sidebarOpen) && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-mono">{item.shortcut}</kbd>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-gold/10">
            {/* Credit Display */}
            {(!sidebarCollapsed || sidebarOpen) && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs mb-2 bg-gold/5 border border-gold/10">
                <Coins className="w-3.5 h-3.5 text-gold" />
                <span className="text-gray-400">Credits</span>
                <span className="ml-auto font-semibold text-gold">50</span>
              </div>
            )}
            {sidebarCollapsed && !sidebarOpen && (
              <div className="flex justify-center mb-2">
                <Coins className="w-4 h-4 text-gold" />
              </div>
            )}

            <Link href="/dashboard/owner" onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all haptic",
                pathname === "/dashboard/owner" ? "bg-gold/10 text-gold font-medium" : "text-gray-400 hover:text-dark hover:bg-gold/5",
                sidebarCollapsed && !sidebarOpen && "justify-center px-2"
              )}>
                <Sparkles className="w-4 h-4 shrink-0" />
                {(!sidebarCollapsed || sidebarOpen) && "Founder Access"}
              </div>
            </Link>

            {/* Push notification toggle */}
            <button onClick={requestNotifications} className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all haptic",
              notificationsEnabled ? "text-emerald-600" : "text-gray-400 hover:text-dark hover:bg-gold/5",
              sidebarCollapsed && !sidebarOpen && "justify-center px-2"
            )}>
              {notificationsEnabled ? <Bell className="w-4 h-4 shrink-0" /> : <BellOff className="w-4 h-4 shrink-0" />}
              {(!sidebarCollapsed || sidebarOpen) && (notificationsEnabled ? "Notifications ON" : "Enable Alerts")}
            </button>

            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-dark hover:bg-gold/5 transition-all haptic",
                sidebarCollapsed && !sidebarOpen && "justify-center px-2"
              )}>
                <LogOut className="w-4 h-4 shrink-0" />
                {(!sidebarCollapsed || sidebarOpen) && "Sign Out"}
              </div>
            </Link>
          </div>
        </nav>
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed && !sidebarOpen ? "lg:ml-16" : "lg:ml-56"
      )}>
        {/* Keyboard shortcut bar */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 border-b border-gold/5 text-[10px] text-charcoal/30">
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-gold/5 font-mono">⌘K</kbd> Search</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-gold/5 font-mono">⌘B</kbd> Sidebar</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-gold/5 font-mono">⌘D</kbd> Dark mode</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-gold/5 font-mono">1-7</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-gold/5 font-mono">esc</kbd> Close</span>
        </div>

        <main className="p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>

      {/* ── Onboarding tooltip ────────────────────────── */}
      {!onboardingDone && onboardingStep < onboardingTips.length && (() => {
        const TipIcon = onboardingTips[onboardingStep].icon;
        return (
        <div className="fixed bottom-6 right-6 z-[80] max-w-xs bg-dark text-cream rounded-2xl shadow-2xl p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <TipIcon className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-cream">{onboardingTips[onboardingStep].text}</p>
              <p className="text-[10px] text-cream/50 mt-1">Tip {onboardingStep + 1} of {onboardingTips.length}</p>
            </div>
            <button onClick={finishOnboarding} className="p-1 text-cream/40 hover:text-cream/70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setOnboardingStep(prev => Math.min(prev + 1, onboardingTips.length - 1))}
              className="flex-1 px-3 py-1.5 rounded-lg bg-gold text-dark text-xs font-semibold haptic">
              Next Tip
            </button>
            <button onClick={finishOnboarding} className="px-3 py-1.5 rounded-lg border border-cream/20 text-cream/70 text-xs haptic">
              Got it
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
