/**
 * OnePost AI — Next.js Edge Middleware
 *
 * Runs on every request before it hits the app.
 * Adds security headers, rate limiting for API routes,
 * redirects legacy URLs, and gates dashboard routes by session cookie.
 *
 * Guest access: a visitor with no session cookie is no longer bounced to
 * /login. They get an anonymous `onepost_guest` cookie, can browse the whole
 * dashboard shell, and can run exactly one generation through the
 * chat/generate routes. Nothing is persisted for them — an account is
 * required for anything that writes (see the "Create free account" bar in
 * src/app/dashboard/layout.tsx). The owner console still needs a real session.
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

// ── Guest access ────────────────────────────────────────────────────────────
const GUEST_COOKIE = "onepost_guest";
const GUEST_GENERATION_COOKIE = "onepost_guest_generations";
const GUEST_GENERATION_LIMIT = 1;
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Routes a guest may call. These are the conversational + content generation
 * endpoints; the first call is free, and the counter below stops the second.
 */
const GUEST_GENERATION_ROUTES = [
  "/api/chat",
  "/api/chat/stream",
  "/api/generate",
  "/api/generate-content",
  "/api/generate-ideas",
  "/api/generate-video",
  "/api/generate-campaign",
];

function isGuestGenerationRoute(pathname: string): boolean {
  return GUEST_GENERATION_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isOwnerOnlyPath(pathname: string): boolean {
  return OWNER_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  return response;
}

function setGuestCookie(response: NextResponse): NextResponse {
  response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = withSecurityHeaders(NextResponse.next());

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
  const needsGuestCheck = isGuestGenerationRoute(pathname) && req.method === "POST";

  // Only pay for JWT verification on paths where the answer changes the outcome.
  let payload: Awaited<ReturnType<typeof verifySessionToken>> = null;
  if (needsAuth || needsGuestCheck) {
    const token = readSessionCookieFromHeader(req.headers.get("cookie"));
    payload = token ? await verifySessionToken(token) : null;
  }

  if (needsAuth) {
    if (payload) {
      if (isOwnerOnlyPath(pathname) && payload.role !== "owner") {
        return NextResponse.redirect(new URL("/dashboard", req.url), 302);
      }
      response.headers.set("x-auth-user-id", payload.userId);
      response.headers.set("x-auth-role", payload.role);
    } else {
      // No session. The owner console is the one dashboard area that still
      // needs a real signed-in owner — everything else is open to guests.
      if (isOwnerOnlyPath(pathname)) {
        const url = new URL("/login", req.url);
        url.searchParams.set("from", pathname);
        const res = NextResponse.redirect(url, 302);
        res.headers.set(
          "Set-Cookie",
          "onepost_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        );
        return res;
      }

      // Guest: mark the request so server code can tell, and remember them.
      response.headers.set("x-onepost-guest", "1");
      if (isDashboardPath(pathname) && !req.cookies.get(GUEST_COOKIE)?.value) {
        setGuestCookie(response);
      }
    }
  }

  // Guest quota — one free generation, then an account is required.
  if (needsGuestCheck && !payload) {
    const used = Number(req.cookies.get(GUEST_GENERATION_COOKIE)?.value || "0");
    if (Number.isFinite(used) && used >= GUEST_GENERATION_LIMIT) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            error:
              "Your free guest generation is used. Create a free account to keep creating.",
            code: "GUEST_LIMIT_REACHED",
            guestGenerationLimit: GUEST_GENERATION_LIMIT,
            signupUrl: "/login?signup=1",
          },
          { status: 402 }
        )
      );
    }

    response.cookies.set(GUEST_GENERATION_COOKIE, String(used + 1), {
      path: "/",
      maxAge: GUEST_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.headers.set("x-onepost-guest", "1");
    response.headers.set(
      "x-onepost-guest-generations-remaining",
      String(GUEST_GENERATION_LIMIT - (used + 1))
    );
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
