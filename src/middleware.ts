/**
 * OnePost AI — Next.js Edge Middleware
 *
 * Runs on every request before it hits the app.
 * Adds security headers, rate limiting for API routes,
 * redirects legacy URLs, and gates dashboard routes by session cookie.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore)) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 300_000);

const PROTECTED_PREFIXES = ["/dashboard"];
const OWNER_ONLY_PREFIXES = ["/dashboard/owner"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );

  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";
    const key = `${ip}:api`;
    if (!checkRateLimit(key, 1000, 60_000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (needsAuth) {
    const cookieHeader = req.headers.get("cookie");
    const token = readSessionCookieFromHeader(cookieHeader);
    const payload = token ? await verifySessionToken(token) : null;

    if (!payload) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      const res = NextResponse.redirect(url, 302);
      res.headers.set(
        "Set-Cookie",
        "onepost_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
      );
      return res;
    }

    const needsOwner = OWNER_ONLY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (needsOwner && payload.role !== "owner") {
      return NextResponse.redirect(new URL("/dashboard", req.url), 302);
    }

    response.headers.set("x-auth-user-id", payload.userId);
    response.headers.set("x-auth-role", payload.role);
  }

  if (pathname === "/dashboard/schedule") {
    return NextResponse.redirect(new URL("/dashboard/calendar", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|woff2?|ttf)).*)",
  ],
};
