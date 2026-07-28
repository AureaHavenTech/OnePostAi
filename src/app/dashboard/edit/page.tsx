"use client";

import React, { useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Image, Type, Film, Palette, Sun, Contrast, Send, Loader2, CheckCheck, Hash, X, Eye, Bold, Italic } from "lucide-react";
import Link from "next/link";

type EffectType = "none" | "vintage" | "bw" | "warm" | "cool" | "dramatic" | "soft";
const effectLabels: Record<EffectType, string> = { none:"Original", vintage:"Vintage", bw:"B&W", warm:"Warm", cool:"Cool", dramatic:"Dramatic", soft:"Soft" };
const effectStyles: Record<string, string> = { none:"none", vintage:"sepia(0.6) contrast(1.1)", bw:"grayscale(1) contrast(1.2)", warm:"sepia(0.3) saturate(1.3) hue-rotate(-10deg)", cool:"saturate(1.2) hue-rotate(20deg)", dramatic:"contrast(1.4) brightness(0.8)", soft:"brightness(1.1) contrast(0.9)" };

export default function EditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12121a] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-[#c9a96e] border-t-transparent animate-spin" /></div>}>
      <EditPageContent />
    </Suspense>
  );
}

function EditPageContent() {
  useSearchParams();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [effect, setEffect] = useState<EffectType>("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const isVideo = mediaFile?.type.startsWith("video/");
  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 1000); };

  return (
    <div className="min-h-screen bg-[#12121a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] flex items-center justify-center">
            <span className="text-sm font-black text-[#12121a]">OP</span>
          </div>
          <span className="font-bold text-white text-sm">Edit Media</span>
        </Link>
        <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving</> : saved ? <><CheckCheck className="h-4 w-4 text-emerald-400 mr-1" /> Saved</> : "Save Draft"}
        </Button>
      </header>
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Film className="h-4 w-4 text-[#c9a96e]" /> Media</h2>
              {!mediaFile ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#1e1e2a] rounded-xl p-8 text-center cursor-pointer hover:border-[#c9a96e]/30 transition-all">
                  <Image className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Click to upload</p>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-[#12121a]">
                  {isVideo ? (
                    <video src={mediaPreview!} className="w-full h-48 object-cover" style={{ filter: effectStyles[effect], opacity: brightness / 100 }} />
                  ) : (
                    <img src={mediaPreview!} alt="Upload" className="w-full h-48 object-cover" style={{ filter: effectStyles[effect], opacity: brightness / 100 }} />
                  )}
                  <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {/* Effects */}
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Palette className="h-4 w-4 text-[#c9a96e]" /> Effects</h2>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(effectLabels) as EffectType[]).map(eff => (
                  <button key={eff} onClick={() => setEffect(eff)}
                    className={`rounded-xl p-2 text-center transition-all border ${effect === eff ? "border-[#c9a96e] bg-[#c9a96e]/10" : "border-[#1e1e2a] bg-[#12121a]/50"}`}>
                    <div className={`h-6 w-full rounded-lg mb-1 ${eff === "none" ? "bg-gradient-to-br from-slate-600 to-slate-700" : eff === "vintage" ? "bg-gradient-to-br from-amber-400 to-amber-800" : eff === "bw" ? "bg-gradient-to-br from-gray-400 to-gray-900" : eff === "warm" ? "bg-gradient-to-br from-orange-300 to-rose-500" : eff === "cool" ? "bg-gradient-to-br from-blue-300 to-cyan-600" : eff === "dramatic" ? "bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900" : "bg-gradient-to-br from-pink-200 to-purple-300"}`} />
                    <span className="text-[8px] font-semibold text-slate-400">{effectLabels[eff]}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-500"><Sun className="h-3 w-3 inline mr-1" />Brightness</span><span className="text-white">{brightness}%</span></div>
                  <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full h-1 rounded-full appearance-none bg-[#1e1e2a] accent-[#c9a96e] cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-500"><Contrast className="h-3 w-3 inline mr-1" />Contrast</span><span className="text-white">{contrast}%</span></div>
                  <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full h-1 rounded-full appearance-none bg-[#1e1e2a] accent-[#c9a96e] cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Eye className="h-4 w-4 text-[#c9a96e]" /> Preview</h2>
              <div className="flex justify-center">
                <div className="w-[280px] bg-white rounded-[28px] shadow-2xl overflow-hidden border-4 border-slate-700">
                  <div className="bg-white px-4 pt-6 pb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#12121a]">OP</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-900">OnePost AI</p>
                  </div>
                  <div className="aspect-square bg-slate-200 relative overflow-hidden" style={{ filter: effectStyles[effect], opacity: brightness / 100 }}>
                    {mediaPreview ? (
                      isVideo ? <video src={mediaPreview} className="w-full h-full object-cover" /> : <img src={mediaPreview} alt="Content" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c9a96e]/10 to-slate-200">
                        <Image className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2.5 bg-white">
                    <p className="text-[9px] text-slate-800 line-clamp-2">{caption || <span className="text-slate-300 italic">Your caption...</span>}</p>
                    {hashtags && <p className="text-[8px] text-[#c9a96e] mt-1 truncate">{hashtags}</p>}
                  </div>
                </div>
              </div>
            </div>
            {/* Caption & Hashtags */}
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Caption</label>
                <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption..." className="mt-1 bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50 min-h-[60px]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Hash className="h-3 w-3" /> Hashtags</label>
                <Input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#content #viral" className="mt-1 bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
              </div>
            </div>
            {/* Publish */}
            <Button className="w-full py-4 bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#12121a] font-bold rounded-xl shadow-lg shadow-[#c9a96e]/20">
              <Send className="h-5 w-5 mr-2" /> Publish to Social
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
