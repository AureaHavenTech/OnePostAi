"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ExternalLink, Upload, User } from "lucide-react";

export default function AboutPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] dark:bg-[#141416] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-8"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>

        <div className="bg-white dark:bg-[#1c1c1e] border border-[#e0d5d8] dark:border-[#3d3537] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 sm:p-12 text-center">
            {/* Profile photo with upload */}
            <div className="relative w-28 h-28 mx-auto mb-6 group">
              <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#d44a6a] to-[#eab308] flex items-center justify-center overflow-hidden shadow-lg shadow-[#d44a6a]/20 ${photo ? '' : ''}`}>
                {photo ? (
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#d44a6a] text-white flex items-center justify-center shadow-md hover:bg-[#c23a5a] transition-all opacity-90 hover:opacity-100"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#1c1c1e] dark:text-[#f5f0f1]">
              Hi, I'm the creator behind OnePost AI
            </h1>

            <div className="mt-6 max-w-xl mx-auto text-left space-y-4 text-[#6b5a5e] dark:text-[#c4b5b8] text-sm leading-relaxed">
              <p>
                I built this app because I <em>am</em> the target customer. A creator trying to break 
                into tech UGC content — but overwhelmed by editing apps, camera anxiety, and the 
                time sink of multi-platform posting.
              </p>
              
              <p>
                I have affiliate links that should be earning commission. I have products to promote. 
                But I wasn't posting because editing videos, writing captions, finding hashtags, 
                scheduling — it was too much.
              </p>

              <div className="border-l-4 border-[#d44a6a] pl-4 py-2 my-4 bg-[#d44a6a]/5 rounded-r-lg">
                <p className="italic text-[#1c1c1e] dark:text-[#f5f0f1] text-sm">
                  "I don't want to be on camera all day. I don't want to spend hours editing. 
                  I want my content out there, working for me, while I focus on growing my business."
                </p>
              </div>

              <p>
                So I created OnePost AI — an app that does all the grunt work. Upload raw video, 
                paste a product URL, or just type what you want. It researches trending products, 
                creates Shopify pages, generates AI avatar videos, writes viral captions, and 
                posts to every platform. No editing, no filming, no stress.
              </p>

              <p>
                My goal is to help creators like me get professional content out there and start 
                earning the retainers we deserve. $3k, $10k, $30k a month. It's possible when you 
                have a system that does the work for you.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e0d5d8] dark:border-[#3d3537]">
              <p className="text-sm text-[#8a797d]">
                Built with <Heart className="w-3.5 h-3.5 inline text-[#d44a6a]" /> for creators who want to eat too.
              </p>
              <p className="text-xs text-[#8a797d] mt-2">@funkycoldmedemaa — TikTok, Instagram, Facebook, Pinterest, Snapchat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}