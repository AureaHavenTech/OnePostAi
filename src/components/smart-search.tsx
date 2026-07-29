"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SearchResult {
  label: string;
  href: string;
  keywords?: string;
  category?: string;
}

interface SmartSearchProps {
  results: SearchResult[];
  placeholder?: string;
  className?: string;
}

/**
 * Smart search with debounced filtering and highlighted matches.
 * Drop-in for dashboard headers.
 */
export function SmartSearch({ results, placeholder = "Search...", className }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce filter
  const [filtered, setFiltered] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const matches = results.filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          (r.keywords || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q)
      );
      setFiltered(matches.slice(0, 8));
      setActiveIdx(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered[activeIdx]) {
        e.preventDefault();
        window.location.href = filtered[activeIdx].href;
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [open, filtered, activeIdx]
  );

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[#c9a96e]/30 text-[#e8e0d4] rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e8e0d4]/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-[#12121a] border border-[#1e1e2a] rounded-lg text-sm text-[#e8e0d4] placeholder-[#e8e0d4]/30 focus:outline-none focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#1e1e2a]"
          >
            <X className="w-3 h-3 text-[#e8e0d4]/40" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {filtered.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                i === activeIdx
                  ? "bg-[#c9a96e]/10 text-[#e8e0d4]"
                  : "text-[#e8e0d4]/70 hover:bg-[#1e1e2a] hover:text-[#e8e0d4]"
              )}
            >
              <span className="flex-1 truncate">{highlight(item.label)}</span>
              {item.category && (
                <span className="text-[10px] text-[#e8e0d4]/30 uppercase tracking-wider shrink-0">
                  {item.category}
                </span>
              )}
              <ArrowRight className="w-3 h-3 text-[#e8e0d4]/20 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {open && query && filtered.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg shadow-xl shadow-black/40 z-50 p-3 text-center text-xs text-[#e8e0d4]/40">
          No results found
        </div>
      )}
    </div>
  );
}
