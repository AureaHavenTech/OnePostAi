"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { History, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  // In production, fetch campaigns from the database
  const campaigns: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Campaigns</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            View and manage your cross-platform campaigns.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="glow" size="sm">
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No campaigns yet</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
            Create your first campaign by uploading media and generating AI-powered content for all platforms.
          </p>
          <Link href="/dashboard">
            <Button variant="glow">
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-zinc-200">{campaign.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {campaign.date}
                    </span>
                    <span className="text-green-400">● Published</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}