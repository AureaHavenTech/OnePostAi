"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/MediaUploader";
import { CampaignView } from "@/components/CampaignView";
import { ResultPreview } from "@/components/ResultPreview";
import { cn } from "@/lib/utils";
import {
  Sparkles, Wand2, Lightbulb, Loader2, Zap,
  TrendingUp, Check, Upload, Globe, Terminal,
  Store, Search, UserCircle, ShoppingCart,
  Film, Clock, Hash, Brain
} from "lucide-react";

type Mode = "upload" | "generate" | "ideas" | "shopify" | "research" | "avatar";

interface Step {
  label: string;
  status: "pending" | "running" | "done";
}

const platformsList = [
  { id: "tiktok", label: "TikTok", icon: "♬", color: "text-pink-400" },
  { id: "instagram", label: "Instagram Reels", icon: "📸", color: "text-orange-400" },
  { id: "facebook", label: "Facebook", icon: "👍", color: "text-blue-400" },
  { id: "youtube", label: "YouTube", icon: "▶", color: "text-red-400" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "text-blue-300" },
  { id: "snapchat", label: "Snapchat", icon: "👻", color: "text-yellow-400" },
];

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>(["tiktok", "instagram"]);
  const [showPicker, setShowPicker] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<any>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [shopProduct, setShopProduct] = useState({ name: "", niche: "", price: "" });
  const [avatarPhotos, setAvatarPhotos] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewType, setPreviewType] = useState<"shopify" | "post" | "ad" | "avatar">("post");

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const runSteps = (stepList: Step[], onDone: () => void) => {
    setSteps(stepList.map((s, i) => ({ ...s, status: i === 0 ? "running" as const : "pending" as const })));
    setIsWorking(true);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < stepList.length) {
        setSteps(prev => prev.map((s, j) => ({
          ...s,
          status: j === i ? "running" as const : j < i ? "done" as const : "pending" as const,
        })));
      } else {
        clearInterval(iv);
        setSteps(prev => prev.map(s => ({ ...s, status: "done" as const })));
        setIsWorking(false);
        onDone();
      }
    }, 1000);
  };

  const executeMission = () => {
    if (!command.trim()) return;
    setResult(null);
    setResearchData(null);
    setShowPicker(true);
    runSteps([
      { label: "Researching trending products & market data...", status: "pending" },
      { label: "Analyzing margins and competition levels...", status: "pending" },
      { label: "Generating SEO-optimized product pages...", status: "pending" },
      { label: "Creating AI avatar video content...", status: "pending" },
      { label: "Writing platform-specific viral captions...", status: "pending" },
      { label: "Publishing to selected social platforms...", status: "pending" },
    ], () => {
      setResult({
        success: true,
        summary: "Created 3 product pages + 6 social posts across " + platforms.length + " platforms",
        items: [
          "LED Light Therapy Mask — Shopify page created, posted to TikTok & IG",
          "Smart Hair Brush — Shopify page created, posted to TikTok & IG",
          "UV Sanitizing Wand — Shopify page created, posted to TikTok & IG",
        ],
      });
      setPreviewType("shopify");
      setPreviewData({ title: "LED Light Therapy Mask", price: "$89.00", desc: "Premium LED light therapy mask for radiant skin. 72% profit margin.", seo: { title: "Buy LED Light Therapy Mask Online", desc: "Shop the best LED light therapy mask." } });
      setShowPreview(true);
    });
  };

  const runResearch = () => {
    setResearchData(null);
    runSteps([
      { label: "Scanning trending products in " + (topic || "beauty tech") + "...", status: "pending" },
      { label: "Analyzing margins, competition, and viral potential...", status: "pending" },
      { label: "Ranking by profitability and demand...", status: "pending" },
    ], () => {
      setResearchData({
        niche: topic || "beauty tech",
        products: [
          { name: "LED Light Therapy Mask", price: "$89", margin: "72%", trend: "🔥 Viral", comp: "Medium" },
          { name: "Smart Hair Brush", price: "$129", margin: "65%", trend: "📈 Rising", comp: "Low" },
          { name: "UV Sanitizing Wand", price: "$39", margin: "80%", trend: "🔥 Viral", comp: "High" },
          { name: "Portable Facial Steamer", price: "$49", margin: "70%", trend: "📈 Rising", comp: "Medium" },
          { name: "Smart Makeup Mirror", price: "$159", margin: "60%", trend: "🔥 Viral", comp: "Low" },
          { name: "Ionic Hair Dryer Brush", price: "$79", margin: "68%", trend: "📈 Rising", comp: "Medium" },
          { name: "Microcurrent Device", price: "$199", margin: "75%", trend: "🔥 Viral", comp: "Low" },
          { name: "Smart Skincare Fridge", price: "$69", margin: "55%", trend: "📈 Rising", comp: "Low" },
          { name: "Lash Growth Serum Kit", price: "$44", margin: "82%", trend: "🔥 Viral", comp: "High" },
          { name: "Hair Steamer Cap", price: "$34", margin: "78%", trend: "📈 Rising", comp: "Medium" },
        ],
        topPick: "LED Light Therapy Mask — 72% margin, viral on TikTok, low shipping cost",
      });
    });
  };

  const runShopify = () => {
    runSteps([
      { label: "Researching product market & competitors...", status: "pending" },
      { label: "Writing SEO title & conversion description...", status: "pending" },
      { label: "Generating product images...", status: "pending" },
      { label: "Setting optimal price & margin...", status: "pending" },
      { label: "Creating Shopify product page...", status: "pending" },
    ], () => {
      setResult({
        type: "shopify",
        name: shopProduct.name,
        title: "Premium " + shopProduct.name + " — The Ultimate Solution",
        desc: "Experience the future of " + (shopProduct.niche || "beauty tech") + " with our premium product.\n\n✨ Features:\n• Premium quality materials\n• Easy to use\n• Long-lasting results\n• Satisfaction guaranteed\n\n🛒 Free shipping on all orders!",
        price: "$" + (shopProduct.price || "49.99"),
        seo: { title: "Buy " + shopProduct.name + " Online | Best " + (shopProduct.niche || "Beauty Tech") + " Products", desc: "Shop the best " + shopProduct.name + " for " + (shopProduct.niche || "beauty tech") + ". Premium quality, fast shipping." },
      });
      setPreviewType("shopify");
      setPreviewData({ title: "Premium " + shopProduct.name, price: "$" + (shopProduct.price || "49.99"), desc: "Experience the future of " + (shopProduct.niche || "beauty tech") + " with our premium product.", seo: { title: "Buy " + shopProduct.name, desc: "Shop the best " + shopProduct.name } });
      setShowPreview(true);
    });
  };

  const runAvatar = () => {
    if (avatarPhotos.length === 0) { runSteps([], () => {}); return; }
    runSteps([
      { label: "Analyzing your photos to build AI model...", status: "pending" },
      { label: "Training AI avatar on your facial features...", status: "pending" },
      { label: "Generating 3 UGC videos with your AI twin...", status: "pending" },
      { label: "Adding voiceover, captions & hashtags...", status: "pending" },
    ], () => {
      setResult({
        type: "avatar",
        summary: "AI avatar trained from " + avatarPhotos.length + " photos. 3 videos generated.",
        videos: [
          "Video 1: Product review — talking to camera (AI you) - 60s",
          "Video 2: Unboxing experience — hands + face - 45s",
          "Video 3: Testimonial style — direct address - 30s",
        ],
      });
      setPreviewType("avatar");
      setPreviewData({});
      setShowPreview(true);
    });
  };

  const handleGenerate = () => {
    if (mode === "research") { runResearch(); return; }
    if (mode === "shopify") { runShopify(); return; }
    if (mode === "avatar") { runAvatar(); return; }
    if (mode === "upload" && !selectedFile) return;
    setIsWorking(true);
    setTimeout(() => { setIsWorking(false); setShowCampaign(true); }, 2000);
  };

  if (showCampaign && selectedFile) {
    return <CampaignView fileName={selectedFile.name} onBack={() => { setShowCampaign(false); setSelectedFile(null); setContext(""); }} mode="upload" selectedPlatforms={platforms} />;
  }

  const modeBtns = [
    { id: "upload" as Mode, label: "Upload", icon: Upload },
    { id: "generate" as Mode, label: "AI Create", icon: Zap },
    { id: "ideas" as Mode, label: "Ideas", icon: Lightbulb },
    { id: "shopify" as Mode, label: "Shopify", icon: Store },
    { id: "research" as Mode, label: "Research", icon: Search },
    { id: "avatar" as Mode, label: "AI Avatar", icon: UserCircle },
  ];

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {modeBtns.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setResearchData(null); setSteps([]); }}
            className={cn("flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-center",
              mode === m.id ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10")}>
            <m.icon className="w-4 h-4" /><span className="text-[10px] font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mission Control */}
      <div className="glass-card p-4 border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2"><Terminal className="w-4 h-4 text-indigo-400" /><span className="text-sm font-medium text-zinc-300">What should I do for you today?</span></div>
        <div className="flex gap-2">
          <Input value={command} onChange={e => setCommand(e.target.value)}
            placeholder='e.g., "Find 10 viral beauty products for Shopify, create pages, and post to TikTok"'
            className="flex-1 bg-zinc-900/60 text-sm" />
          <Button variant="glow" size="sm" onClick={executeMission} disabled={!command.trim() || isWorking}>
            {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Go
          </Button>
        </div>
      </div>

      {/* Platform picker */}
      {showPicker && (
        <div className="glass-card p-4 border-purple-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-zinc-300 mb-2">Which platforms?</p>
          <div className="flex flex-wrap gap-2">
            {platformsList.map(p => (
              <button key={p.id} onClick={() => togglePlatform(p.id)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all",
                  platforms.includes(p.id) ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-zinc-900/40 border-white/5 text-zinc-500")}>
                <span className={p.color}>{p.icon}</span>{p.label}
                {platforms.includes(p.id) && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Execution steps */}
      {steps.length > 0 && (
        <div className="glass-card p-4 border-green-500/20 animate-in fade-in">
          <p className="text-xs font-medium text-green-400 mb-3">⚡ Agent Execution Log</p>
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className={cn("flex items-center gap-2 text-xs p-1.5 rounded",
                s.status === "running" ? "bg-indigo-500/10 text-indigo-300" : s.status === "done" ? "text-zinc-500" : "text-zinc-700")}>
                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                  s.status === "done" ? "bg-green-500/20" : s.status === "running" ? "bg-indigo-500/20" : "bg-zinc-800")}>
                  {s.status === "done" ? <Check className="w-2.5 h-2.5 text-green-400" /> :
                   s.status === "running" ? <Loader2 className="w-2.5 h-2.5 text-indigo-400 animate-spin" /> :
                   <div className="w-1 h-1 rounded-full bg-zinc-600" />}
                </div>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card p-5 border-green-500/30 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-green-400" /></div>
            <div><p className="font-semibold text-green-300 text-sm">Mission Complete</p><p className="text-xs text-zinc-500">{result.summary}</p></div>
          </div>
          {result.type === "shopify" && (
            <div className="space-y-2 mt-3">
              <div className="rounded-lg bg-zinc-900/60 p-3 border border-white/5">
                <p className="font-medium text-zinc-200">{result.title}</p>
                <p className="text-xs text-green-400 mt-1">{result.price}</p>
                <p className="text-xs text-zinc-400 mt-2 whitespace-pre-line">{result.desc}</p>
                <div className="mt-2 p-2 rounded bg-zinc-800/50"><p className="text-[10px] text-zinc-500">SEO: {result.seo.title}</p></div>
              </div>
              <Button variant="glow" size="sm" className="text-xs">📋 Push to Shopify</Button>
            </div>
          )}
          {result.type === "avatar" && (
            <div className="space-y-2 mt-3">
              {result.videos.map((v: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><UserCircle className="w-4 h-4 text-purple-400" /></div>
                  <p className="text-xs text-zinc-300">{v}</p>
                </div>
              ))}
              <Button variant="glow" size="sm" className="text-xs">📤 Post All to {platforms.length} Platforms</Button>
            </div>
          )}
          {!result.type && (
            <div className="space-y-2 mt-3">
              {result.items?.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-white/5 text-xs text-zinc-300">
                  <Check className="w-3 h-3 text-green-400 shrink-0" />{item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Research results */}
      {researchData && (
        <div className="glass-card p-5 border-blue-500/20 animate-in fade-in">
          <p className="text-sm font-medium text-blue-400 mb-1">📊 Top Products in {researchData.niche}</p>
          <p className="text-xs text-green-400 mb-3">🏆 Best pick: {researchData.topPick}</p>
          <div className="space-y-1.5">
            {researchData.products.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-medium">{i + 1}</span>
                  <span className="text-zinc-200">{p.name}</span>
                </div>
                <div className="flex gap-2 text-zinc-500">
                  <span>{p.price}</span><span className="text-green-400">{p.margin}</span><span>{p.trend}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="glow" size="sm" className="text-xs">📋 Create Shopify Pages</Button>
            <Button variant="outline" size="sm" className="text-xs">📊 Export CSV</Button>
          </div>
        </div>
      )}

      {/* Content area */}
      {!isWorking && !result && !researchData && !showPicker && (
        <div className="space-y-5">
          {mode === "upload" && (
            <><div><label className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-1"><Upload className="w-4 h-4 text-indigo-400" />Drop video/image — AI auto-edits</label><MediaUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} onClear={() => setSelectedFile(null)} /></div>
            <Textarea placeholder="What's this about? (affiliate link, brand name, style)" value={context} onChange={e => setContext(e.target.value)} className="min-h-[70px]" /></>
          )}
          {mode === "generate" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-purple-400" /></div><div><p className="font-medium text-sm text-zinc-200">AI Generate Content</p><p className="text-xs text-zinc-500">Brand URL or topic → pro video & captions</p></div></div>
              <Input placeholder="Brand / product URL or name" value={brandUrl} onChange={e => setBrandUrl(e.target.value)} />
              <Textarea placeholder="Describe the content you want..." value={topic} onChange={e => setTopic(e.target.value)} className="min-h-[70px]" />
            </div>
          )}
          {mode === "ideas" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Lightbulb className="w-5 h-5 text-amber-400" /></div><div><p className="font-medium text-sm text-zinc-200">Content Ideas</p><p className="text-xs text-zinc-500">Your niche → 10 viral-ready ideas</p></div></div>
              <Input placeholder="e.g., sleep products, tech reviews, mom blogger" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          )}
          {mode === "shopify" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><Store className="w-5 h-5 text-green-400" /></div><div><p className="font-medium text-sm text-zinc-200">Shopify Product Page Creator</p><p className="text-xs text-zinc-500">Complete product page with SEO & images</p></div></div>
              <Input placeholder="Product name (e.g., LED Face Mask)" value={shopProduct.name} onChange={e => setShopProduct({ ...shopProduct, name: e.target.value })} />
              <Input placeholder="Niche (e.g., Beauty Tech)" value={shopProduct.niche} onChange={e => setShopProduct({ ...shopProduct, niche: e.target.value })} />
              <Input placeholder="Target price (e.g., 89.99)" value={shopProduct.price} onChange={e => setShopProduct({ ...shopProduct, price: e.target.value })} />
            </div>
          )}
          {mode === "research" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Search className="w-5 h-5 text-blue-400" /></div><div><p className="font-medium text-sm text-zinc-200">Market Research</p><p className="text-xs text-zinc-500">Find trending products with highest margins</p></div></div>
              <Input placeholder="Niche (e.g., beauty tech, pet tech, home tech)" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          )}
          {mode === "avatar" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><UserCircle className="w-5 h-5 text-purple-400" /></div><div><p className="font-medium text-sm text-zinc-200">AI Avatar Content</p><p className="text-xs text-zinc-500">Upload photos of yourself — AI creates videos with your likeness</p></div></div>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/30 transition-all" onClick={() => document.getElementById("avatar-input")?.click()}>
                <input id="avatar-input" type="file" multiple accept="image/*" className="hidden" onChange={e => { if (e.target.files) setAvatarPhotos(Array.from(e.target.files)); }} />
                <UserCircle className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400">{avatarPhotos.length > 0 ? avatarPhotos.length + " photos uploaded" : "Upload 3-5 photos of yourself"}</p>
                <p className="text-xs text-zinc-600 mt-1">AI builds your digital twin for UGC videos</p>
              </div>
              {avatarPhotos.length > 0 && (
                <Textarea placeholder="What do you want your AI twin to say? (e.g., Mellow Sleep mattress review)" value={context} onChange={e => setContext(e.target.value)} className="min-h-[60px]" />
              )}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Button variant="glow" size="lg" className="text-base px-10" disabled={isWorking || (mode === "upload" && !selectedFile) || (mode === "avatar" && avatarPhotos.length === 0)} onClick={handleGenerate}>
              {isWorking ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Working...</> : <><Sparkles className="w-5 h-5 mr-2" />✨ Generate</>}
            </Button>
          </div>
        </div>
      )}

      {/* Visual Result Preview */}
      {showPreview && (
        <ResultPreview
          type={previewType}
          data={previewData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
