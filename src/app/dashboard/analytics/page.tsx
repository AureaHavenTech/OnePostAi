"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Eye, Heart, Share2 } from "lucide-react";

interface AnalyticsData {
  overview?: { totalPosts: number; totalViews: number; totalEngagement: number; followerGrowth: number };
  revenue?: { total: number; subscriptions: number; affiliates: number; credits: number };
  performance?: { byPlatform: Record<string, { posts: number; views: number; engagement: number }> };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        fetch("/api/analytics/overview").then(r => r.ok ? r.json() : null),
        fetch("/api/analytics/revenue?days=30").then(r => r.ok ? r.json() : null),
      ]);
      setData({
        overview: overviewRes,
        revenue: revenueRes,
      });
    } catch (e) {
      setError("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/20 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-white/20 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <BarChart3 className="w-12 h-12 text-gold/30 mx-auto mb-3" />
        <p className="text-charcoal/50 text-sm">{error}</p>
        <p className="text-charcoal/30 text-xs mt-1">Analytics will appear once you start posting.</p>
      </div>
    );
  }

  const overview = data?.overview;
  const revenue = data?.revenue;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-dark font-[family-name:var(--font-heading)]">Analytics</h1>
        <p className="text-xs text-charcoal/50 mt-1">Track your content performance and revenue.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: overview?.totalPosts ?? 0, icon: BarChart3, color: "text-blue-500" },
          { label: "Total Views", value: overview?.totalViews ?? 0, icon: Eye, color: "text-green-500", format: true },
          { label: "Engagement", value: overview?.totalEngagement ?? 0, icon: Heart, color: "text-pink-500", format: true },
          { label: "New Followers", value: overview?.followerGrowth ?? 0, icon: Users, color: "text-gold", format: true },
        ].map((card) => (
          <div key={card.label} className="bg-white/80 border border-gold/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-charcoal/50">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-dark">
              {card.format ? (card.value as number).toLocaleString() : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-white/80 border border-gold/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-dark mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gold" />
          Revenue (30 days)
        </h2>
        {revenue ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-charcoal/50">Total</p>
              <p className="text-lg font-bold text-dark">${(revenue.total ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50">Subscriptions</p>
              <p className="text-lg font-bold text-dark">${(revenue.subscriptions ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50">Affiliates</p>
              <p className="text-lg font-bold text-dark">${(revenue.affiliates ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50">Credits</p>
              <p className="text-lg font-bold text-dark">${(revenue.credits ?? 0).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-charcoal/40">No revenue data yet.</p>
        )}
      </div>

      {/* Performance by Platform */}
      {overview && (
        <div className="bg-white/80 border border-gold/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-dark mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            Performance Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-cream/50 rounded-lg">
              <span className="text-xs text-charcoal/70">Avg. Engagement Rate</span>
              <span className="text-sm font-semibold text-dark">
                {overview.totalPosts > 0
                  ? ((overview.totalEngagement / overview.totalPosts) * 100).toFixed(1)
                  : "0.0"}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream/50 rounded-lg">
              <span className="text-xs text-charcoal/70">Views per Post</span>
              <span className="text-sm font-semibold text-dark">
                {overview.totalPosts > 0
                  ? Math.round(overview.totalViews / overview.totalPosts).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
