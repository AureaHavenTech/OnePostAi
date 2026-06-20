'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d15] border-r border-[#2a2a3a] p-6 hidden md:block">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">1P</div>
          <span className="font-bold">One Post AI</span>
        </Link>

        <nav className="space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard', icon: '📊' },
            { label: 'Create Post', href: '/create', icon: '✍️' },
            { label: 'Publish', href: '/publish', icon: '🚀' },
            { label: 'Pricing', href: '/pricing', icon: '💎' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#6b6b80] hover:text-white hover:bg-[#1a1a28] transition-all duration-200"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 rounded-xl bg-[#1a1a28] border border-[#2a2a3a]">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-[#6b6b80] mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a] p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-xs">1P</div>
            <span className="font-bold text-sm">One Post AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/create" className="btn-primary text-xs px-4 py-2">New Post</Link>
          </div>
        </div>
        <div className="flex gap-4 mt-3 overflow-x-auto pb-1">
          <Link href="/dashboard" className="text-xs text-purple-400 font-medium">Dashboard</Link>
          <Link href="/create" className="text-xs text-[#6b6b80]">Create</Link>
          <Link href="/publish" className="text-xs text-[#6b6b80]">Publish</Link>
          <Link href="/pricing" className="text-xs text-[#6b6b80]">Pricing</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 pt-20 md:pt-10 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Posts', value: posts.length, color: 'text-purple-400' },
              { label: 'Published', value: published, color: 'text-green-400' },
              { label: 'Drafts', value: drafts, color: 'text-yellow-400' },
              { label: 'Scheduled', value: scheduled, color: 'text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="text-[#6b6b80] text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Posts */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Posts</h2>
            <Link href="/create" className="btn-primary text-sm px-4 py-2">New Post</Link>
          </div>

          {posts.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-[#6b6b80] text-sm mb-6">Create your first post to get started</p>
              <Link href="/create" className="btn-primary">Create Your First Post</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 10).map((post) => (
                <div key={post.id} className="card p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{post.title || 'Untitled'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published' ? 'bg-green-500/10 text-green-400' :
                        post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-[#6b6b80]">{post.platform}</span>
                      <span className="text-xs text-[#6b6b80]">{new Date(post.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/create?id=${post.id}`} className="text-sm text-purple-400 hover:text-purple-300">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
