"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MediaUploader from "@/components/MediaUploader";
import {
  Sparkles, Image, Type, Film, Music, Palette, Crop, Sun, Contrast,
  Send, Loader2, CheckCheck, ChevronRight, SlidersHorizontal, Wand2,
  Hash, Smile, CalendarClock, X, Eye, Edit3, Layers, MoveHorizontal,
  Scissors, Trash2, GripHorizontal, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Download, Share2, Clock, CheckCircle2,
  RefreshCw, ExternalLink
} from "lucide-react";

type EffectType = "none" | "vintage" | "bw" | "warm" | "cool" | "dramatic" | "soft";
type PlatformType = "instagram" | "tiktok" | "facebook" | "twitter" | "youtube" | "linkedin" | "pinterest";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
}

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

interface EditorState {
  caption: string;
  hashtags: string;
  effects: EffectType;
  brightness: number;
  contrast: number;
  platforms: PlatformType[];
  scheduledDate: string;
  scheduledTime: string;
  textOverlays: TextOverlay[];
  crop: CropSettings;
  trimStart: number;
  trimEnd: number;
}

const DEFAULT_OVERLAY: Omit<TextOverlay, "id"> = {
  text: "New Text",
  x: 50,
  y: 80,
  fontSize: 24,
  color: "#ffffff",
  bold: false,
  italic: false,
  align: "center",
};

export default function ContentEditorPage() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({
    caption: "", hashtags: "", effects: "none",
    brightness: 50, contrast: 50,
    platforms: ["instagram"],
    scheduledDate: "", scheduledTime: "",
    textOverlays: [],
    crop: { x: 0, y: 0, width: 100, height: 100, active: false },
    trimStart: 0, trimEnd: 100,
  });
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [publishResults, setPublishResults] = useState<any[]>([]);
  const [showPublishLog, setShowPublishLog] = useState(false);
  const [draggingOverlay, setDraggingOverlay] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMediaSelect = useCallback((file: File | null) => {
    setMediaFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  }, []);

  const handleUploadComplete = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  }, []);

  const updateEditor = (key: keyof EditorState, value: any) => {
    setEditor((prev) => ({ ...prev, [key]: value }));
  };

  const togglePlatform = (p: PlatformType) => {
    setEditor((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const isVideo = mediaFile ? /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaFile.name) : false;

  // ============================================================
  // TEXT OVERLAY MANAGEMENT
  // ============================================================
  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      ...DEFAULT_OVERLAY,
      id: "overlay_" + Date.now(),
    };
    updateEditor("textOverlays", [...editor.textOverlays, newOverlay]);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    updateEditor("textOverlays",
      editor.textOverlays.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const removeOverlay = (id: string) => {
    updateEditor("textOverlays", editor.textOverlays.filter((o) => o.id !== id));
  };

  const handleOverlayMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDraggingOverlay(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const overlay = editor.textOverlays.find((o) => o.id === id);
    if (!overlay || !previewRef.current) return;

    const handleMouseMove = (me: MouseEvent) => {
      const rect = previewRef.current!.getBoundingClientRect();
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      updateOverlay(id, {
        x: Math.max(0, Math.min(100, overlay.x + dx)),
        y: Math.max(0, Math.min(100, overlay.y + dy)),
      });
    };

    const handleMouseUp = () => {
      setDraggingOverlay(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // ============================================================
  // TRIM/CROP MANAGEMENT
  // ============================================================
  const toggleCrop = () => {
    updateEditor("crop", { ...editor.crop, active: !editor.crop.active });
  };

  // ============================================================
  // SAVE DRAFT — real API integration
  // ============================================================
  const handleSaveDraft = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editor.caption.substring(0, 100) || "Untitled",
          content: JSON.stringify({
            caption: editor.caption,
            hashtags: editor.hashtags,
            effects: editor.effects,
            brightness: editor.brightness,
            contrast: editor.contrast,
            platforms: editor.platforms,
            textOverlays: editor.textOverlays,
          }),
          platform: editor.platforms[0] || "all",
          status: "draft",
          scheduled_for: editor.scheduledDate && editor.scheduledTime
            ? `${editor.scheduledDate}T${editor.scheduledTime}:00` : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // PUBLISH — real API integration with demo mode
  // ============================================================
  const handlePublish = async () => {
    setPosting(true);
    setPosted(false);
    setPublishResults([]);
    setShowPublishLog(true);

    const results: any[] = [];
    for (const platform of editor.platforms) {
      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            mediaUrl: mediaPreview || "",
            caption: editor.caption,
            hashtags: editor.hashtags.split(" ").filter(Boolean),
            title: editor.caption.substring(0, 100),
            scheduledFor: editor.scheduledDate && editor.scheduledTime
              ? `${editor.scheduledDate}T${editor.scheduledTime}:00` : null,
          }),
        });
        const data = await res.json();
        results.push(data);
        setPublishResults([...results]);
      } catch (err: any) {
        results.push({
          platform, success: false,
          message: `Failed: ${err.message}`,
          status: "failed",
        });
        setPublishResults([...results]);
      }
    }

    setPosting(false);
    setPosted(true);
    setTimeout(() => setPosted(false), 5000);
  };

  const simulatedPreviewUrl = mediaPreview || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

  const effectLabels: Record<EffectType, string> = {
    none: "Original", vintage: "Vintage", bw: "B&W",
    warm: "Warm Glow", cool: "Cool Tones",
    dramatic: "Dramatic", soft: "Soft Dream",
  };

  const effectStyles: Record<EffectType, string> = {
    none: "none",
    vintage: "sepia(60%) hue-rotate(-10deg)",
    bw: "grayscale(100%)",
    warm: "sepia(30%) saturate(140%) hue-rotate(-5deg)",
    cool: "hue-rotate(190deg) saturate(80%)",
    dramatic: "contrast(150%) brightness(70%) saturate(110%)",
    soft: "brightness(110%) saturate(60%) contrast(80%)",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Edit3 className="h-8 w-8 text-brand-400" />
            <span>Content Editor</span>
          </h1>
          <p className="text-slate-400 mt-1 max-w-2xl text-sm">
            Upload, edit with text overlays, apply effects, trim/crop, and publish across platforms.
          </p>
        </div>
        <Badge variant="info" className="uppercase font-bold tracking-wider px-3 py-1 text-[10px]">
          {activeTab === "edit" ? "🎨 Editing Mode" : "👁 Preview Mode"}
        </Badge>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 w-fit border border-slate-800">
        <button onClick={() => setActiveTab("edit")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "edit" ? "bg-brand-500 text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"}`}>
          <Edit3 className="h-4 w-4" /> Edit
        </button>
        <button onClick={() => setActiveTab("preview")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "preview" ? "bg-brand-500 text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"}`}>
          <Eye className="h-4 w-4" /> Preview
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT — Editor Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Media Upload */}
          <Card className="p-5 bg-slate-900/40 border-slate-800">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Film className="h-4 w-4 text-brand-400" /> Media Content
            </h2>
            {!mediaFile ? (
              <MediaUploader onUpload={handleUploadComplete} maxSizeMB={500} multiple={false}
                accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp" />
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video max-h-72" ref={previewRef}>
                  {/* Media with effects */}
                  <div style={{
                    filter: effectStyles[editor.effects],
                    opacity: editor.brightness / 100,
                  }}>
                    {isVideo ? (
                      <video src={mediaPreview!} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={mediaPreview!} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>

                  {/* Text Overlays */}
                  {editor.textOverlays.map((overlay) => (
                    <div key={overlay.id}
                      onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
                      className="absolute cursor-move select-none"
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        fontWeight: overlay.bold ? "bold" : "normal",
                        fontStyle: overlay.italic ? "italic" : "normal",
                        textAlign: overlay.align,
                        textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        zIndex: 10,
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))}

                  {/* Crop overlay indicator */}
                  {editor.crop.active && (
                    <div className="absolute inset-0 border-2 border-brand-400/60 z-20 pointer-events-none">
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute inset-[15%] border-2 border-dashed border-white/50 flex items-center justify-center">
                        <Crop className="h-6 w-6 text-white/40" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1.5 z-30">
                    <Badge variant="info" className="text-[9px] uppercase tracking-wider px-2">
                      {isVideo ? "Video" : "Image"}
                    </Badge>
                    <button onClick={() => handleMediaSelect(null)}
                      className="p-1.5 bg-slate-950/70 backdrop-blur-sm rounded-lg hover:bg-rose-500/20 transition-colors">
                      <X className="h-3.5 w-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 truncate">
                  {mediaFile?.name} ({(mediaFile!.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              </div>
            )}
          </Card>

          {/* Caption & Hashtags */}
          <Card className="p-5 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="h-4 w-4 text-brand-400" /> Caption & Hashtags
            </h2>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Caption</label>
              <Textarea placeholder="Write your caption here..."
                value={editor.caption}
                onChange={(e) => updateEditor("caption", e.target.value)}
                className="min-h-[100px] bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-brand-500/30 resize-y" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-600">{editor.caption.length} / 2200 chars</span>
                <button className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-semibold">
                  <Wand2 className="h-3 w-3" /> AI Suggest Caption
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Hash className="h-3 w-3 text-brand-400" /> Hashtags
              </label>
              <Input placeholder="#trending #viral #content"
                value={editor.hashtags}
                onChange={(e) => updateEditor("hashtags", e.target.value)}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-brand-500/30" />
              <div className="flex gap-1.5 flex-wrap">
                {["#trending", "#viral", "#fyp", "#explore", "#new", "#musthave"].map((tag) => (
                  <button key={tag} onClick={() => updateEditor("hashtags", editor.hashtags ? `${editor.hashtags} ${tag}` : tag)}
                    className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 hover:bg-brand-500/20 hover:text-brand-400 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Text Overlays */}
          <Card className="p-5 bg-slate-900/40 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Type className="h-4 w-4 text-brand-400" /> Text Overlays
              </h2>
              <Button onClick={addTextOverlay} size="sm" variant="outline"
                className="text-[10px] h-7 border-slate-700 hover:border-brand-500/50">
                + Add Text
              </Button>
            </div>
            {editor.textOverlays.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Click &quot;+ Add Text&quot; to place text on your media. Drag to position.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editor.textOverlays.map((overlay) => (
                  <div key={overlay.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GripHorizontal className="h-3 w-3 text-slate-500" />
                        <Input value={overlay.text} onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
                          className="h-6 text-xs bg-transparent border-slate-700 text-white w-32" />
                      </div>
                      <button onClick={() => removeOverlay(overlay.id)}
                        className="p-1 hover:bg-rose-500/20 rounded transition-colors">
                        <Trash2 className="h-3 w-3 text-rose-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="range" min="12" max="72" value={overlay.fontSize}
                        onChange={(e) => updateOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                        className="w-16 h-1 rounded-full appearance-none bg-slate-700 accent-brand-500" />
                      <input type="color" value={overlay.color}
                        onChange={(e) => updateOverlay(overlay.id, { color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-slate-700" />
                      <button onClick={() => updateOverlay(overlay.id, { bold: !overlay.bold })}
                        className={`p-1 rounded text-xs ${overlay.bold ? "bg-brand-500/20 text-brand-400" : "text-slate-500 hover:text-white"}`}>
                        <Bold className="h-3 w-3" />
                      </button>
                      <button onClick={() => updateOverlay(overlay.id, { italic: !overlay.italic })}
                        className={`p-1 rounded text-xs ${overlay.italic ? "bg-brand-500/20 text-brand-400" : "text-slate-500 hover:text-white"}`}>
                        <Italic className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-slate-600">x:{Math.round(overlay.x)}% y:{Math.round(overlay.y)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Effects Panel */}
          <Card className="p-5 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand-400" /> Effects & Filters
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {(["none", "vintage", "bw", "warm", "cool", "dramatic", "soft"] as EffectType[]).map((eff) => (
                <button key={eff} onClick={() => updateEditor("effects", eff)}
                  className={`relative rounded-xl p-3 text-center transition-all border ${
                    editor.effects === eff
                      ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
                      : "border-slate-800 bg-slate-950/50 hover:border-slate-700"}`}>
                  <div className={`h-8 w-full rounded-lg mb-1.5 ${
                    eff === "none" ? "bg-gradient-to-br from-slate-600 to-slate-700"
                    : eff === "vintage" ? "bg-gradient-to-br from-amber-400 to-amber-800"
                    : eff === "bw" ? "bg-gradient-to-br from-gray-400 to-gray-900"
                    : eff === "warm" ? "bg-gradient-to-br from-orange-300 to-rose-500"
                    : eff === "cool" ? "bg-gradient-to-br from-blue-300 to-cyan-600"
                    : eff === "dramatic" ? "bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900"
                    : "bg-gradient-to-br from-pink-200 to-purple-300"}`} />
                  <span className={`text-[9px] font-semibold ${editor.effects === eff ? "text-brand-400" : "text-slate-400"}`}>
                    {effectLabels[eff]}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1"><Sun className="h-3 w-3" /> Brightness</span>
                  <span className="text-white font-medium">{editor.brightness}%</span>
                </div>
                <input type="range" min="0" max="100" value={editor.brightness}
                  onChange={(e) => updateEditor("brightness", parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-brand-500 cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1"><Contrast className="h-3 w-3" /> Contrast</span>
                  <span className="text-white font-medium">{editor.contrast}%</span>
                </div>
                <input type="range" min="0" max="100" value={editor.contrast}
                  onChange={(e) => updateEditor("contrast", parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-brand-500 cursor-pointer" />
              </div>
            </div>
          </Card>

          {/* Trim & Crop */}
          <Card className="p-5 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Scissors className="h-4 w-4 text-brand-400" /> Trim & Crop
            </h2>
            {isVideo && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trim Video</label>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 w-10">{editor.trimStart}s</span>
                  <input type="range" min="0" max="100" value={editor.trimStart}
                    onChange={(e) => updateEditor("trimStart", parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none bg-slate-800 accent-brand-500" />
                  <input type="range" min="0" max="100" value={editor.trimEnd}
                    onChange={(e) => updateEditor("trimEnd", parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none bg-slate-800 accent-brand-500" />
                  <span className="text-[10px] text-slate-500 w-10">{editor.trimEnd}s</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 relative overflow-hidden">
                  <div className="h-full bg-brand-500/40 rounded-full absolute"
                    style={{ left: `${editor.trimStart}%`, right: `${100 - editor.trimEnd}%` }} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={toggleCrop}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    editor.crop.active
                      ? "bg-brand-500/20 border-brand-500 text-brand-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                  <Crop className="h-3.5 w-3.5" /> Crop Mode
                </button>
              </div>
              <span className="text-[10px] text-slate-600">
                Drag overlay text on the preview to position it
              </span>
            </div>
          </Card>
        </div>

        {/* RIGHT — Preview & Publish (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <Card className="overflow-hidden bg-slate-900/40 border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-400" /> {activeTab === "edit" ? "Live Preview" : "Full Preview"}
              </h2>
              <Badge variant="info" className="text-[9px] uppercase tracking-wider">{editor.platforms[0] || "instagram"}</Badge>
            </div>
            <div className="flex justify-center p-6 bg-slate-950/50">
              <div className="w-[280px] bg-white rounded-[28px] shadow-2xl overflow-hidden border-4 border-slate-700">
                <div className="bg-white px-4 pt-6 pb-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">OP</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-900">OnePost AI</p>
                    <p className="text-[7px] text-slate-400">Sponsored</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-[8px]">⋯</span>
                  </div>
                </div>
                <div className="aspect-square bg-slate-200 relative overflow-hidden"
                  style={{
                    filter: effectStyles[editor.effects],
                    opacity: editor.brightness / 100,
                  }}>
                  {mediaPreview ? (
                    isVideo ? (
                      <video src={mediaPreview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="Content" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-slate-200">
                      <Image className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  {/* Text overlays on phone preview */}
                  {editor.textOverlays.map((overlay) => (
                    <div key={overlay.id} className="absolute"
                      style={{
                        left: `${overlay.x}%`, top: `${overlay.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: `${overlay.fontSize * 0.4}px`,
                        color: overlay.color,
                        fontWeight: overlay.bold ? "bold" : "normal",
                        fontStyle: overlay.italic ? "italic" : "normal",
                        textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        zIndex: 10,
                      }}>
                      {overlay.text}
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2.5 bg-white">
                  <p className="text-[9px] text-slate-800 leading-relaxed line-clamp-2">
                    {editor.caption || <span className="text-slate-300 italic">Your caption will appear here...</span>}
                  </p>
                  {editor.hashtags && <p className="text-[8px] text-brand-600 mt-1 truncate">{editor.hashtags}</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Publish Settings */}
          <Card className="p-5 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-brand-400" /> Publish Settings
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {(["instagram", "tiktok", "facebook", "twitter", "youtube", "linkedin", "pinterest"] as PlatformType[]).map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                      editor.platforms.includes(p)
                        ? "bg-brand-500/20 border-brand-500 text-brand-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" /> Date
                </label>
                <Input type="date" value={editor.scheduledDate}
                  onChange={(e) => updateEditor("scheduledDate", e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs focus:ring-brand-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</label>
                <Input type="time" value={editor.scheduledTime}
                  onChange={(e) => updateEditor("scheduledTime", e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs focus:ring-brand-500/30" />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleSaveDraft} disabled={saving || saved} variant="outline"
                className="w-full py-5 text-xs font-bold border-slate-700 hover:border-brand-500/50 transition-all">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving Draft...</>
                : saved ? <><CheckCheck className="h-4 w-4 text-emerald-400 mr-2" /> Draft Saved!</>
                : <><Layers className="h-4 w-4 mr-2" /> Save as Draft</>}
              </Button>
              <Button onClick={handlePublish} disabled={posting || posted || !mediaFile}
                className="w-full py-5 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-xl shadow-lg shadow-brand-500/20 transition-all">
                {posting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Publishing...</>
                : posted ? <><CheckCircle2 className="h-5 w-5 text-emerald-700 mr-2" /> Published! ✓</>
                : <><Send className="h-5 w-5 mr-2" /> Publish to {editor.platforms.length > 1
                    ? `${editor.platforms.length} Platforms`
                    : editor.platforms[0]?.charAt(0).toUpperCase() + editor.platforms[0]?.slice(1) || "Platform"}</>}
              </Button>
            </div>
          </Card>

          {/* Publish Log */}
          {showPublishLog && publishResults.length > 0 && (
            <Card className="p-4 bg-slate-900/40 border-slate-800 animate-in fade-in">
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-brand-400" /> Publishing Log
              </h3>
              <div className="space-y-2">
                {publishResults.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center ${
                      r.success ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                      {r.success ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      : <X className="h-3 w-3 text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white uppercase">{r.platform}</span>
                        <Badge variant={r.success ? "success" : "danger"} className="text-[8px] px-1 py-0">
                          {r.status || (r.success ? "published" : "failed")}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{r.message}</p>
                      {r.url && (
                        <a href={r.url} target="_blank"
                          className="text-[9px] text-brand-400 hover:text-brand-300 flex items-center gap-1 mt-1">
                          <ExternalLink className="h-2.5 w-2.5" /> View Post
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
