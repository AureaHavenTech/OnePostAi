import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

function getUserId(req: Request): number | null {
  const sessionId = req.headers.get('cookie')?.split('session_id=')?.[1]?.split(';')?.[0];
  if (!sessionId) return null;
  const session = getSession(sessionId);
  return session?.user_id || null;
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, scheduleFor } = await req.json();
  const db = getDb();

  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(postId, userId) as any;
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (scheduleFor) {
    // Schedule for later
    db.prepare(
      `UPDATE posts SET status = 'scheduled', scheduled_for = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(scheduleFor, postId);

    return NextResponse.json({
      message: 'Post scheduled successfully',
      post: { ...post, status: 'scheduled', scheduled_for: scheduleFor },
    });
  } else {
    // Publish immediately
    db.prepare(
      `UPDATE posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).run(postId);

    // TODO: Integrate with actual platform APIs
    return NextResponse.json({
      message: 'Post published successfully',
      post: { ...post, status: 'published', published_at: new Date().toISOString() },
    });
  }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const scheduled = db.prepare(
    `SELECT * FROM posts WHERE user_id = ? AND status = 'scheduled' ORDER BY scheduled_for ASC`
  ).all(userId);

  return NextResponse.json({ scheduled });
}
