"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
        <EmptyState
          variant="large"
          icon="/icon-storytelling.svg"
          title="Your portfolio is empty"
          description="As you create content with OnePost AI, your best work automatically builds into a professional portfolio you can send to brands for retainer deals. Post 5 high-quality reviews to unlock the portfolio builder."
          actionLabel="Create Your First Review"
          actionHref="/dashboard"
        >
          <div className="max-w-sm mx-auto space-y-3 text-left mt-2">
            <h4 className="text-sm font-medium text-cream/70 mb-2">How to get top-tier retainers:</h4>
            {[
              "Create 5 product review videos using AI Generate",
              "Let OnePost auto-edit and polish each one",
              "Portfolio auto-builds with your best content",
              "Share portfolio link with brands for $3k–$30k/month retainers",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-cream/50">
                <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-medium shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {[
              { value: "$3k", label: "Entry retainer", color: "text-gold-light" },
              { value: "$10k", label: "Monthly", color: "text-gold" },
              { value: "$30k", label: "Top-tier", color: "text-gold" },
            ].map((item, i) => (
              <div key={i} className="bg-dark border border-gold/10 rounded-xl p-3 text-center">
                <p className={`text-lg font-heading font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-cream/40 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </EmptyState>
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