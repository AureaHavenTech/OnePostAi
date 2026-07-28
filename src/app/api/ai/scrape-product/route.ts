/**
 * POST /api/ai/scrape-product — Scrape any product URL + generate optimized product page
 *
 * Accepts any e-commerce URL (Shopify, Amazon, Etsy, WooCommerce, etc.)
 * Extracts product info and generates a complete product page.
 * Beats Xyla by working with ALL platforms, not just Shopify.
 *
 * Requires: OPENAI_API_KEY
 */

import { NextResponse } from "next/server";
import { scrapeAndGenerate, scrapeOnly } from "@/lib/services/ai/providers/scraper";
import { isOpenAIConfigured } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, mode, targetAudience, includeAffiliateCopy } = body;

    // ── Validation ──────────────────────────────────────────────

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "url (string) is required — paste any product URL" },
        { status: 400 }
      );
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { success: false, error: "URL must start with http:// or https://" },
          { status: 400 }
        );
      }
      if (url.length > 2000) {
        return NextResponse.json(
          { success: false, error: "URL is too long (max 2000 characters)" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format. Provide a complete URL like https://example.com/product" },
        { status: 400 }
      );
    }

    // ── Provider check ──────────────────────────────────────────

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured. Set it in .env to enable product scraping.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    // ── Scrape / Generate ───────────────────────────────────────

    const requestedMode = mode || "full";

    if (requestedMode === "scrape-only") {
      const result = await scrapeOnly(url);

      if (!result.success) {
        const status = result.code === "MISSING_API_KEY" ? 503 : 500;
        return NextResponse.json(result, { status });
      }

      return NextResponse.json({
        success: true,
        product: result.data,
        message: `Product data extracted from ${result.data.storePlatform} store: "${result.data.title}"`,
      });
    }

    // Full mode: scrape + generate page + affiliate copy
    const result = await scrapeAndGenerate(url, {
      targetAudience: targetAudience || "",
      includeAffiliateCopy: includeAffiliateCopy !== false,
    });

    if (!result.success) {
      const status = result.code === "MISSING_API_KEY" ? 503 : 500;
      return NextResponse.json(result, { status });
    }

    const { product, page, affiliateCopy } = result.data;

    return NextResponse.json({
      success: true,
      data: {
        product,
        productPage: page,
        affiliateCopy,
      },
      message: `Scraped "${product.title}" from ${product.storePlatform} and generated a complete product page.`,
      metadata: {
        url,
        platform: product.storePlatform,
        extractedFields: {
          title: !!product.title,
          description: !!product.description,
          price: !!product.price,
          images: product.images.length,
          features: product.features.length,
          variants: product.variants.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Scrape-product error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to scrape product" },
      { status: 500 }
    );
  }
}
