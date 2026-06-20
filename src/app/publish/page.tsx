'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  status: string;
  platform: string;
  scheduled_for: string | null;
}

export default function PublishPage() {
  const router = useRouter();
  const [_user, setUser] = useState<any>(null);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [scheduled, setScheduled] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [schedulePost, setSchedulePost] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
        Promise.all([
          fetch('/api/posts').then(r => r.json()),
          fetch('/api/publish').then(r => r.json()),
        ]).then(([postsData, scheduledData]) => {
          if (postsData.posts) setDrafts(postsData.posts.filter((p: Post) => p.status === 'draft'));
          if (scheduledData.scheduled) setScheduled(scheduledData.scheduled);
        });
      }
    }).catch(() => router.push('/auth/login')).finally(() => setLoading(false));
  }, [router]);

  const handlePublish = async (postId: number) => {
    setPublishing(postId);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        setDrafts(prev => prev.filter(p => p.id !== postId));
      }
    } finally {
      setPublishing(null);
    }
  };

  const handleSchedule = async (postId: number) => {
    if (!scheduleDate) return;
    setPublishing(postId);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, scheduleFor: scheduleDate }),
      });
      if (res.ok) {
        setDrafts(prev => prev.filter(p => p.id !== postId));
        setSchedulePost(null);
        setScheduleDate('');
      }
    } finally {
      setPublishing(null);
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a] p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-xs">1P</div>
          <span className="font-bold text-sm">One Post AI</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto pt-20 md:pt-10 p-6">
        <Link href="/dashboard" className="text-sm text-[#6b6b80] hover:text-white mb-2 inline-block">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mb-8">Publish & Schedule</h1>

        {/* Ready to Publish */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Ready to Publish</h2>
          {drafts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[#6b6b80]">No drafts ready to publish. Create a post first.</p>
              <Link href="/create" className="btn-primary mt-4 inline-block">Create Post</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map(post => (
                <div key={post.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{post.title || 'Untitled'}</h3>
                      <p className="text-sm text-[#6b6b80] mt-1 truncate">{post.content?.substring(0, 100)}</p>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => setSchedulePost(schedulePost === post.id ? null : post.id)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => handlePublish(post.id)}
                        disabled={publishing === post.id}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        {publishing === post.id ? '...' : 'Publish Now'}
                      </button>
                    </div>
                  </div>
                  {schedulePost === post.id && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a3a] flex gap-3 items-center">
                      <input
                        type="datetime-local"
                        className="input-field flex-1"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                      />
                      <button
                        onClick={() => handleSchedule(post.id)}
                        disabled={publishing === post.id || !scheduleDate}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        {publishing === post.id ? '...' : 'Confirm Schedule'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Posts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Scheduled Posts</h2>
          {scheduled.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[#6b6b80]">No scheduled posts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduled.map(post => (
                <div key={post.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{post.title || 'Untitled'}</h3>
                      <p className="text-sm text-blue-400 mt-1">
                        Scheduled for: {post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <span className="tag">Scheduled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
