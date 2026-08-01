// /api/auth/founder — POST { code, email? } → verifies AUREA2026 founder code
// Logs the user in as the founder (owner role) — reuses the founder row if it exists,
// otherwise creates a `founder@onepost.ai` user on demand with the owner role.
import { NextResponse } from "next/server";
import {
  FOUNDER_CODE,
  FOUNDER_EMAIL,
  createUser,
  getUserByEmail,
  signSessionToken,
  buildSessionCookie,
  toPublicUser,
  updateLastLogin,
  hashPassword,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { execSync } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function teamDbExec(sql: string): boolean {
  try {
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
}
function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { error: "CODE_REQUIRED", message: "Founder code is required." },
        { status: 400 }
      );
    }
    if (code !== FOUNDER_CODE) {
      return NextResponse.json(
        { error: "INVALID_CODE", message: "Invalid founder access code." },
        { status: 401 }
      );
    }

    // Ensure founder account exists, create if not
    const existing = getUserByEmail(FOUNDER_EMAIL);
    let founder: AuthUser;
    if (!existing) {
      founder = await createUser({
        email: FOUNDER_EMAIL,
        password: await randomStrongPassword(),
        name: "Aurea Haven",
        role: "owner",
        subscriptionTier: "agency",
        authProvider: "credentials",
        emailVerified: true,
      });
    } else {
      founder = existing;
      if (founder.role !== "owner") {
        teamDbExec(
          `UPDATE user_management SET role = 'owner', subscription_tier = 'agency' WHERE id = '${esc(founder.userId)}'`
        );
        founder = { ...founder, role: "owner", subscriptionTier: "agency" };
      }
    }

    // Narrow: founder is definitely non-null here
    const f = founder!;

    updateLastLogin(f.id);

    const token = await signSessionToken({
      sub: f.id,
      userId: f.userId,
      email: f.email,
      name: f.name,
      role: f.role,
      subscriptionTier: f.subscriptionTier,
      authProvider: f.authProvider,
    });

    const res = NextResponse.json({
      success: true,
      user: toPublicUser({ ...f, role: f.role, subscriptionTier: f.subscriptionTier }),
      message: "Founder access granted.",
    });
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    console.error("[auth/founder] error:", e);
    return NextResponse.json(
      { error: "INTERNAL", message: "Could not verify founder code." },
      { status: 500 }
    );
  }
}

async function randomStrongPassword(): Promise<string> {
  // 24+ chars from a wide alphabet — never used, just stored.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}";
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
