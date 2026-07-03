"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Plus, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Mock current week dates
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const scheduledPosts: Record<string, string[]> = {
    "Mon": ["🔥 Mellow Sleep review → TikTok 9am", "📦 Tech unboxing → IG Reel 3pm"],
    "Wed": ["💡 Sleep hack video → All platforms 10am"],
    "Fri": ["💰 Affiliate earnings breakdown → LinkedIn 12pm"],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Content Calendar</h1>
          <p className="text-zinc-500 mt-1 text-sm">Schedule posts and let OnePost publish on autopilot.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="glow" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between glass-card p-4">
        <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
        <div className="text-sm font-medium text-zinc-200">
          {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, i) => (
          <div key={day} className="glass-card p-3 min-h-[200px]">
            <div className="text-center mb-3">
              <p className="text-xs font-medium text-zinc-500">{day}</p>
              <p className={`text-lg font-bold mt-1 ${i === today.getDay() - 1 ? 'text-indigo-400' : 'text-zinc-300'}`}>
                {weekDates[i].getDate()}
              </p>
            </div>

            <div className="space-y-2">
              {(scheduledPosts[day] || []).map((post, j) => (
                <div key={j} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <p className="text-indigo-300 leading-relaxed">{post}</p>
                </div>
              ))}

              {/* Empty slot */}
              {(!scheduledPosts[day] || scheduledPosts[day].length === 0) && (
                <button className="w-full p-2 rounded-lg border border-dashed border-white/5 text-xs text-zinc-600 hover:border-indigo-500/30 hover:text-indigo-400 transition-all">
                  + Add post
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Queue */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" />
          Upcoming Queue
        </h3>
        <div className="space-y-3">
          {[
            { time: "Today, 9:00 AM", title: "Mellow Sleep mattress review", platforms: "TikTok, IG Reel", status: "Ready" },
            { time: "Today, 3:00 PM", title: "Tech unboxing video", platforms: "Instagram Reel", status: "Ready" },
            { time: "Tomorrow, 10:00 AM", title: "Sleep tips compilation", platforms: "All platforms", status: "AI Generating" },
            { time: "Wed, 12:00 PM", title: "Affiliate earnings breakdown", platforms: "LinkedIn", status: "Draft" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.time} · {item.platforms}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.status === "Ready" ? "bg-green-500/10 text-green-400" :
                item.status === "AI Generating" ? "bg-indigo-500/10 text-indigo-400" :
                "bg-zinc-800 text-zinc-400"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}