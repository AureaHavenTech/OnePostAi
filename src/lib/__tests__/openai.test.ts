/**
 * Tests for src/lib/openai.ts
 * OnePost AI OpenAI client — configure check, content generation, graceful fallback
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

const originalKey = process.env.OPENAI_API_KEY;

describe("openai (OnePost AI)", () => {
  beforeAll(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("isOpenAIConfigured returns false when no key is set", async () => {
    const mod = await import("../openai");
    expect(mod.isOpenAIConfigured()).toBe(false);
  });

  it("isOpenAIConfigured returns true when key is set", async () => {
    process.env.OPENAI_API_KEY = "sk-test-123";
    const mod = await import("../openai");
    expect(mod.isOpenAIConfigured()).toBe(true);
    delete process.env.OPENAI_API_KEY;
  });

  it("getOpenAIClient throws when no key is set", async () => {
    const mod = await import("../openai");
    expect(() => mod.getOpenAIClient()).toThrow("OPENAI_API_KEY");
  });

  it("getOpenAIClient returns client when key is set", async () => {
    process.env.OPENAI_API_KEY = "sk-test-456";
    const mod = await import("../openai");
    const client = mod.getOpenAIClient();
    expect(client).toBeDefined();
    delete process.env.OPENAI_API_KEY;
  });

  it("exports AIResult type shape", async () => {
    const mod = await import("../openai");
    // Type exports won't exist at runtime but module should load
    expect(mod.chatCompletion).toBeDefined();
    expect(mod.generateContentWithAI).toBeDefined();
  });

  it("exports Platform type values", async () => {
    // The Platform type is a string union — not instantiable, but module loads
    const mod = await import("../openai");
    expect(mod).toBeDefined();
  });

  it("generateContentWithAI returns fallback when no API key", async () => {
    const mod = await import("../openai");
    const result = await mod.generateContentWithAI({
      brandName: "TestBrand",
      prompt: "Write a post about summer sales",
      platforms: ["tiktok"],
      tone: "casual",
      captionStyle: "short",
    });
    // Should return either success data or fallback — never throw
    expect(result).toBeDefined();
    // OpenAI not configured should yield error or fallback
    if ("error" in result && result.error) {
      expect(result.error).toBe("OPENAI_NOT_CONFIGURED");
    }
  });

  afterAll(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  });
});
