"use client";

import { useState, useEffect } from "react";
import { BRAND, THEME } from "@/lib/shared/brand-config";

interface Brand {
  id: string; name: string; description: string; brandVoice: string;
  platforms: string[]; scheduleConfig: { postsPerDay: number; postEvery: number; timezone: string };
  createdAt: string;
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "linkedin", "snapchat", "pinterest"];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", brandVoice: "professional", platforms: ["tiktok", "instagram"] as string[], postsPerDay: 3, postEvery: 2, timezone: "EST" });

  useEffect(() => { fetchBrands(); }, []);

  async function fetchBrands() {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function saveBrand() {
    if (!form.name) return;
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    const res = await fetch("/api/brands", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); setEditing(null); resetForm(); fetchBrands(); }
  }

  async function deleteBrand(id: string) {
    if (!confirm("Delete this brand?")) return;
    await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    fetchBrands();
  }

  function editBrand(brand: Brand) {
    setEditing(brand);
    setForm({ name: brand.name, description: brand.description, brandVoice: brand.brandVoice, platforms: brand.platforms, postsPerDay: brand.scheduleConfig.postsPerDay, postEvery: brand.scheduleConfig.postEvery, timezone: brand.scheduleConfig.timezone });
    setShowForm(true);
  }

  function resetForm() { setForm({ name: "", description: "", brandVoice: "professional", platforms: ["tiktok", "instagram"], postsPerDay: 3, postEvery: 2, timezone: "EST" }); }
  function togglePlatform(p: string) { setForm(f => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p] })); }

  return (
    <div className="min-h-screen p-8" style={{ background: THEME.colors.cream, color: THEME.colors.charcoal }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: THEME.fonts.heading }}>Brands</h1>
            <p className="text-sm opacity-70 mt-1">Manage your brand profiles and content strategies</p>
          </div>
          <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: THEME.colors.gold, color: "#fff" }}>+ New Brand</button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <div className="rounded-2xl p-8 w-full max-w-lg mx-4" style={{ background: "#fff", color: THEME.colors.charcoal }} onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-6">{editing ? "Edit Brand" : "Create Brand"}</h2>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border" style={{ borderColor: "#e0d8cc" }} placeholder="e.g. Mellow Sleep" /></div>
                <div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border" style={{ borderColor: "#e0d8cc" }} rows={2} placeholder="Luxury sleepwear brand..." /></div>
                <div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Brand Voice</label><select value={form.brandVoice} onChange={e => setForm(f => ({ ...f, brandVoice: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border" style={{ borderColor: "#e0d8cc" }}><option value="professional">Professional</option><option value="luxury">Luxury</option><option value="casual">Casual</option><option value="humorous">Humorous</option><option value="inspirational">Inspirational</option></select></div>
                <div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Platforms</label><div className="flex flex-wrap gap-2">{[...PLATFORMS].map(p => (<button key={p} onClick={() => togglePlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.platforms.includes(p) ? "text-white" : "opacity-50"}`} style={{ background: form.platforms.includes(p) ? THEME.colors.gold : "#eee" }}>{p}</button>))}</div></div>
                <div className="grid grid-cols-3 gap-3"><div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Posts/Day</label><input type="number" value={form.postsPerDay} onChange={e => setForm(f => ({ ...f, postsPerDay: parseInt(e.target.value) || 3 }))} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "#e0d8cc" }} /></div><div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Every N Days</label><input type="number" value={form.postEvery} onChange={e => setForm(f => ({ ...f, postEvery: parseInt(e.target.value) || 2 }))} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "#e0d8cc" }} /></div><div><label className="block text-xs font-semibold mb-1 uppercase tracking-wider opacity-60">Timezone</label><select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "#e0d8cc" }}><option>EST</option><option>PST</option><option>CST</option><option>GMT</option><option>UTC</option></select></div></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={saveBrand} className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: THEME.colors.gold }}>{editing ? "Update" : "Create"} Brand</button><button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "#f0ece6" }}>Cancel</button></div>
            </div>
          </div>
        )}

        {loading ? <p className="text-center py-12 opacity-50">Loading brands...</p> : brands.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#fff" }}>
            <p className="text-4xl mb-4">🏷️</p>
            <p className="text-lg font-semibold mb-2">No brands yet</p>
            <p className="text-sm opacity-60 mb-6">Create your first brand to start generating content</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-3 rounded-xl font-semibold text-sm text-white" style={{ background: THEME.colors.gold }}>+ Create Brand</button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">{brands.map(brand => (
            <div key={brand.id} className="rounded-2xl p-6 transition-all hover:shadow-md" style={{ background: "#fff" }}>
              <div className="flex justify-between items-start mb-3">
                <div><h3 className="text-lg font-bold" style={{ fontFamily: THEME.fonts.heading }}>{brand.name}</h3><p className="text-xs opacity-50 mt-0.5">{brand.description?.substring(0, 60) || "No description"}</p></div>
                <div className="flex gap-1"><button onClick={() => editBrand(brand)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-70" style={{ background: "#f0ece6" }}>Edit</button><button onClick={() => deleteBrand(brand.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 transition-all hover:bg-red-50">Delete</button></div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">{brand.platforms.map(p => (<span key={p} className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: "#f5f0ea", color: THEME.colors.charcoal }}>{p}</span>))}</div>
              <div className="flex gap-4 text-xs opacity-60"><span>🗣️ {brand.brandVoice}</span><span>📅 {brand.scheduleConfig.postsPerDay}/day</span><span>🕐 Every {brand.scheduleConfig.postEvery} days</span><span>🌍 {brand.scheduleConfig.timezone}</span></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}