"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Music, Type, Globe, Save, Plus, Trash2, X } from "lucide-react";

const FONT_OPTIONS = ["Inter", "Playfair Display", "Montserrat", "Poppins", "DM Sans", "Roboto", "Nunito", "Source Sans Pro", "Lato", "Open Sans"];
const GENRE_OPTIONS = ["pop", "hip hop", "electronic", "lofi", "jazz", "acoustic", "classical", "r&b", "country", "edm"];
const MOOD_OPTIONS = ["upbeat", "chill", "energetic", "melodic", "dark", "romantic", "happy", "motivational", "calm", "dramatic"];
const VOICE_OPTIONS = ["professional", "casual", "luxury", "playful", "authoritative", "inspirational"];
const PLATFORMS = ["tiktok", "instagram", "facebook", "youtube", "linkedin", "snapchat", "pinterest"];

interface BrandKit {
  id?: string;
  name: string;
  description: string;
  colors: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
  music: { genre: string; mood: string };
  voice: string;
  platforms: string[];
}

export default function BrandKitPage() {
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const defaultKit: BrandKit = {
    name: "",
    description: "",
    colors: { primary: "#c9a96e", secondary: "#e8e0d4", accent: "#d4a0a0" },
    fonts: { heading: "Playfair Display", body: "Inter" },
    music: { genre: "pop", mood: "upbeat" },
    voice: "professional",
    platforms: ["tiktok", "instagram", "youtube"],
  };

  useEffect(() => { loadKits(); }, []);

  async function loadKits() {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-kit").then(r => r.json());
      setKits(res.data || []);
    } catch (err) {
      console.error("Failed to load brand kits:", err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(kit: BrandKit | null) {
    setEditingKit(kit ? { ...kit } : { ...defaultKit, id: undefined });
    modalRef.current?.showModal();
  }

  function closeModal() {
    setEditingKit(null);
    modalRef.current?.close();
  }

  async function saveKit() {
    if (!editingKit?.name.trim()) return alert("Brand name is required");
    setSaving(true);
    try {
      await fetch("/api/brand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingKit),
      });
      closeModal();
      loadKits();
    } catch (err) {
      alert("Failed to save: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteKit(id: string) {
    if (!confirm("Delete this brand kit?")) return;
    try {
      await fetch(`/api/brand-kit/${id}`, { method: "DELETE" });
      loadKits();
    } catch (err) {
      alert("Failed to delete: " + (err as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🎨 Brand Kit</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your brand identities — colors, fonts, music, and voice settings</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => openModal(null)}>
          <Plus className="w-4 h-4 mr-1.5" /> New Brand Kit
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-white/10 border-t-[#c9a84c] rounded-full animate-spin" />
        </div>
      ) : kits.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-1">No brand kits yet</h3>
          <p className="text-zinc-500 text-sm mb-4">Create your first brand kit to start managing your brand identities</p>
          <Button variant="glow" size="sm" onClick={() => openModal(null)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create Brand Kit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kits.map(kit => (
            <div
              key={kit.id}
              onClick={() => openModal(kit)}
              className="glass-card p-5 cursor-pointer transition-all duration-200 hover:bg-white/10 relative group"
            >
              <button
                onClick={(e) => { e.stopPropagation(); if (kit.id) deleteKit(kit.id); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-900/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div
                className="w-12 h-12 rounded-lg mb-3 border border-white/10"
                style={{ background: `linear-gradient(135deg, ${kit.colors?.primary || "#c9a96e"}, ${kit.colors?.secondary || "#e8e0d4"})` }}
              />
              <h3 className="font-semibold text-zinc-200">{kit.name || "Untitled"}</h3>
              <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">{kit.description || "No description"}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(kit.platforms || []).map(p => (
                  <span key={p} className="text-[0.65rem] px-2 py-0.5 rounded bg-white/10 text-zinc-400 capitalize">{p}</span>
                ))}
                <span className="text-[0.65rem] px-2 py-0.5 rounded bg-white/10 text-zinc-400">🎵 {kit.music?.genre || "pop"}</span>
                <span className="text-[0.65rem] px-2 py-0.5 rounded bg-white/10 text-zinc-400">🗣 {kit.voice || "professional"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <dialog ref={modalRef} className="rounded-xl shadow-2xl border-0 p-0 max-w-xl w-full backdrop:bg-black/80 max-h-[90vh] overflow-y-auto bg-[#1a1a24]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-zinc-100">{editingKit?.id ? "Edit" : "Create"} Brand Kit</h2>
            <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Brand Name</label>
              <input
                type="text"
                value={editingKit?.name || ""}
                onChange={e => setEditingKit(prev => prev ? { ...prev, name: e.target.value } : prev)}
                placeholder="e.g., Mellow Sleep"
                className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Description</label>
              <textarea
                value={editingKit?.description || ""}
                onChange={e => setEditingKit(prev => prev ? { ...prev, description: e.target.value } : prev)}
                rows={2}
                placeholder="Brief brand description"
                className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none resize-none"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Colors
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["primary", "secondary", "accent"].map(key => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-500 capitalize mb-1">{key}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(editingKit?.colors as any)?.[key] || "#c9a96e"}
                        onChange={e => setEditingKit(prev => prev ? { ...prev, colors: { ...prev.colors, [key]: e.target.value } } : prev)}
                        className="w-10 h-10 p-0.5 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={(editingKit?.colors as any)?.[key] || ""}
                        onChange={e => setEditingKit(prev => prev ? { ...prev, colors: { ...prev.colors, [key]: e.target.value } } : prev)}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-xs focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Fonts
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["heading", "body"].map(key => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-500 capitalize mb-1">{key} Font</label>
                    <select
                      value={(editingKit?.fonts as any)?.[key] || "Inter"}
                      onChange={e => setEditingKit(prev => prev ? { ...prev, fonts: { ...prev.fonts, [key]: e.target.value } } : prev)}
                      className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                    >
                      {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Music */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" /> Music
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Genre</label>
                  <select
                    value={editingKit?.music?.genre || "pop"}
                    onChange={e => setEditingKit(prev => prev ? { ...prev, music: { ...prev.music, genre: e.target.value } } : prev)}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                  >
                    {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Mood</label>
                  <select
                    value={editingKit?.music?.mood || "upbeat"}
                    onChange={e => setEditingKit(prev => prev ? { ...prev, music: { ...prev.music, mood: e.target.value } } : prev)}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                  >
                    {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Voice */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">🗣 Voice</label>
              <select
                value={editingKit?.voice || "professional"}
                onChange={e => setEditingKit(prev => prev ? { ...prev, voice: e.target.value } : prev)}
                className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-white/10 text-zinc-200 text-sm focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
              >
                {VOICE_OPTIONS.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <label key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-sm cursor-pointer transition-all hover:border-[#c9a84c] has-[:checked]:bg-[#c9a84c]/10 has-[:checked]:border-[#c9a84c] text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editingKit?.platforms?.includes(p) || false}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...(editingKit?.platforms || []), p]
                          : (editingKit?.platforms || []).filter(x => x !== p);
                        setEditingKit(prev => prev ? { ...prev, platforms: updated } : prev);
                      }}
                      className="accent-[#c9a84c]"
                    />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-white/5 transition-colors">Cancel</button>
            <Button variant="glow" size="sm" onClick={saveKit} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Brand Kit"}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}