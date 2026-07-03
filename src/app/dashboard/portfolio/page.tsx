"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, ExternalLink, Star, TrendingUp, Plus, Film, Download } from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const portfolioItems: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Portfolio</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Auto-built portfolio of your best AI-generated content to land top-tier clients.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="glow" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Content
          </Button>
        </Link>
      </div>

      {portfolioItems.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Your portfolio is empty</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            As you create content with OnePost AI, your best work automatically builds into a 
            professional portfolio you can send to brands for retainer deals. 
            <strong className="text-zinc-400"> Post 5 high-quality reviews to unlock the portfolio builder.</strong>
          </p>

          <div className="max-w-sm mx-auto space-y-3 text-left mb-8">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">How to get top-tier retainers:</h4>
            {[
              "Create 5 product review videos using AI Generate",
              "Let OnePost auto-edit and polish each one",
              "Portfolio auto-builds with your best content",
              "Share portfolio link with brands for $3k–$30k/month retainers",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center font-medium shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="glow" size="lg">
                <Film className="w-4 h-4 mr-2" />
                Create Your First Review
              </Button>
            </Link>
          </div>

          {/* Target earnings showcase */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-green-400">$3k</p>
              <p className="text-xs text-zinc-500 mt-1">Entry retainer</p>
            </div>
            <div className="glass-card p-4 text-center border-indigo-500/20">
              <p className="text-2xl font-bold text-indigo-400">$10k</p>
              <p className="text-xs text-zinc-500 mt-1">Monthly retainer</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">$30k</p>
              <p className="text-xs text-zinc-500 mt-1">Top-tier retainer</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <div key={item.id} className="glass-card p-4">
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}