'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Send, Loader2, CheckCircle2, Camera, MessageCircle, Share2, Globe, Hash, Clock } from 'lucide-react';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'all', label: 'All Platforms', icon: '🌐' },
];

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledPrompt = searchParams.get('prompt') || '';

  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState(prefilledPrompt);
  const [platform, setPlatform] = useState('instagram');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
      }
    }).catch(() => router.push('/auth/login')).finally(() => setLoading(false));
  }, [router]);

  // If prompt was pre-filled from dashboard, auto-generate
  useEffect(() => {
    if (prefilledPrompt && user) {
      handleGenerate();
    }
  }, [prefilledPrompt, user]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // In a real app, this would call the AI API to generate the post
    // For now, simulate the generation
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false);
    // Navigate to dashboard to show the new post
    router.push('/dashboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#12121a' }}>
        <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#12121a', color: '#e8e0d4' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2a2a3a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#b8944a] flex items-center justify-center text-white font-bold text-sm">1P</div>
            <span className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>One Post AI</span>
          </Link>
        </div>
        <Link href="/dashboard" className="text-sm text-[#a09080] hover:text-white transition-colors">
          ← Back
        </Link>
      </header>

      <main className="pt-24 px-4 pb-10 max-w-2xl mx-auto">
        {/* Simple form */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Create a Post
          </h1>
          <p className="text-sm text-[#a09080]">
            Tell us what you want to say. AI handles the rest.
          </p>
        </div>

        {/* Prompt input - big and simple */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
          <label className="block text-sm font-medium mb-3 text-[#e8e0d4]">
            What do you want to post?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Write a fun Instagram post about our summer sale. Include 5 hashtags and a call to action."
            rows={4}
            className="w-full bg-transparent text-base text-[#e8e0d4] placeholder-[#6b6b80] resize-none outline-none border border-[#2a2a3a] rounded-xl px-4 py-3 focus:border-[#c9a96e]/50 transition-colors"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          />
        </div>

        {/* Platform selector - simple grid of buttons */}
        <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
          <label className="block text-sm font-medium mb-3 text-[#e8e0d4]">
            Where are you posting?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs transition-all ${
                  platform === p.value
                    ? 'bg-[#c9a96e]/15 border border-[#c9a96e]/40 text-[#c9a96e]'
                    : 'bg-[#12121a] border border-[#2a2a3a] text-[#a09080] hover:text-white hover:border-[#6b6b80]'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a96e] to-[#b8944a] text-white hover:shadow-lg hover:shadow-[#c9a96e]/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              AI is creating your post...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Post ✨
            </>
          )}
        </button>

        {/* How it works - dead simple */}
        <div className="mt-10 space-y-3">
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#c9a96e]/10 text-[#c9a96e] text-sm">1</span>
            <div>
              <p className="text-sm font-medium">Type what you want to say</p>
              <p className="text-xs text-[#a09080]">Plain English, just like texting a friend</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#c9a96e]/10 text-[#c9a96e] text-sm">2</span>
            <div>
              <p className="text-sm font-medium">Pick your platform</p>
              <p className="text-xs text-[#a09080]">Choose where you want to publish</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#c9a96e]/10 text-[#c9a96e] text-sm">3</span>
            <div>
              <p className="text-sm font-medium">Tap Generate</p>
              <p className="text-xs text-[#a09080]">AI writes, picks hashtags, schedules — done in seconds</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#12121a' }}>
        <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}