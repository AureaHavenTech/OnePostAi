/**
 * OnePost AI — Product Scraper Provider (Next.js / TypeScript)
 *
 * Pastes any product URL → extracts product info → generates optimized product page.
 * Beats Xyla (Shopify-only) by working with any e-commerce platform.
 *
 * Pipeline: fetch() → HTML parsing → GPT-4o extraction → product page generation.
 * Required: OPENAI_API_KEY
 */

import { isOpenAIConfigured, getOpenAIClient } from "@/lib/openai";
import type { ProviderResult, AIProductPage } from "@/lib/services/ai/types";
import * as openai from "@/lib/services/ai/providers/openai";

// ── Types ────────────────────────────────────────────────────────────

export type StorePlatform =
  | "shopify"
  | "amazon"
  | "etsy"
  | "woocommerce"
  | "bigcommerce"
  | "squarespace"
  | "custom"
  | "unknown";

export type ScrapedProduct = {
  url: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  images: string[];
  category: string;
  brand: string;
  features: string[];
  variants: { name: string; price: string; available: boolean }[];
  rating: string;
  reviewCount: string;
  inStock: boolean;
  storeName: string;
  storePlatform: StorePlatform;
  rawMetadata: Record<string, string>;
};

export type ScrapeResult = {
  product: ScrapedProduct;
  page: AIProductPage;
  affiliateCopy: {
    shortDescription: string;
    socialCaptions: Record<string, string>;
    hashtags: string[];
    reviewSnippet: string;
  };
};

// ── Helpers ──────────────────────────────────────────────────────────

function missingKeyErr(): Error {
  const e = new Error("OPENAI_API_KEY not configured. Set it in .env to enable product scraping.");
  (e as any).code = "MISSING_API_KEY";
  (e as any).provider = "scraper";
  return e;
}

function success<T>(data: T): ProviderResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): ProviderResult<any> {
  return { success: false, error: message, code, provider: "scraper" };
}

// ── HTML Fetch & Parse ───────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OnePostAI/1.0 ProductScraper (+https://onepostai.com)",
        Accept: "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractMetadata(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  for (const m of Array.from(html.matchAll(/<meta\s+property="og:(\w+)"\s+content="([^"]*)"/gi))) {
    meta[`og:${m[1]}`] = m[2];
  }
  for (const m of Array.from(html.matchAll(/<meta\s+name="([^"]+)"\s+content="([^"]*)"/gi))) {
    meta[m[1]] = m[2];
  }
  for (const m of Array.from(html.matchAll(/<meta\s+name="twitter:(\w+)"\s+content="([^"]*)"/gi))) {
    meta[`twitter:${m[1]}`] = m[2];
  }
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  return meta;
}

function extractJsonLd(html: string): any {
  for (const m of Array.from(html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi))) {
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"] === "Product") return data;
      if (Array.isArray(data["@graph"])) {
        const product = data["@graph"].find((e: any) => e["@type"] === "Product");
        if (product) return product;
      }
    } catch { /* skip */ }
  }
  return null;
}

function extractVisibleText(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text.substring(0, 5000);
}

function detectPlatform(html: string): StorePlatform {
  const h = html.toLowerCase();
  if (h.includes("myshopify") || h.includes("cdn.shopify")) return "shopify";
  if (h.includes("amazon") || h.includes("a-content")) return "amazon";
  if (h.includes("etsy.com") || h.includes("etsy-static")) return "etsy";
  if (h.includes("woocommerce") || h.includes("wp-content/plugins/woocommerce")) return "woocommerce";
  if (h.includes("bigcommerce") || h.includes("cdn.bigcommerce")) return "bigcommerce";
  if (h.includes("squarespace") || h.includes("static1.squarespace")) return "squarespace";
  if (h.includes("product") || h.includes("add-to-cart")) return "custom";
  return "unknown";
}

// ── AI Extraction ────────────────────────────────────────────────────

async function aiExtract(
  url: string,
  metadata: Record<string, string>,
  text: string,
  jsonLd: any
): Promise<ScrapedProduct> {
  if (!isOpenAIConfigured()) throw missingKeyErr();
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You extract structured product data from webpage content. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `Extract product info from:
URL: ${url}

METADATA: ${JSON.stringify(metadata, null, 2)}
JSON-LD: ${JSON.stringify(jsonLd || {}, null, 2)}
PAGE TEXT: ${text}

Return JSON: {"title":"...","description":"...","price":"...","currency":"USD","images":["..."],"category":"...","brand":"...","features":["..."],"variants":[{"name":"...","price":"...","available":true}],"rating":"...","reviewCount":"...","inStock":true,"storeName":"...","storePlatform":"shopify|amazon|etsy|woocommerce|bigcommerce|squarespace|custom|unknown"}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
  return {
    url,
    title: parsed.title || metadata["og:title"] || metadata.title || "",
    description: parsed.description || metadata["og:description"] || "",
    price: parsed.price || "",
    currency: parsed.currency || "USD",
    images: parsed.images || (metadata["og:image"] ? [metadata["og:image"]] : []),
    category: parsed.category || "",
    brand: parsed.brand || metadata["og:site_name"] || "",
    features: parsed.features || [],
    variants: parsed.variants || [],
    rating: parsed.rating || "",
    reviewCount: parsed.reviewCount || "",
    inStock: parsed.inStock !== false,
    storeName: parsed.storeName || "",
    storePlatform: parsed.storePlatform || detectPlatform(""),
    rawMetadata: metadata,
  };
}

// ── Fallback: AI-only extraction (when URL can't be fetched) ─────────

async function aiFallbackExtract(url: string): Promise<ScrapedProduct> {
  if (!isOpenAIConfigured()) throw missingKeyErr();
  const client = getOpenAIClient();

  const hostname = (() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; } })();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You infer product information from URLs. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `This URL could not be fetched: ${url}

Based on the URL structure and domain "${hostname}", extract product info. If the URL path contains clues about the product, use them:

Return JSON: {"title":"...","description":"...","price":"","currency":"USD","images":[],"category":"...","brand":"${hostname}","features":[],"variants":[],"rating":"","reviewCount":"","inStock":true,"storeName":"${hostname}","storePlatform":"unknown","inferredFromUrl":true}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
  return {
    url,
    title: parsed.title || url.split("/").pop() || "Product",
    description: parsed.description || "",
    price: parsed.price || "",
    currency: "USD",
    images: parsed.images || [],
    category: parsed.category || "",
    brand: parsed.brand || hostname,
    features: parsed.features || [],
    variants: parsed.variants || [],
    rating: parsed.rating || "",
    reviewCount: parsed.reviewCount || "",
    inStock: true,
    storeName: parsed.storeName || hostname,
    storePlatform: "unknown",
    rawMetadata: { inferredFromUrl: "true" },
  };
}

// ── Public API ────────────────────────────────────────────────────────

export async function scrapeAndGenerate(
  url: string,
  options: {
    targetAudience?: string;
    includeAffiliateCopy?: boolean;
  } = {}
): Promise<ProviderResult<ScrapeResult>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();

    // Step 1: Fetch + extract
    let scraped: ScrapedProduct;
    try {
      const html = await fetchHtml(url);
      const metadata = extractMetadata(html);
      const text = extractVisibleText(html);
      const jsonLd = extractJsonLd(html);
      // Supplement platform detection from HTML
      const platform = detectPlatform(html);

      scraped = await aiExtract(url, metadata, text, jsonLd);
      if (scraped.storePlatform === "unknown") scraped.storePlatform = platform;
    } catch (fetchErr: any) {
      console.warn("[Scraper] Fetch failed, using AI fallback:", fetchErr.message);
      scraped = await aiFallbackExtract(url);
    }

    // Step 2: Generate product page
    const pageResult = await openai.generateProductPage(scraped.title, {
      category: scraped.category,
      targetAudience: options.targetAudience || "",
      pricePoint: scraped.price,
      keyBenefits: scraped.features.join(", "),
    });

    if (!pageResult.success) {
      return failure("PAGE_FAILED", `Product page generation failed: ${pageResult.error}`);
    }

    // Step 3: Affiliate copy (optional)
    let affiliateCopy: ScrapeResult["affiliateCopy"] = {
      shortDescription: scraped.description.substring(0, 200),
      socialCaptions: {},
      hashtags: [],
      reviewSnippet: "",
    };

    if (options.includeAffiliateCopy !== false && scraped.title) {
      const client = getOpenAIClient();
      const copyRes = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You write social copy for affiliate marketing. Return JSON." },
          {
            role: "user",
            content: `Product: ${scraped.title}\nDesc: ${scraped.description.substring(0, 300)}\nFeatures: ${scraped.features.join(", ")}\nPrice: ${scraped.price}\n\nReturn JSON: {"shortDescription":"...","socialCaptions":{"tiktok":"...","instagram":"...","facebook":"..."},"hashtags":["#tag1",...8-12 tags],"reviewSnippet":"..."}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
        response_format: { type: "json_object" },
      });
      const copyData = JSON.parse(copyRes.choices[0]?.message?.content || "{}");
      affiliateCopy = {
        shortDescription: copyData.shortDescription || scraped.description.substring(0, 200),
        socialCaptions: copyData.socialCaptions || {},
        hashtags: copyData.hashtags || [],
        reviewSnippet: copyData.reviewSnippet || "",
      };
    }

    return success<ScrapeResult>({ product: scraped, page: pageResult.data, affiliateCopy });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    console.error("[Scraper]", err);
    return failure("SCRAPE_ERROR", err.message || String(err));
  }
}

export async function scrapeOnly(url: string): Promise<ProviderResult<ScrapedProduct>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const html = await fetchHtml(url);
    const metadata = extractMetadata(html);
    const text = extractVisibleText(html);
    const jsonLd = extractJsonLd(html);
    const product = await aiExtract(url, metadata, text, jsonLd);
    return success(product);
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    try {
      const product = await aiFallbackExtract(url);
      return success(product);
    } catch (fallbackErr: any) {
      return failure("SCRAPE_ERROR", fallbackErr.message || String(fallbackErr));
    }
  }
}
