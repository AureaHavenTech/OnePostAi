"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Heart, Quote } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#1a1815] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-8"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>

        {/* Hero section with photo */}
        <div className="glass-card overflow-hidden">
          <div className="p-8 sm:p-12 text-center">
            {/* Profile photo — replace the placeholder with actual image */}
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#eab308] to-[#f472b6] flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-lg shadow-[#eab308]/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#2d2a24] dark:text-[#f5f0e8]">
              Hi, I'm the creator behind OnePost AI
            </h1>

            <div className="mt-6 max-w-xl mx-auto text-left space-y-4 text-[#6b6358] dark:text-[#c4b5a0]">
              <p className="leading-relaxed">
                I built this app because I <em>am</em> the target customer. I'm a 39-year-old creator 
                trying to break into tech UGC content. And honestly? It's been overwhelming as hell.
              </p>
              
              <p className="leading-relaxed">
                I'm a brand ambassador for Mellow Sleep. I have products I'm supposed to be promoting. 
                I have affiliate links that should be earning me commission. But I wasn't posting because 
                the thought of editing videos, figuring out CapCut, saving in the right format, writing 
                captions, finding hashtags, scheduling — it was <strong className="text-[#2d2a24] dark:text-[#f5f0e8]">too much</strong>.
              </p>

              <div className="border-l-4 border-[#eab308] pl-4 py-2 my-6 bg-[#eab308]/5 rounded-r-lg">
                <p className="italic text-[#2d2a24] dark:text-[#f5f0e8] text-sm">
                  "I don't want to be on camera all day. I don't want to spend hours editing. 
                  I want my content out there, working for me, while I focus on growing my business."
                </p>
              </div>

              <p className="leading-relaxed">
                So I created OnePost AI — an app that does all the grunt work. Upload a raw video, 
                paste a product URL, or just type what you want. It researches trending products, 
                creates Shopify pages, generates AI avatar videos, writes viral captions, and 
                posts to every platform. No editing, no filming, no stress.
              </p>

              <p className="leading-relaxed">
                My goal is to help creators like me — the ones with full lives who don't have time 
                to learn 10 different apps — get professional content out there and start earning 
                the retainers we deserve. $3k, $10k, $30k a month. It's possible when you have 
                a system that does the work for you.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e8dfd2] dark:border-[#3d3832]">
              <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72]">
                Built with <Heart className="w-3.5 h-3.5 inline text-[#f472b6]" /> for creators who want to eat too.
              </p>
              <a href="https://autoexec.app" target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Also check out Auto Exec — my dropshipping automation app
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}