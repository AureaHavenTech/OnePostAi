import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const sessionId = req.headers.get('cookie')?.split('session_id=')?.[1]?.split(';')?.[0];
  
  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      plan: session.plan,
    },
  });
}
