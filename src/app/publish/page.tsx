'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Send, CalendarDays, Clock, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/ui/footer';

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
      if (!data.user) { router.push('/auth/login'); return; }
      setUser(data.user);
      Promise.all([
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/publish').then(r => r.json()),
      ]).then(([postsData, scheduledData]) => {
        if (postsData.posts) setDrafts(postsData.posts.filter((p: Post) => p.status === 'draft'));
        if (scheduledData.scheduled) setScheduled(scheduledData.scheduled);
      });
    }).catch(() => router.push('/auth/login')).finally(() => setLoading(false));
  }, [router]);

  const handlePublish = async (postId: number) => {
    setPublishing(postId);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId }),
      });
      if (res.ok) setDrafts(prev => prev.filter(p => p.id !== postId));
    } finally { setPublishing(null); }
  };

  const handleSchedule = async (postId: number) => {
    if (!scheduleDate) return;
    setPublishing(postId);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, scheduleFor: scheduleDate }),
      });
      if (res.ok) { setDrafts(prev => prev.filter(p => p.id !== postId)); setSchedulePost(null); setScheduleDate(''); }
    } finally { setPublishing(null); }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="glass border-b border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-serif">One Post AI</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/create" className="hover:text-white transition-colors">Create</Link>
          <Link href="/publish" className="text-white font-medium">Publish</Link>
        </nav>
        <Link href="/create"><Button variant="default" size="sm"><Send className="h-4 w-4 mr-1" /> New Post</Button></Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors mb-6 inline-block">← Dashboard</Link>
        <h1 className="text-3xl font-bold text-white mb-8 font-serif">Publish & Schedule</h1>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-serif">
            <Send className="h-5 w-5 text-brand-400" /> Ready to Publish
          </h2>
          {drafts.length === 0 ? (
            <Card className="p-10 text-center">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No drafts ready to publish</p>
              <Link href="/create"><Button variant="default" className="mt-4">Create Post</Button></Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {drafts.map(post => (
                <Card key={post.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500 shrink-0" /><h3 className="font-medium text-white truncate">{post.title || 'Untitled'}</h3></div>
                      <p className="text-sm text-slate-500 mt-1 truncate ml-6">{post.content?.substring(0, 100) || 'No content'}</p>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setSchedulePost(schedulePost === post.id ? null : post.id)}>
                        <CalendarDays className="h-4 w-4 mr-1" /> Schedule
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handlePublish(post.id)} disabled={publishing === post.id}>
                        {publishing === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                        {publishing === post.id ? '' : 'Publish Now'}
                      </Button>
                    </div>
                  </div>
                  {schedulePost === post.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3 items-center">
                      <input type="datetime-local" className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                      <Button variant="default" size="sm" onClick={() => handleSchedule(post.id)} disabled={publishing === post.id || !scheduleDate}>
                        {publishing === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4 mr-1" />}
                        Confirm Schedule
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-serif">
            <Clock className="h-5 w-5 text-blue-400" /> Scheduled Posts
          </h2>
          {scheduled.length === 0 ? (
            <Card className="p-10 text-center"><Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No scheduled posts</p></Card>
          ) : (
            <div className="space-y-3">
              {scheduled.map(post => (
                <Card key={post.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{post.title || 'Untitled'}</h3>
                    <p className="text-sm text-blue-400 mt-1">Scheduled: {post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'Unknown'}</p>
                  </div>
                  <Badge variant="info">Scheduled</Badge>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}