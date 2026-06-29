'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, FileText, BarChart3, CalendarDays, 
  Settings, LogOut, Plus, Edit, Clock, CheckCircle2,
  Pen, Send, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/ui/footer";

interface Post {
  id: number;
  title: string;
  content: string;
  status: string;
  platform: string;
  created_at: string;
  updated_at: string;
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
      .then(data => { if (data?.posts) setPosts(data.posts); })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info" | "secondary"> = {
      published: "success",
      scheduled: "info",
      draft: "warning",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
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
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <Link href="/create" className="hover:text-white transition-colors">Create</Link>
          <Link href="/publish" className="hover:text-white transition-colors">Publish</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-400 hidden sm:block">{user?.email}</div>
          <Link href="/create"><Button variant="primary" size="sm"><Plus className="h-4 w-4 mr-1" /> New Post</Button></Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white font-serif">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link href="/create"><Button variant="primary"><Plus className="h-4 w-4 mr-1" /> Create Post</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-brand-400' },
            { label: 'Published', value: published, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Drafts', value: drafts, icon: Pen, color: 'text-amber-400' },
            { label: 'Scheduled', value: scheduled, icon: CalendarDays, color: 'text-blue-400' },
          ].map((stat) => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-serif">Recent Posts</h2>
          <Link href="/create"><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> New</Button></Link>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 font-serif">No posts yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first post to get started</p>
            <Link href="/create"><Button variant="primary">Create Your First Post</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 10).map((post) => (
              <Card key={post.id} className="p-5 flex items-center justify-between glass-hover">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{post.title || 'Untitled Post'}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      {statusBadge(post.status)}
                      <span className="text-xs text-slate-500">{post.platform}</span>
                      <span className="text-xs text-slate-500">{new Date(post.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Link href={`/create?id=${post.id}`}>
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}