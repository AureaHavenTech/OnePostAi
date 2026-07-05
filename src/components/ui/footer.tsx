import React from "react";
import Link from "next/link";
import { Camera, ShieldCheck } from "lucide-react";
export function Footer() {
  return (
    <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="h-4 w-4 text-[#c9a96e]" />
            <span className="font-bold text-white tracking-tight">OnePost AI</span>
          </div>
          <div className="flex space-x-4 mt-2">
            <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="hover:text-[#c9a96e] transition-colors">Instagram</a>
            <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="hover:text-[#c9a96e] transition-colors">TikTok</a>
            <a href="https://facebook.com/funkycoldmedemaa" target="_blank" className="hover:text-[#c9a96e] transition-colors">Facebook</a>
            <a href="https://pinterest.com/funkycoldmedemaa" target="_blank" className="hover:text-[#c9a96e] transition-colors">Pinterest</a>
            <a href="https://snapchat.com/add/funkycoldmedemaa" target="_blank" className="hover:text-[#c9a96e] transition-colors">Snapchat</a>
          </div>
          <div className="text-[10px] mt-2 opacity-50">@funkycoldmedemaa</div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-6 md:mb-0">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        </div>
        <div className="text-center md:text-right">
          <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-400 text-xs mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
              Try <a href="https://axelai-eight.vercel.app" target="_blank" className="text-[#c9a96e] hover:text-[#d4b87a] font-bold">Axel AI</a> - The Axle That Drives Your Business
            </span>
            <span>·</span>
            <a href="https://aurahaven.shop" target="_blank" className="text-[#c9a96e] hover:text-[#d4b87a] font-bold">Shop Aura Haven</a>
          </div>
          <div className="opacity-40">&copy; {new Date().getFullYear()} OnePost AI. Part of the Aura Haven Tech family.</div>
        </div>
      </div>
    </footer>
  );
}