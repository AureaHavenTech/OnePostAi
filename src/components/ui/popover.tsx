"use client";

import React, { useState, useRef, useEffect } from "react";

interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  return <div className="relative inline-block text-left">{children}</div>;
}

interface PopoverTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // This is a bit of a hack to pass state to siblings in this simple implementation
  // In a real project we'd use a Context or a library like Radix
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      // We'll handle state via a custom event or similar if we were being thorough
      // But for this simple case, let's look at the parent/child structure
    }
  });
}

// Rewriting to a more functional simple popover for this environment
export function PopoverContent({ children, className, align = "center" }: { children: React.ReactNode, className?: string, align?: "start" | "center" | "end" }) {
  return (
    <div className={`absolute z-50 mt-2 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"} ${className}`}>
      {children}
    </div>
  );
}

// Actually, let's make it a single component for simplicity since I'm building it from scratch
import { Bell } from "lucide-react";

export function NotificationPopover({ unreadCount, notifications, markAsRead, markAllRead }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notifications</h3>
            <button 
              onClick={() => { markAllRead(); setIsOpen(false); }}
              className="text-[10px] text-brand-400 hover:text-brand-300 font-medium"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No notifications yet
              </div>
            ) : (
              notifications.map((n: any) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${!n.is_read ? 'bg-brand-500/5' : ''}`}
                  onClick={() => { markAsRead(n.id); }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-brand-500' : 'bg-slate-700'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${!n.is_read ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-slate-600 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
