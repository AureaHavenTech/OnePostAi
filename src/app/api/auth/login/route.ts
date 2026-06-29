import { NextResponse } from 'next/server';
import { verifyUser, createSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password, adminCode } = await req.json();
    
    // Code-only login: AUREA2026 for CEO access - hardcoded to always work
    if (adminCode === 'AUREA2026' && !email) {
      const db = getDb();
      // Create admin_codes table if it doesn't exist
      try { db.exec('CREATE TABLE IF NOT EXISTS admin_codes (code TEXT PRIMARY KEY, uses INTEGER DEFAULT 0, max_uses INTEGER DEFAULT -1, expires_at TEXT)'); } catch {}
      // Create admin user
      let ceoUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
      if (!ceoUser) {
        const userId = crypto.randomUUID ? crypto.randomUUID() : 'ceo_' + Math.random().toString(36).substring(2, 11);
        db.prepare('INSERT OR IGNORE INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(userId, 'owner@onepostai.app', 'Aurea', 1);
        ceoUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      }
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(ceoUser.id);
      const sessionId = createSession(ceoUser.id);
      const response = NextResponse.json(
        { user: { id: ceoUser.id, email: ceoUser.email, name: ceoUser.name, plan: 'unlimited', is_admin: 1 } },
        { status: 200 }
      );
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionId = createSession(user.id);

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, plan: user.plan } },
      { status: 200 }
    );

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
