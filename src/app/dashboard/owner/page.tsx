"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Upload, Save, Settings, CreditCard, Bell, Link2, DollarSign, Users, TrendingUp, ShoppingCart, Star } from "lucide-react";

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: Users },
    { id: "affiliates", label: "Affiliates", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2d2a24] dark:text-[#f5f0e8]">Owner Dashboard</h1>
          <p className="text-sm text-[#8a7f72] mt-1">Welcome back, Aurea. Your business is running.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#eab308]/10 border border-[#eab308]/20 text-[#eab308] text-xs font-medium">
          CEO / Founder
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: "$0.00", icon: DollarSign, color: "text-green-500" },
          { label: "Active Users", value: "0", icon: Users, color: "text-blue-500" },
          { label: "Affiliates", value: "0", icon: Star, color: "text-purple-500" },
          { label: "Orders", value: "0", icon: ShoppingCart, color: "text-orange-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#8a7f72]">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#2d2a24] dark:text-[#f5f0e8] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-[#e8dfd2] dark:border-[#3d3832] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.id
                ? "bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20"
                : "text-[#8a7f72] hover:text-[#2d2a24]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Upload */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8]">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#eab308]/20 flex items-center justify-center text-2xl font-bold text-[#eab308]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Photo
            </Button>
            <p className="text-xs text-[#8a7f72] mt-1">JPG or PNG, max 2MB</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#8a7f72]">Display Name</label>
            <Input value="Aurea Haven" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-[#8a7f72]">Email</label>
            <Input value="aurea@onepost.ai" className="mt-1" />
          </div>
        </div>
      </div>

      {/* Affiliate Program */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8]">Affiliate Program</h3>
        <p className="text-sm text-[#8a7f72]">Content creators earn 10% lifetime commission on every referral.</p>
        <div className="p-4 rounded-lg bg-[#eab308]/5 border border-[#eab308]/20">
          <p className="text-sm font-medium text-[#2d2a24] dark:text-[#f5f0e8]">Your Referral Link</p>
          <div className="flex gap-2 mt-2">
            <Input value="https://onepost.ai/ref/AUREA10" readOnly className="text-xs" />
            <Button variant="outline" size="sm">Copy</Button>
          </div>
        </div>
        <div className="text-xs text-[#8a7f72] space-y-1">
          <p>🔗 Share this link with family, friends, and followers</p>
          <p>💰 You earn 10% of every subscription they buy</p>
          <p>🏆 Top affiliates get featured on our homepage</p>
        </div>
      </div>

      {/* Discount Codes */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8]">Discount Codes</h3>
        <div className="flex gap-2">
          <Input placeholder="Create a discount code..." />
          <Button variant="glow" size="sm">Generate</Button>
        </div>
        <div className="text-xs text-[#8a7f72]">
          <p>Family & friends codes: 100% off, unlimited use</p>
          <p>Promo codes: 20-50% off, limited time</p>
        </div>
      </div>

      {/* Invoices */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8]">Invoices & Tax Organization</h3>
        <div className="space-y-2 text-sm text-[#8a7f72]">
          <p>📄 All invoices auto-stored for tax season</p>
          <p>📊 Monthly earnings reports</p>
          <p>💳 Stripe payouts: linked to Auto Exec</p>
          <p>📈 Revenue analytics coming soon</p>
        </div>
        <Button variant="outline" size="sm">View Invoice History</Button>
      </div>
    </div>
  );
}