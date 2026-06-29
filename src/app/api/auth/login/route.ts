import { NextResponse } from 'next/server';
import { verifyUser, createSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password, adminCode } = await req.json();
    
    // Code-only login: enter AUREA2026 for CEO access
    if (adminCode && !email) {
      const db = getDb();
      const code = db.prepare('SELECT * FROM admin_codes WHERE code = ? AND (uses < max_uses OR max_uses = -1) AND (expires_at IS NULL OR expires_at > datetime(\'now\'))').get(adminCode) as any;
      if (!code) {
        return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 401 });
      }
      let ceoUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
      if (!ceoUser) {
        const userId = crypto.randomUUID ? crypto.randomUUID() : 'ceo_' + Math.random().toString(36).substring(2, 11);
        db.prepare('INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(userId, 'owner@onepostai.app', 'Aurea', 1);
        ceoUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      }
      db.prepare('UPDATE admin_codes SET uses = uses + 1 WHERE code = ?').run(adminCode);
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
