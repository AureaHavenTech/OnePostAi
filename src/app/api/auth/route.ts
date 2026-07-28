import { NextRequest, NextResponse } from 'next/server';
import { getDb, createSession, getSession, deleteSession } from '@/lib/db';
import { generateSSOToken, getSisterApps, type AppKey } from '@/lib/sso';
import bcrypt from 'bcryptjs';

const CURRENT_APP: AppKey = 'onepostai';

// Hardcoded access codes — never expire, backward compatible
const VALID_CODES: Record<string, { plan: string; is_admin: boolean }> = {
  'AUREA2026': { plan: 'pro', is_admin: true },
};

// POST /api/auth — Sign up, Sign in, Code login, Logout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, adminCode, action } = body;
    const db = getDb();

    // --- LOGOUT ---
    if (action === 'logout') {
      const sessionToken = request.headers.get('cookie')?.match(/session_token=([^;]+)/)?.[1];
      if (sessionToken) {
        deleteSession(sessionToken);
      }
      const response = NextResponse.json({ success: true, message: 'Logged out' });
      response.cookies.set('session_token', '', { httpOnly: true, maxAge: 0, path: '/' });
      return response;
    }

    // --- CODE-ONLY LOGIN (AUREA2026 backward compat) ---
    if (adminCode && !email && VALID_CODES[adminCode]) {
      const codeConfig = VALID_CODES[adminCode];

      // Find or create owner user
      let ownerUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
      if (!ownerUser) {
        const userId = 'user_ceo_' + Math.random().toString(36).substring(2, 11);
        db.prepare('INSERT OR IGNORE INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(
          userId, 'owner@onepostai.app', 'Aurea', 1
        );
        ownerUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      }
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(ownerUser.id);

      const session = createSession(ownerUser.id);

      // Generate SSO token for cross-app login
      const sso = generateSSOToken({
        userId: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        app: CURRENT_APP,
      });
      const sisters = getSisterApps(CURRENT_APP);

      const response = NextResponse.json({
        success: true,
        message: 'Access granted',
        user: {
          id: ownerUser.id,
          email: ownerUser.email,
          name: ownerUser.name,
          is_admin: codeConfig.is_admin ? 1 : 0,
          plan: codeConfig.plan,
          avatar_url: (ownerUser as any).avatar_url || null,
        },
        sso: {
          token: sso.token,
          expiresIn: 60,
          sisterApps: sisters,
        },
      });

      response.cookies.set('session_token', session.token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
      });

      return response;
    }

    // --- EMAIL + PASSWORD AUTH (signup or login) ---
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    const isLogin = !!user;

    if (!user) {
      // SIGN UP — create new user
      const userId = 'user_' + Math.random().toString(36).substring(2, 11);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if this is the owner email
      const isOwner = email.toLowerCase() === 'aurahaventech@gmail.com';

      db.prepare('INSERT INTO users (id, email, name, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)').run(
        userId, email, name || email.split('@')[0], hashedPassword, isOwner ? 1 : 0
      );

      // Give them a starter subscription by default
      const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
      db.prepare('INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)').run(
        subId, userId, 'starter', 'active'
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      // LOGIN — verify password
      if (user.password_hash) {
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
      }
    }

    // Create session
    const session = createSession(user.id);

    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

    // Generate SSO token for cross-app login
    const sso = generateSSOToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      app: CURRENT_APP,
    });
    const sisters = getSisterApps(CURRENT_APP);

    const response = NextResponse.json({
      success: true,
      message: isLogin ? 'Signed in successfully' : 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0,
        avatar_url: user.avatar_url || null,
      },
      subscription: sub ? { tier: sub.tier, status: sub.status } : null,
      session_token: session.token,
      sso: {
        token: sso.token,
        expiresIn: 60,
        sisterApps: sisters,
      },
    });

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/auth — Get current session user
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken) {
      const session = getSession(sessionToken);
      if (session) {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
        if (user) {
          const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              is_admin: user.is_admin || 0,
              avatar_url: user.avatar_url || null,
              subscription: sub ? { tier: sub.tier, status: sub.status } : null,
            },
          });
        }
      }
    }

    // Fallback: check for owner
    const ownerUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
    if (ownerUser) {
      const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(ownerUser.id) as any;
      return NextResponse.json({
        success: true,
        user: {
          id: ownerUser.id,
          email: ownerUser.email,
          name: ownerUser.name,
          is_admin: ownerUser.is_admin || 0,
          avatar_url: ownerUser.avatar_url || null,
          subscription: sub ? { tier: sub.tier, status: sub.status } : null,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/auth — Update user profile (name, avatar_url)
export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const session = getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar_url } = body;

    if (!name && avatar_url === undefined) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    if (name && (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 64)) {
      return NextResponse.json({ success: false, error: 'Name must be 1-64 characters' }, { status: 400 });
    }

    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), session.userId);
    }
    if (avatar_url !== undefined) {
      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatar_url || null, session.userId);
    }

    // Return updated user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(session.userId) as any;

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0,
        avatar_url: user.avatar_url || null,
        subscription: sub ? { tier: sub.tier, status: sub.status } : null,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
