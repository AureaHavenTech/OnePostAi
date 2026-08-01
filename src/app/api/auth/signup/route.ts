// /api/auth/signup — POST { email, password, name? } → creates account, sets session cookie
import { NextResponse } from "next/server";
import {
  createUser,
  signSessionToken,
  buildSessionCookie,
  toPublicUser,
  validateEmail,
  validatePassword,
  validateName,
  AuthError,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name } = body || {};

    const ev = validateEmail(String(email || ""));
    if (!ev.ok) {
      return NextResponse.json({ error: "INVALID_EMAIL", message: ev.error }, { status: 400 });
    }
    const pv = validatePassword(String(password || ""));
    if (!pv.ok) {
      return NextResponse.json({ error: "INVALID_PASSWORD", message: pv.error }, { status: 400 });
    }
    const cleanName = validateName(typeof name === "string" ? name : undefined);

    const user = await createUser({
      email: ev.email,
      password,
      name: cleanName || undefined,
    });

    const token = await signSessionToken({
      sub: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      authProvider: user.authProvider,
    });

    const res = NextResponse.json(
      {
        success: true,
        user: toPublicUser(user),
        message: "Account created. Welcome to OnePost AI!",
      },
      { status: 201 }
    );
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: e.status }
      );
    }
    console.error("[auth/signup] error:", e);
    return NextResponse.json(
      { error: "INTERNAL", message: "Something went wrong creating your account." },
      { status: 500 }
    );
  }
}
