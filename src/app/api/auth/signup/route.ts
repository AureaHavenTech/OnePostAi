import { NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const user = await createUser(email, name, password);
    const sessionId = createSession(user.id as number);

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
