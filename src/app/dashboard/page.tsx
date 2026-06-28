'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Sparkles, PenLine, Instagram, Twitter, Linkedin, Globe, CheckCircle2, Clock, Loader2, MessageSquare } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  status: string;
  platform: string;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/auth/login');
        } else {
          setUser(data.user);
          return fetch('/api/posts').then(r => r.json());
        }
      })
      .then(data => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCreate = () => {
    if (!input.trim()) return;
    setCreating(true);
    // Navigate to create page with the prompt pre-filled
    router.push(`/create?prompt=${encodeURIComponent(input.trim())}`);
  };

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#b8944a] flex items-center justify-center text-white font-bold text-sm">1P</div>
          <span className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>One Post AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/create" className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#b8944a] text-white font-medium hover:shadow-lg hover:shadow-[#c9a96e]/20 transition-all">
            <PenLine className="h-4 w-4" />
            <span className="hidden sm:inline">New Post</span>
          </Link>
        </div>
      </header>

      <main className="pt-20 px-4 pb-10 max-w-3xl mx-auto">
        {/* Hero section - CHAT FIRST */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 text-[#c9a96e] text-xs mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Content Creation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            What do you want to post today?
          </h1>
          <p className="text-[#a09080] text-sm max-w-lg mx-auto">
            Just type what you want to say. Our AI will write it, pick hashtags, and get it ready to publish.
          </p>
        </div>

        {/* Big chat-like input */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-end gap-2 bg-[#1a1a28] border border-[#2a2a3a] rounded-2xl p-3 focus-within:border-[#c9a96e]/50 focus-within:ring-1 focus-within:ring-[#c9a96e]/30 transition-all shadow-xl shadow-black/20">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Write a fun Instagram post about our new summer collection with 5 hashtags"
                rows={2}
                className="flex-1 bg-transparent text-base text-[#e8e0d4] placeholder-[#6b6b80] resize-none outline-none px-2 py-1 min-h-[56px]"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !input.trim()}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944a] text-white hover:shadow-lg hover:shadow-[#c9a96e]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-[#6b6b80] mt-2 px-1">
              Press Enter or tap the send button → AI writes, hashtags, schedule — all handled for you
            </p>
          </div>
        </div>

        {/* Quick platform badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: '📸', label: 'Instagram' },
            { icon: '🐦', label: 'Twitter/X' },
            { icon: '💼', label: 'LinkedIn' },
            { icon: '📘', label: 'Facebook' },
            { icon: '▶️', label: 'YouTube' },
            { icon: '🎵', label: 'TikTok' },
          ].map((p) => (
            <span key={p.label} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1a1a28] border border-[#2a2a3a] text-xs text-[#a09080]">
              <span>{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>

        {/* Mini divider */}
        <div className="gold-line mb-8" />

        {/* Stats - minimal */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Published', value: published, color: '#34d399' },
            { label: 'Scheduled', value: scheduled, color: '#c9a96e' },
            { label: 'Drafts', value: drafts, color: '#a09080' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-[#a09080] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Posts - minimal list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Recent Posts</h2>
          <Link href="/create" className="text-sm text-[#c9a96e] hover:text-[#d4b87a]">View All →</Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <div className="text-4xl mb-3">✍️</div>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No posts yet</h3>
            <p className="text-[#a09080] text-sm mb-4">Type what you want to say above and let AI handle the rest!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#1a1a28', border: '1px solid #2a2a3a' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#2a2a3a' }}>
                    {post.status === 'published' ? '✅' : post.status === 'scheduled' ? '📅' : '📝'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{post.title || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: post.status === 'published' ? '#34d399' : post.status === 'scheduled' ? '#c9a96e' : '#a09080' }}>
                        {post.status}
                      </span>
                      <span className="text-xs text-[#6b6b80]">{post.platform || 'General'}</span>
                    </div>
                  </div>
                </div>
                <Link href={`/create?id=${post.id}`} className="text-xs text-[#c9a96e] hover:text-[#d4b87a] shrink-0">Edit</Link>
              </div>
            ))}
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#6b6b80]">
            <span className="text-[#c9a96e]">💡 Tip:</span> Try &quot;Write a LinkedIn post about our latest product launch with 3 key benefits&quot;
          </p>
        </div>
      </main>
    </div>
  );
}