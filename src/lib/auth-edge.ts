// /lib/auth-edge.ts — Edge-runtime safe auth helpers
// No Node APIs (no child_process, no bcryptjs). Safe to import from middleware.ts
// and any Edge-runtime route handler.
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET_RAW =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "onepost-ai-dev-secret-please-override-in-production-min-32-chars";
const SECRET = new TextEncoder().encode(SECRET_RAW);

const COOKIE_NAME = "onepost_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "owner" | "admin" | "user";

export interface SessionPayload extends JWTPayload {
  sub: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
  subscriptionTier: string;
  authProvider: string;
}

export async function signSessionToken(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .setIssuer("onepost.ai")
    .setAudience("onepost.ai")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: "onepost.ai",
      audience: "onepost.ai",
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return COOKIE_NAME;
}

export function buildSessionCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildClearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function readSessionCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return rest.join("=");
  }
  return null;
}
