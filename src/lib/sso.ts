/**
 * Shared SSO — Cross-app single sign-on between OnePost AI and Axel AI.
 *
 * SERVER-ONLY file (uses Node.js crypto). Client components should import
 * from @/lib/sso-config instead.
 *
 * Uses HMAC-signed exchange tokens. Both apps share the same secret
 * (SSO_SHARED_SECRET env var, or a hardcoded fallback).
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

import { createHmac } from "crypto";
import { SSO_APPS, getSisterApps, type AppKey, type SSOPayload } from "@/lib/sso-config";

// Re-export client-safe types and functions
export { SSO_APPS, getSisterApps };
export type { AppKey, SSOPayload };

// ---------------------------------------------------------------------------
// Shared secret — MUST be identical across both apps
// ---------------------------------------------------------------------------
function getSharedSecret(): string {
  return (
    process.env.SSO_SHARED_SECRET ||
    "aura-haven-tech-sso-secret-2026"
  );
}

// ---------------------------------------------------------------------------
// Token lifetime: 60 seconds — one-time use, short-lived
// ---------------------------------------------------------------------------
const TOKEN_TTL_MS = 60_000;

// Simple in-memory nonce store to prevent replay
const usedNonces = new Set<string>();
const NONCE_MAX = 500;

// ---------------------------------------------------------------------------
// Generate an SSO exchange token
// ---------------------------------------------------------------------------
export function generateSSOToken(
  payload: Omit<SSOPayload, "iat" | "exp">
): { token: string; payload: SSOPayload } {
  const full: SSOPayload = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const data = JSON.stringify(full);
  const encoded = Buffer.from(data).toString("base64url");
  const signature = createHmac("sha256", getSharedSecret())
    .update(encoded)
    .digest("base64url");

  const token = `${encoded}.${signature}`;
  return { token, payload: full };
}

// ---------------------------------------------------------------------------
// Verify and decode an SSO exchange token
// ---------------------------------------------------------------------------
export function verifySSOToken(
  token: string
): { valid: true; payload: SSOPayload } | { valid: false; error: string } {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx < 0) return { valid: false, error: "Invalid token format" };

    const encoded = token.slice(0, dotIdx);
    const signature = token.slice(dotIdx + 1);

    // Verify signature
    const expectedSig = createHmac("sha256", getSharedSecret())
      .update(encoded)
      .digest("base64url");

    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid signature" };
    }

    // Decode payload
    const data = Buffer.from(encoded, "base64url").toString("utf8");
    const payload: SSOPayload = JSON.parse(data);

    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: "Token expired" };
    }

    // Check replay — use token hash as nonce
    const nonce = signature.slice(0, 32);
    if (usedNonces.has(nonce)) {
      return { valid: false, error: "Token already used" };
    }
    usedNonces.add(nonce);
    if (usedNonces.size > NONCE_MAX) {
      const entries = Array.from(usedNonces);
      for (let i = 0; i < entries.length - NONCE_MAX + 100; i++) {
        usedNonces.delete(entries[i]);
      }
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || "Token verification failed" };
  }
}
