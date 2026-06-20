import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

function getUserId(req: Request): number | null {
  const sessionId = req.headers.get('cookie')?.split('session_id=')?.[1]?.split(';')?.[0];
  if (!sessionId) return null;
  const session = getSession(sessionId);
  return session?.user_id || null;
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const posts = db.prepare(
    'SELECT * FROM posts WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(userId);

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, platform, status, scheduled_for } = await req.json();
  const db = getDb();

  const result = db.prepare(
    `INSERT INTO posts (user_id, title, content, platform, status, scheduled_for)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(userId, title || 'Untitled', content || '', platform || 'all', status || 'draft', scheduled_for || null);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ post }, { status: 201 });
}

export async function PUT(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, content, platform, status, scheduled_for } = await req.json();
  const db = getDb();

  const existing = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  db.prepare(
    `UPDATE posts SET title = ?, content = ?, platform = ?, status = ?, scheduled_for = ?,
     updated_at = datetime('now') WHERE id = ? AND user_id = ?`
  ).run(
    title || (existing as any).title,
    content ?? (existing as any).content,
    platform || (existing as any).platform,
    status || (existing as any).status,
    scheduled_for || (existing as any).scheduled_for,
    id,
    userId
  );

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  return NextResponse.json({ post });
}

export async function DELETE(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  const db = getDb();

  db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').run(id, userId);
  return NextResponse.json({ success: true });
}
