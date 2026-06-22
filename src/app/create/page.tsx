'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [_user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('all');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
        if (editId) {
          fetch('/api/posts').then(r => r.json()).then(d => {
            const post = d.posts?.find((p: any) => p.id === Number(editId));
            if (post) {
              setTitle(post.title);
              setContent(post.content);
              setPlatform(post.platform);
            }
          });
        }
      }
    }).catch(() => router.push('/auth/login')).finally(() => setLoading(false));
  }, [router, editId]);

  const handleSave = async (status: string) => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body: any = { title, content, platform, status };
      if (editId) body.id = Number(editId);

      const res = await fetch('/api/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a] p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-xs">1P</div>
            <span className="font-bold text-sm">One Post AI</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-20 md:pt-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-[#6b6b80] hover:text-white mb-2 inline-block">← Back to Dashboard</Link>
            <h1 className="text-2xl font-bold">{editId ? 'Edit Post' : 'Create New Post'}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary text-sm px-5 py-2.5">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => handleSave('draft')} disabled={saving} className="btn-primary text-sm px-5 py-2.5">
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">Post Title</label>
            <input
              type="text"
              className="input-field text-lg"
              placeholder="Enter your post title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Platforms' },
                { value: 'twitter', label: 'Twitter/X' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'facebook', label: 'Facebook' },
                { value: 'blog', label: 'Blog' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    platform === p.value
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : 'bg-[#1a1a28] border border-[#2a2a3a] text-[#6b6b80] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              className="input-field min-h-[400px] resize-y font-mono text-sm leading-relaxed"
              placeholder="Write your post content here... You can use markdown for formatting.

# Heading
**Bold text**
- List items
> Quotes"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="card p-6">
            <h3 className="text-sm font-medium mb-4">Preview</h3>
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-bold text-white mb-4">{title || 'Untitled Post'}</h2>
              <div className="text-[#e8e8ed] whitespace-pre-wrap leading-relaxed">
                {content || 'Your content will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
