// /lib/auth.ts — Production authentication for OnePost AI
//
// Provides a NextAuth-equivalent API on top of:
// - bcryptjs (password hashing)
// - jose (JWT signing/verifying — works in Node, Edge, and browser)
// - team-db (user + session storage)
//
// Implements:
//   - Credentials provider (email + password)
//   - Google OAuth (env-gated; requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)
//   - Founder code (AUREA2026) admin login
//   - JWT session tokens via HttpOnly cookie
//   - Edge-runtime safe token verification (used in middleware)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

const SECRET_RAW =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  // Default is a stable, project-scoped fallback so dev works out of the box.
  // Production deploys MUST override AUTH_SECRET in Vercel env.
  "onepost-ai-dev-secret-please-override-in-production-min-32-chars";
const SECRET = new TextEncoder().encode(SECRET_RAW);

const COOKIE_NAME = "onepost_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const FOUNDER_CODE = "AUREA2026";
export const FOUNDER_EMAIL = "founder@onepost.ai";

export type Role = "owner" | "admin" | "user";

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
  subscriptionTier: string;
  authProvider: string;
  emailVerified: boolean;
}

export interface SessionPayload extends JWTPayload {
  sub: string; // auth_users.id
  userId: string; // user_management.id
  email: string;
  name: string;
  role: Role;
  subscriptionTier: string;
  authProvider: string;
}

// ─── team-db helpers (matches the inline pattern used by other services) ───
function teamDbQuery<T = any>(sql: string): T[] {
  try {
    const out = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[auth] teamDbQuery failed:", String(e).slice(0, 200));
    return [];
  }
}

function teamDbExec(sql: string): boolean {
  try {
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch (e) {
    console.error("[auth] teamDbExec failed:", String(e).slice(0, 200));
    return false;
  }
}

function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Password helpers ─────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── JWT helpers (Edge-safe) ──────────────────────────────────────
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

// ─── Cookie helpers ───────────────────────────────────────────────
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

// ─── DB: bootstrap schema (called by every auth route) ───────────
let _schemaReady = false;
export function ensureAuthSchema(): void {
  if (_schemaReady) return;
  teamDbExec(
    `CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      auth_provider TEXT DEFAULT 'credentials',
      provider_user_id TEXT,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT
    )`
  );
  teamDbExec(`CREATE INDEX IF NOT EXISTS idx_auth_users_user_id ON auth_users(user_id)`);
  teamDbExec(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`);
  _schemaReady = true;
}

// ─── DB: read helpers ────────────────────────────────────────────
export function getUserByEmail(email: string): (AuthUser & { passwordHash: string }) | null {
  ensureAuthSchema();
  const rows = teamDbQuery<any>(
    `SELECT au.id, au.user_id, au.email, au.password_hash, au.auth_provider, au.email_verified,
            um.name, um.role, um.subscription_tier
     FROM auth_users au
     LEFT JOIN user_management um ON um.id = au.user_id
     WHERE LOWER(au.email) = LOWER('${esc(email)}') LIMIT 1`
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    email: r.email,
    name: r.name || (r.email ? r.email.split("@")[0] : "User"),
    role: (r.role as Role) || "user",
    subscriptionTier: r.subscription_tier || "free",
    authProvider: r.auth_provider || "credentials",
    emailVerified: !!r.email_verified,
    passwordHash: r.password_hash,
  };
}

export function getUserById(authId: string): AuthUser | null {
  ensureAuthSchema();
  const rows = teamDbQuery<any>(
    `SELECT au.id, au.user_id, au.email, au.auth_provider, au.email_verified,
            um.name, um.role, um.subscription_tier
     FROM auth_users au
     LEFT JOIN user_management um ON um.id = au.user_id
     WHERE au.id = '${esc(authId)}' LIMIT 1`
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    email: r.email,
    name: r.name || (r.email ? r.email.split("@")[0] : "User"),
    role: (r.role as Role) || "user",
    subscriptionTier: r.subscription_tier || "free",
    authProvider: r.auth_provider || "credentials",
    emailVerified: !!r.email_verified,
  };
}

export function getUserByProvider(
  provider: string,
  providerUserId: string
): AuthUser | null {
  ensureAuthSchema();
  const rows = teamDbQuery<any>(
    `SELECT au.id, au.user_id, au.email, au.auth_provider, au.email_verified,
            um.name, um.role, um.subscription_tier
     FROM auth_users au
     LEFT JOIN user_management um ON um.id = au.user_id
     WHERE au.auth_provider = '${esc(provider)}' AND au.provider_user_id = '${esc(providerUserId)}' LIMIT 1`
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    email: r.email,
    name: r.name || (r.email ? r.email.split("@")[0] : "User"),
    role: (r.role as Role) || "user",
    subscriptionTier: r.subscription_tier || "free",
    authProvider: r.auth_provider || "credentials",
    emailVerified: !!r.email_verified,
  };
}

// ─── DB: write helpers ───────────────────────────────────────────
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: Role;
  subscriptionTier?: string;
  authProvider?: string;
  providerUserId?: string;
  emailVerified?: boolean;
}

export async function createUser(input: CreateUserInput): Promise<AuthUser> {
  ensureAuthSchema();
  const email = input.email.trim().toLowerCase();
  const existing = getUserByEmail(email);
  if (existing) {
    throw new AuthError("EMAIL_IN_USE", "An account with that email already exists.", 409);
  }

  const authId = uid("auth");
  const userId = uid("user");
  const now = nowIso();
  const displayName = (input.name?.trim() || email.split("@")[0]).replace(/'/g, "''");
  const passwordHash = await hashPassword(input.password);

  // Insert into user_management first (FK target)
  teamDbExec(
    `INSERT OR IGNORE INTO user_management (id, email, name, role, subscription_tier, created_at, last_active)
     VALUES ('${esc(authId ? userId : userId)}', '${esc(email)}', '${esc(displayName)}', '${esc(input.role || "user")}', '${esc(input.subscriptionTier || "free")}', '${esc(now)}', '${esc(now)}')`
  );

  // Insert into auth_users
  teamDbExec(
    `INSERT INTO auth_users
       (id, user_id, email, password_hash, auth_provider, provider_user_id, email_verified, created_at, updated_at, last_login_at)
     VALUES ('${esc(authId)}', '${esc(userId)}', '${esc(email)}', '${esc(passwordHash)}', '${esc(input.authProvider || "credentials")}', ${input.providerUserId ? `'${esc(input.providerUserId)}'` : "NULL"}, ${input.emailVerified ? 1 : 0}, '${esc(now)}', '${esc(now)}', '${esc(now)}')`
  );

  return {
    id: authId,
    userId,
    email,
    name: displayName,
    role: input.role || "user",
    subscriptionTier: input.subscriptionTier || "free",
    authProvider: input.authProvider || "credentials",
    emailVerified: !!input.emailVerified,
  };
}

export function updateLastLogin(authId: string): void {
  try {
    const now = nowIso();
    teamDbExec(
      `UPDATE auth_users SET last_login_at = '${esc(now)}', updated_at = '${esc(now)}' WHERE id = '${esc(authId)}'`
    );
    teamDbExec(
      `UPDATE user_management SET last_active = '${esc(now)}' WHERE id = (SELECT user_id FROM auth_users WHERE id = '${esc(authId)}')`
    );
  } catch {
    // best-effort
  }
}

export function deleteAuthUser(authId: string): void {
  try {
    teamDbExec(`DELETE FROM auth_users WHERE id = '${esc(authId)}'`);
  } catch {
    // best-effort
  }
}

// ─── AuthError ───────────────────────────────────────────────────
export class AuthError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// ─── Validation helpers ──────────────────────────────────────────
export function validateEmail(email: string): { ok: true; email: string } | { ok: false; error: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Email is required." };
  if (trimmed.length > 254) return { ok: false, error: "Email is too long." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  return { ok: true, email: trimmed };
}

export function validatePassword(password: string): { ok: true } | { ok: false; error: string } {
  if (!password) return { ok: false, error: "Password is required." };
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password.length > 200) {
    return { ok: false, error: "Password is too long." };
  }
  return { ok: true };
}

export function validateName(name: string | undefined): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (trimmed.length > 80) return trimmed.slice(0, 80);
  return trimmed;
}

// ─── Google OAuth env check ──────────────────────────────────────
export function isGoogleOAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// ─── Public user projection (never leaks password hash) ───────────
export function toPublicUser(u: AuthUser) {
  return {
    id: u.id,
    userId: u.userId,
    email: u.email,
    name: u.name,
    role: u.role,
    subscriptionTier: u.subscriptionTier,
    authProvider: u.authProvider,
    emailVerified: u.emailVerified,
  };
}
