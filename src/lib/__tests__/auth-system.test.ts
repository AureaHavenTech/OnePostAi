/**
 * Tests for src/lib/shared/auth-system.ts
 * OnePost AI auth — access codes, validation, redirects
 */

import { describe, it, expect } from "vitest";

describe("auth-system", () => {
  it("ACCESS_CODES contains FOUNDER code", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.ACCESS_CODES.FOUNDER).toBe("AUREA2026");
  });

  it("ACCESS_CODES CEO matches FOUNDER", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.ACCESS_CODES.CEO).toBe(mod.ACCESS_CODES.FOUNDER);
  });

  it("AUTH_CONFIG has trialDays of 3", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.AUTH_CONFIG.trialDays).toBe(3);
  });

  it("AUTH_CONFIG has valid Stripe URLs", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.AUTH_CONFIG.stripeMonthlyUrl).toMatch(/^https:\/\/buy\.stripe\.com\//);
    expect(mod.AUTH_CONFIG.stripeLifetimeUrl).toMatch(/^https:\/\/buy\.stripe\.com\//);
  });

  it("validateAccessCode returns true for valid codes", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.validateAccessCode("AUREA2026")).toBe(true);
    expect(mod.validateAccessCode("aurea2026")).toBe(true);
  });

  it("validateAccessCode returns false for invalid codes", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.validateAccessCode("INVALID")).toBe(false);
    expect(mod.validateAccessCode("")).toBe(false);
    expect(mod.validateAccessCode("random")).toBe(false);
  });

  it("getRedirectForCode returns owner dashboard for founder code", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.getRedirectForCode("AUREA2026")).toBe("/dashboard/owner");
    expect(mod.getRedirectForCode("aurea2026")).toBe("/dashboard/owner");
  });

  it("getRedirectForCode returns regular dashboard for unknown codes", async () => {
    const mod = await import("../shared/auth-system");
    expect(mod.getRedirectForCode("anything")).toBe("/dashboard");
  });
});
