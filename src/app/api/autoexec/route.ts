import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// AutoExec Integration Hooks
// This API allows AutoExec to create, read, and manage content programmatically

export async function POST(req: Request) {
  try {
    const authKey = req.headers.get('x-api-key');
    if (!authKey || authKey !== 'autoexec-onepostai-bridge-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    const db = getDb();

    switch (action) {
      case 'create_post': {
        const { userId, title, content, platform } = data;
        const result = db.prepare(
          `INSERT INTO posts (user_id, title, content, platform, status)
           VALUES (?, ?, ?, ?, 'draft')`
        ).run(userId, title, content, platform || 'all');
        
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
        return NextResponse.json({ success: true, post });
      }

      case 'get_user_posts': {
        const { userId } = data;
        const posts = db.prepare(
          'SELECT * FROM posts WHERE user_id = ? ORDER BY updated_at DESC'
        ).all(userId);
        return NextResponse.json({ success: true, posts });
      }

      case 'publish_post': {
        const { postId } = data;
        db.prepare(
          `UPDATE posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
        ).run(postId);
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
        return NextResponse.json({ success: true, post });
      }

      case 'get_stats': {
        const { userId } = data;
        const stats = db.prepare(`
          SELECT 
            COUNT(*) as total_posts,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
          FROM posts WHERE user_id = ?
        `).get(userId);
        return NextResponse.json({ success: true, stats });
      }

      case 'health': {
        return NextResponse.json({ 
          success: true, 
          status: 'healthy',
          app: 'One Post AI',
          version: '1.0.0'
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET health check
export async function GET() {
  return NextResponse.json({
    app: 'One Post AI',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'POST /api/autoexec - Integration hooks',
      'POST /api/posts - CRUD posts',
      'POST /api/publish - Publish/schedule',
      'POST /api/auth/signup - Register',
      'POST /api/auth/login - Login',
      'GET /api/auth/me - Current user',
    ],
  });
}
