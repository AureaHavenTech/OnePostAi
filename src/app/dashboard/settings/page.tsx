"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Bell, Link2, User, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Manage your account and integrations.
        </p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          Profile
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Email</label>
            <Input value="demo@onepost.ai" className="bg-zinc-900/60" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Display Name</label>
            <Input placeholder="Your name" className="bg-zinc-900/60" />
          </div>
        </div>
      </div>

      {/* API Integrations */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Social API Connections
        </h3>
        <div className="space-y-3">
          {[
            { name: "Instagram / Facebook", connected: false, color: "text-pink-400" },
            { name: "TikTok", connected: false, color: "text-purple-400" },
            { name: "YouTube", connected: false, color: "text-red-400" },
            { name: "LinkedIn", connected: false, color: "text-blue-400" },
          ].map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5">
              <span className={`text-sm font-medium ${platform.color}`}>{platform.name}</span>
              <Button variant="outline" size="sm">
                {platform.connected ? "Connected" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Subscription
        </h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
          <div>
            <p className="text-sm font-medium text-zinc-200">Pro Plan — Active</p>
            <p className="text-xs text-zinc-500 mt-0.5">$29/month — Next billing: Jan 15, 2026</p>
          </div>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h3>
        <div className="space-y-3">
          {[
            "Campaign published successfully",
            "AI generation complete",
            "Scheduled post failed",
          ].map((item) => (
            <label key={item} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{item}</span>
              <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500" />
            </label>
          ))}
        </div>
      </div>

      <Button variant="glow">
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
}