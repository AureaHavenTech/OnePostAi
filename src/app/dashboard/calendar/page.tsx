"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Plus, ChevronLeft, ChevronRight, Zap, CheckCircle, AlertCircle } from "lucide-react";

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  tiktok: { label: "TikTok", color: "#ff0050", icon: "🎵" },
  instagram: { label: "Instagram", color: "#e4405f", icon: "📸" },
  facebook: { label: "Facebook", color: "#1877f2", icon: "👍" },
  youtube: { label: "YouTube", color: "#ff0000", icon: "▶️" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", icon: "💼" },
  snapchat: { label: "Snapchat", color: "#fffc00", icon: "👻" },
  pinterest: { label: "Pinterest", color: "#e60023", icon: "📌" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Record<string, any[]>>({});
  const [content, setContent] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  async function loadData() {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const firstDay = `${year}-${month}-01`;
      const lastDay = `${year}-${month}-${new Date(year, currentDate.getMonth() + 1, 0).getDate()}`;

      const [schedRes, contentRes] = await Promise.all([
        fetch(`/api/schedule/calendar?startDate=${firstDay}&endDate=${lastDay}`).then(r => r.json()),
        fetch("/api/content").then(r => r.json()),
      ]);

      setSchedules(schedRes.data || {});
      const cMap: Record<string, any> = {};
      (contentRes.data || []).forEach((item: any) => { cMap[item.id] = item; });
      setContent(cMap);
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const today = new Date().toISOString().split("T")[0];

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">📅 Content Calendar</h1>
          <p className="text-zinc-500 mt-1 text-sm">Schedule and manage posts — 3x/day, 2-week view</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => document.getElementById("autoScheduleModal")?.showModal()}>
          <Zap className="w-4 h-4 mr-1.5" /> Auto-Schedule
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - 1);
          setCurrentDate(d);
        }}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold min-w-[200px] text-center text-zinc-200">{monthName}</h3>
        <Button variant="ghost" size="sm" onClick={() => {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() + 1);
          setCurrentDate(d);
        }}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-white/5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-[#12121a]">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-start-${i}`} className="min-h-[100px] p-2 bg-black/20 opacity-40" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const dayPosts = schedules[dateStr] || [];
            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 bg-[#1a1a24] border-b border-r border-white/5 cursor-pointer transition-all duration-150 ${
                  isToday ? "bg-[#c9a84c]/10 ring-1 ring-[#c9a84c]/30" : "hover:bg-[#22222e]"
                } ${selectedDate === dateStr ? "ring-2 ring-[#c9a84c]" : ""}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? "text-[#c9a84c]" : "text-zinc-400"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map((post: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1"
                      style={{
                        background: `${PLATFORM_CONFIG[post.platform]?.color}20`,
                        color: PLATFORM_CONFIG[post.platform]?.color || "#aaa",
                        borderLeft: `3px solid ${post.status === "posted" ? "#22c55e" : "#c9a84c"}`,
                      }}
                      title={post.content_id}
                    >
                      <span>{PLATFORM_CONFIG[post.platform]?.icon || "📱"}</span>
                      <span className="truncate">{content[post.content_id]?.brand || "Untitled"}</span>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-[0.65rem] text-zinc-500 cursor-pointer">+{dayPosts.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
          {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[100px] p-2 bg-black/20 opacity-40" />
          ))}
        </div>
      </div>

      {/* Selected Day Posts */}
      {selectedDate && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">
            Posts for <span className="text-[#c9a84c]">{formatDate(selectedDate)}</span>
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-white/10 border-t-[#c9a84c] rounded-full animate-spin" />
            </div>
          ) : (schedules[selectedDate] || []).length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="text-3xl mb-2">📭</div>
              <p className="font-medium">No posts scheduled</p>
              <Button variant="glow" size="sm" className="mt-3" onClick={() => document.getElementById("autoScheduleModal")?.showModal()}>
                + Schedule a Post
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules[selectedDate].map((post: any, idx: number) => {
                const c = content[post.content_id] || {};
                const time = new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: `${PLATFORM_CONFIG[post.platform]?.color}20` }}>
                      {PLATFORM_CONFIG[post.platform]?.icon || "📱"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-zinc-200">{c.brand || "Untitled"}</div>
                      <div className="text-xs text-zinc-500 truncate">{c.hook || "No hook"}</div>
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {time}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {post.status === "posted" ? (
                        <><CheckCircle className="w-3 h-3 text-green-500" /> <span className="text-green-400">Posted</span></>
                      ) : post.status === "failed" ? (
                        <><AlertCircle className="w-3 h-3 text-red-500" /> <span className="text-red-400">Failed</span></>
                      ) : (
                        <><Clock className="w-3 h-3 text-amber-500" /> <span className="text-amber-400">Scheduled</span></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Auto-Schedule Modal */}
      <dialog id="autoScheduleModal" className="rounded-xl shadow-2xl border-0 p-0 max-w-lg w-full backdrop:bg-black/50 bg-[#1a1a24]">
        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-5">⚡ Auto-Schedule Posts</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Content</label>
              <select id="autoContentId" className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm">
                <option value="">— Select content —</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                  <label key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-sm cursor-pointer transition-all hover:border-[#c9a84c] has-[:checked]:bg-[#c9a84c]/10 has-[:checked]:border-[#c9a84c] text-zinc-300">
                    <input type="checkbox" value={key} defaultChecked className="accent-[#c9a84c]" />
                    {cfg.icon} {cfg.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Start Date</label>
                <input type="date" id="autoStartDate" defaultValue={today} className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Duration</label>
                <select id="autoDays" className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm">
                  <option value="7">7 days</option>
                  <option value="10">10 days</option>
                  <option value="14" selected>14 days</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => document.getElementById("autoScheduleModal")?.close()} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 transition-colors">Cancel</button>
            <Button variant="glow" size="sm" onClick={autoSchedule}>🚀 Schedule Now</Button>
          </div>
        </div>
      </dialog>
    </div>
  );

  async function autoSchedule() {
    const contentId = (document.getElementById("autoContentId") as HTMLSelectElement)?.value;
    const platforms = [...document.querySelectorAll("#autoScheduleModal input[type=checkbox]:checked")].map(i => (i as HTMLInputElement).value);
    const days = parseInt((document.getElementById("autoDays") as HTMLSelectElement)?.value || "14");
    if (!contentId || platforms.length === 0) return alert("Please select content and at least one platform");
    try {
      const res = await fetch("/api/schedule/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, platforms, days })
      }).then(r => r.json());
      alert(`${res.data?.length || 0} posts scheduled!`);
      (document.getElementById("autoScheduleModal") as HTMLDialogElement)?.close();
      loadData();
    } catch (err) {
      alert("Failed to schedule: " + (err as Error).message);
    }
  }
}