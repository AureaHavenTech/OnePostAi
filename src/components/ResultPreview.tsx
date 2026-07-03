"use client";

import React from "react";
import { X, ExternalLink, Smartphone, Monitor, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultPreviewProps {
  type: "shopify" | "post" | "ad" | "avatar";
  data: any;
  onClose: () => void;
}

export function ResultPreview({ type, data, onClose }: ResultPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400">Complete</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Shopify Product Page Preview */}
          {type === "shopify" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <ShoppingCart className="w-4 h-4 text-green-400" />
                <span>Shopify Product Page — Created</span>
              </div>

              {/* Product mockup */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white">
                {/* Shopify-style header */}
                <div className="bg-[#f6f6f8] p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#5e8e3e]" />
                    <span className="text-sm font-bold text-gray-800">My Store</span>
                  </div>
                </div>
                {/* Product */}
                <div className="p-6">
                  <div className="flex gap-6">
                    <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-gray-200">
                      <div className="text-4xl">📦</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-gray-900">{data?.title || "Premium Product"}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{data?.price || "$49.99"}</p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-4">{data?.desc || "Premium quality product. Fast shipping. Satisfaction guaranteed."}</p>
                      <div className="mt-4 flex gap-2">
                        <div className="px-4 py-2 rounded bg-[#5e8e3e] text-white text-sm font-medium cursor-default">Add to Cart</div>
                        <div className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium cursor-default">Buy Now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO data */}
              <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-zinc-400">SEO Title: {data?.seo?.title || "Buy Premium Product Online"}</p>
                <p className="text-xs text-zinc-400">SEO Desc: {data?.seo?.desc || "Shop the best products online."}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="glow" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View on Shopify</Button>
                <Button variant="outline" size="sm">✏️ Edit</Button>
              </div>
            </div>
          )}

          {/* Post Preview */}
          {type === "post" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>TikTok / Reels Post — Preview</span>
              </div>

              {/* Phone mockup */}
              <div className="max-w-[320px] mx-auto bg-white rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-xl">
                {/* Top bar */}
                <div className="bg-zinc-900 p-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
                  <span className="text-xs font-medium text-white">@creator</span>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                </div>
                {/* Video area */}
                <div className="aspect-9-16 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-10 h-10 mx-auto text-purple-400" />
                    <p className="text-xs text-gray-500 mt-2">Video Preview</p>
                  </div>
                </div>
                {/* Caption */}
                <div className="p-3 bg-white">
                  <p className="text-xs text-gray-800 font-medium">{data?.title || "Amazing find! 🔥"}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{data?.desc || "#viral #trending"}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="glow" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View on TikTok</Button>
              </div>
            </div>
          )}

          {/* Ad Preview */}
          {type === "ad" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Monitor className="w-4 h-4 text-orange-400" />
                <span>Meta Ad — Preview</span>
              </div>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white max-w-sm mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <p className="text-xs opacity-80">Sponsored · Instagram</p>
                  <p className="text-sm font-bold mt-1">{data?.headline || "Don't Miss Out!"}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">{data?.description || "Premium quality you'll love. Limited time offer."}</p>
                  <div className="mt-2 px-3 py-1.5 rounded bg-blue-500 text-white text-xs font-medium inline-block cursor-default">Shop Now</div>
                </div>
              </div>
            </div>
          )}

          {/* Avatar Video Preview */}
          {type === "avatar" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>AI Avatar Video — Generated</span>
              </div>
              <div className="max-w-[280px] mx-auto bg-zinc-800 rounded-2xl overflow-hidden border border-white/10">
                <div className="aspect-9-16 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                      🤖
                    </div>
                    <p className="text-xs text-purple-300 mt-2">AI Avatar Speaking</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-zinc-400">AI-generated UGC video with your likeness</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}