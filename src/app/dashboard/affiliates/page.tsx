"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Gift, Users, DollarSign, Link as LinkIcon, ArrowRight, ExternalLink, Star } from "lucide-react";
import Link from "next/link";

export default function AffiliatesPage() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const referralLink = "https://onepostai.com?ref=founder";
  const copyMain = () => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleJoin = () => {
    if (!email.trim()) return;
    setJoined(true);
  };

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-dark">Ambassador Program</h1>
            <p className="text-xs text-gray-400 mt-0.5">10% lifetime commission on every referral</p>
          </div>
          <Link href="/dashboard/owner">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="card-luxury p-8 text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-rose flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gold/20">
            <Gift className="w-6 h-6 text-dark" />
          </div>
          <h2 className="text-lg font-bold text-dark mb-2">Turn Followers Into Income</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Give creators your referral link. When they sign up for OnePost AI, 
            you earn <strong className="text-gold">10% of their $29/month subscription</strong> — 
            every month, for the lifetime of their account.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold" />10% Lifetime Commission</div>
            <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold" />No Cap on Earnings</div>
            <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold" />Promote Both Apps</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Your Link */}
          <div className="card-luxury p-5">
            <h3 className="text-sm font-semibold text-dark mb-3">Your Referral Link</h3>
            <div className="flex items-center gap-1.5 bg-warm-white rounded-lg p-1.5 mb-3">
              <div className="flex-1 truncate text-[11px] text-gray-500 px-2">{referralLink}</div>
              <button onClick={copyMain} className="p-2 rounded-md hover:bg-gold/10 text-gold transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Share this link in your bio, stories, or content. When someone signs up, 
              you earn 10% — forever.
            </p>
          </div>

          {/* How it Works */}
          <div className="card-luxury p-5">
            <h3 className="text-sm font-semibold text-dark mb-3">How It Works</h3>
            <div className="space-y-2.5">
              {[
                "Share your link with your audience",
                "They sign up for the 3-day free trial",
                "When they subscribe, you get 10%",
                "You earn every month they stay subscribed",
                "No limits — promote both OnePost AI & Axel AI",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[8px] text-gold font-bold">{i + 1}</span>
                  </div>
                  <span className="text-xs text-gray-500">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Form */}
        {!joined ? (
          <div className="card-luxury p-6 text-center">
            <h3 className="text-sm font-semibold text-dark mb-2">Become an Ambassador</h3>
            <p className="text-xs text-gray-400 mb-4">Enter your email and we'll set up your ambassador dashboard</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-warm-white border-gray-200"
              />
              <Button variant="glow" size="sm" onClick={handleJoin}>
                Join Free
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="card-luxury p-6 text-center border-gold/30">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-dark mb-1">You're In! 🎉</h3>
            <p className="text-xs text-gray-400">Check your email for ambassador dashboard access and your custom referral link.</p>
          </div>
        )}

        {/* Earnings Potential */}
        <div className="mt-6 card-luxury p-6">
          <h3 className="text-sm font-semibold text-dark mb-4">Earnings Potential</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left py-2 text-gray-400 font-medium">Referrals</th>
                  <th className="text-left py-2 text-gray-400 font-medium">Monthly</th>
                  <th className="text-left py-2 text-gray-400 font-medium">Yearly</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { refs: "10", monthly: "$29", yearly: "$348" },
                  { refs: "50", monthly: "$145", yearly: "$1,740" },
                  { refs: "100", monthly: "$290", yearly: "$3,480" },
                  { refs: "500", monthly: "$1,450", yearly: "$17,400" },
                  { refs: "1,000", monthly: "$2,900", yearly: "$34,800" },
                ].map((r) => (
                  <tr key={r.refs} className="border-b border-gold/5 hover:bg-warm-white/50">
                    <td className="py-2.5 text-dark font-medium">{r.refs}</td>
                    <td className="py-2.5 text-gold font-semibold">{r.monthly}</td>
                    <td className="py-2.5 text-gold font-semibold">{r.yearly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Based on $29/month subscription × 10% commission. No cap on referrals.</p>
        </div>
      </div>
    </div>
  );
}