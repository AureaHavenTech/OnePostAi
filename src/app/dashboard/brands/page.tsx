"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Briefcase, Globe, Calendar, Save, X } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  description?: string;
  brandVoice?: string;
  niche?: string;
  platforms?: string[];
  platform_accounts?: string;
  scheduleConfig?: { postsPerDay?: number; postEvery?: number; timezone?: string };
  created_at?: string;
}

const ALL_PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "linkedin", "snapchat", "pinterest"];
const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    brandVoice: "professional",
    platforms: ["tiktok", "instagram"],
    postsPerDay: 3,
    postEvery: 2,
    timezone: "EST",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brands", { cache: "no-store" });
      const data = await res.json();
      setBrands(data.brands || []);
    } catch (e: any) {
      setError(`Failed to load brands: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", description: "", brandVoice: "professional", platforms: ["tiktok", "instagram"], postsPerDay: 3, postEvery: 2, timezone: "EST" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(brand: Brand) {
    const platforms = (() => {
      try {
        if (Array.isArray(brand.platforms)) return brand.platforms as string[];
        if (typeof brand.platform_accounts === "string") {
          const parsed = JSON.parse(brand.platform_accounts);
          if (Array.isArray(parsed)) return parsed as string[];
        }
      } catch {}
      return ["tiktok", "instagram"];
    })();
    setForm({
      name: brand.name || "",
      description: brand.description || "",
      brandVoice: brand.brandVoice || brand.niche || "professional",
      platforms,
      postsPerDay: brand.scheduleConfig?.postsPerDay || 3,
      postEvery: brand.scheduleConfig?.postEvery || 2,
      timezone: brand.scheduleConfig?.timezone || "EST",
    });
    setEditingId(brand.id);
    setShowForm(true);
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Brand name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        description: form.description.trim(),
        brandVoice: form.brandVoice,
        platforms: form.platforms,
        scheduleConfig: { postsPerDay: form.postsPerDay, postEvery: form.postEvery, timezone: form.timezone },
      };
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/brands", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await loadBrands();
      resetForm();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete brand "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/brands?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await loadBrands();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#12121a] text-[#e8e0d4] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#c9a96e] flex items-center gap-2" style={{ fontFamily: "Playfair Display, serif" }}>
              <Briefcase className="w-7 h-7" /> Brands
            </h1>
            <p className="text-sm text-[#e8e0d4]/70 mt-1">Manage multiple brands, each with their own voice, platforms, and schedule</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#c9a96e] text-[#12121a] hover:bg-[#c9a96e]/90">
            <Plus className="w-4 h-4 mr-2" /> New Brand
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-5 rounded-lg border border-[#c9a96e]/30 bg-[#1a1a26]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#c9a96e]">{editingId ? "Edit Brand" : "New Brand"}</h2>
              <button onClick={resetForm} className="text-[#e8e0d4]/60 hover:text-[#e8e0d4]"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#12121a] border border-[#c9a96e]/20 rounded px-3 py-2 text-[#e8e0d4] focus:border-[#c9a96e] outline-none"
                  placeholder="e.g. Mellow Sleep"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-1">Brand Voice</label>
                <select
                  value={form.brandVoice}
                  onChange={(e) => setForm({ ...form, brandVoice: e.target.value })}
                  className="w-full bg-[#12121a] border border-[#c9a96e]/20 rounded px-3 py-2 text-[#e8e0d4] focus:border-[#c9a96e] outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="playful">Playful</option>
                  <option value="luxury">Luxury</option>
                  <option value="casual">Casual</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#12121a] border border-[#c9a96e]/20 rounded px-3 py-2 text-[#e8e0d4] focus:border-[#c9a96e] outline-none"
                  rows={2}
                  placeholder="What this brand is about, target audience, unique value..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        form.platforms.includes(p)
                          ? "bg-[#c9a96e] text-[#12121a] border-[#c9a96e]"
                          : "bg-transparent text-[#e8e0d4]/70 border-[#c9a96e]/30 hover:border-[#c9a96e]/60"
                      }`}
                    >
                      {PLATFORM_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-1">Posts per day</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.postsPerDay}
                  onChange={(e) => setForm({ ...form, postsPerDay: Number(e.target.value) })}
                  className="w-full bg-[#12121a] border border-[#c9a96e]/20 rounded px-3 py-2 text-[#e8e0d4] focus:border-[#c9a96e] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#e8e0d4]/60 mb-1">Post every (days)</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={form.postEvery}
                  onChange={(e) => setForm({ ...form, postEvery: Number(e.target.value) })}
                  className="w-full bg-[#12121a] border border-[#c9a96e]/20 rounded px-3 py-2 text-[#e8e0d4] focus:border-[#c9a96e] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetForm} className="border-[#c9a96e]/30 text-[#e8e0d4]">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#c9a96e] text-[#12121a] hover:bg-[#c9a96e]/90">
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-[#e8e0d4]/60">Loading brands…</div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#c9a96e]/30 rounded-lg">
            <Briefcase className="w-10 h-10 mx-auto text-[#c9a96e]/60 mb-3" />
            <p className="text-[#e8e0d4]/70 mb-1">No brands yet</p>
            <p className="text-sm text-[#e8e0d4]/50">Create your first brand to start managing its content, schedule, and platforms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map((brand) => {
              const platforms = (() => {
                try {
                  if (Array.isArray(brand.platforms)) return brand.platforms as string[];
                  if (typeof brand.platform_accounts === "string") {
                    const parsed = JSON.parse(brand.platform_accounts);
                    if (Array.isArray(parsed)) return parsed as string[];
                  }
                } catch {}
                return [];
              })();
              return (
                <div key={brand.id} className="p-5 rounded-lg border border-[#c9a96e]/20 bg-[#1a1a26] hover:border-[#c9a96e]/40 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#c9a96e]">{brand.name}</h3>
                      <p className="text-xs text-[#e8e0d4]/60 mt-0.5">Voice: {brand.brandVoice || brand.niche || "professional"}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(brand)} className="p-1.5 rounded hover:bg-[#c9a96e]/10 text-[#c9a96e]" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(brand.id, brand.name)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {brand.description && <p className="text-sm text-[#e8e0d4]/80 mb-3">{brand.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-[#e8e0d4]/60 mb-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{platforms.length} {platforms.length === 1 ? "platform" : "platforms"}</span>
                  </div>
                  {platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {platforms.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-full bg-[#c9a96e]/10 text-[#c9a96e] text-xs">
                          {PLATFORM_LABEL[p] || p}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-[#e8e0d4]/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
