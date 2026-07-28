"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Upload, Camera, Copy, Check, Share2,
  TrendingUp, Users, DollarSign, BarChart3,
  Gift, Link as LinkIcon, ExternalLink, Crown,
  Sparkles, Heart, Settings, LogOut, Coins, Clock
} from "lucide-react";
import Link from "next/link";

export default function OwnerDashboard() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const referralLink = "https://onepostai.com?ref=founder";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-dark">Founder Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">OnePost AI — Owner Access</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
            </Link>
            <Button variant="ghost" size="sm"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL — Profile */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="card-luxury p-6 text-center">
              {/* Photo upload */}
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className={`w-full h-full rounded-full bg-gradient-to-br from-gold to-rose flex items-center justify-center overflow-hidden shadow-xl shadow-gold/20 ${photo ? '' : ''}`}>
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-cream" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-dark text-cream flex items-center justify-center shadow-lg hover:bg-charcoal transition-all border-2 border-cream"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <p className="text-sm font-semibold text-dark">@funkycoldmedemaa</p>
              <p className="text-[10px] text-gray-400">Founder & Creator</p>

              <div className="mt-4 pt-4 border-t border-gold/10">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Your Referral Link</p>
                <div className="flex items-center gap-1 bg-warm-white rounded-lg p-1.5">
                  <div className="flex-1 truncate text-[10px] text-gray-500 px-1">{referralLink}</div>
                  <button onClick={copyLink} className="p-1.5 rounded-md hover:bg-gold/10 text-gold">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card-luxury p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Quick Stats</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Affiliates</span>
                <span className="text-sm font-semibold text-dark">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Commission Earned</span>
                <span className="text-sm font-semibold text-gold">$0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Content Published</span>
                <span className="text-sm font-semibold text-dark">0</span>
              </div>
            </div>

            {/* Credit Stats */}
            <div className="card-luxury p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-gold" /> Credits
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Available</span>
                <span className="text-sm font-semibold text-gold">50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Used This Month</span>
                <span className="text-sm font-semibold text-dark">12</span>
              </div>
              <div className="w-full bg-gold/10 rounded-full h-1.5">
                <div className="bg-gold h-1.5 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            {/* Credit History */}
            <div className="card-luxury p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gold" /> Credit History
              </p>
              <div className="space-y-2">
                {[
                  { action: "Content Generation", credits: "-1", time: "2 hours ago", type: "debit" },
                  { action: "Video Export", credits: "-2", time: "5 hours ago", type: "debit" },
                  { action: "Credits Purchased (Starter Pack)", credits: "+10", time: "1 day ago", type: "credit" },
                  { action: "AI Avatar Generation", credits: "-3", time: "2 days ago", type: "debit" },
                  { action: "Trial Credits", credits: "+5", time: "7 days ago", type: "credit" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-warm-white">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-dark truncate">{item.action}</p>
                      <p className="text-[9px] text-gray-400">{item.time}</p>
                    </div>
                    <span className={`text-xs font-semibold ${item.type === 'credit' ? 'text-green-500' : 'text-red-400'}`}>
                      {item.credits}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: TrendingUp, label: "Posts Created", value: "0", color: "text-gold" },
                { icon: Users, label: "Active Users", value: "0", color: "text-gold" },
                { icon: DollarSign, label: "Revenue", value: "$0", color: "text-gold" },
                { icon: BarChart3, label: "Conversion", value: "0%", color: "text-gold" },
              ].map((s) => (
                <div key={s.label} className="card-luxury p-4 text-center">
                  <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-dark">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Affiliate Program */}
            <div className="card-luxury p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-dark">Ambassador Program</h3>
                  <p className="text-[10px] text-gray-400">10% lifetime commission</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Give your referral link to creators. When they sign up for OnePost AI, 
                you earn 10% of their subscription — every month, for life. 
                Promote both OnePost AI and Axel AI to double your earnings.
              </p>
              <div className="flex gap-2">
                <Button variant="glow" size="sm" onClick={copyLink}>
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied!" : "Copy Referral Link"}
                </Button>
                <Link href="/dashboard/affiliates">
                  <Button variant="outline" size="sm">
                    View Affiliates
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-luxury p-6">
              <h3 className="text-sm font-semibold text-dark mb-3">Founder Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Create Campaign", icon: Sparkles },
                  { label: "AI Avatar Studio", icon: Camera },
                  { label: "Trend Research", icon: TrendingUp },
                  { label: "Affiliate Settings", icon: Users },
                ].map((a) => (
                  <Link key={a.label} href="/dashboard">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-warm-white transition-colors border border-transparent hover:border-gold/10">
                      <a.icon className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs text-gray-500">{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}