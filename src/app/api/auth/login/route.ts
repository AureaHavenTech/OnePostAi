// /api/auth/login — POST { email, password } → verifies, sets session cookie
import { NextResponse } from "next/server";
import {
  getUserByEmail,
  verifyPassword,
  signSessionToken,
  buildSessionCookie,
  toPublicUser,
  updateLastLogin,
  validateEmail,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body || {};

    const ev = validateEmail(String(email || ""));
    if (!ev.ok) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: ev.error },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "INVALID_PASSWORD", message: "Password is required." },
        { status: 400 }
      );
    }

    const user = getUserByEmail(ev.email);
    if (!user) {
      // Constant-ish time response: still 401 either way
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }
    if (user.authProvider !== "credentials" && !user.passwordHash) {
      return NextResponse.json(
        {
          error: "WRONG_PROVIDER",
          message: `This account uses ${user.authProvider} sign-in. Use that instead.`,
          provider: user.authProvider,
        },
        { status: 400 }
      );
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    updateLastLogin(user.id);

    const token = await signSessionToken({
      sub: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      authProvider: user.authProvider,
    });

    const res = NextResponse.json({
      success: true,
      user: toPublicUser(user),
      message: `Welcome back, ${user.name}!`,
    });
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    console.error("[auth/login] error:", e);
    return NextResponse.json(
      { error: "INTERNAL", message: "Something went wrong signing you in." },
      { status: 500 }
    );
  }
}
