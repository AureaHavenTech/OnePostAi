// POST /api/research/scrape — Scrape any URL for content
// Auth-protected. Uses cheerio for HTML parsing + GPT-4o for analysis.

import { NextRequest, NextResponse } from "next/server";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

async function scrapeUrl(url: string): Promise<{
  title: string;
  description: string;
  images: string[];
  price: string | null;
  textContent: string;
  metaTags: Record<string, string>;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "OnePostAI/1.0 Research Bot" },
    });
    const html = await res.text();
    clearTimeout(timeout);

    // Simple regex-based extraction (no cheerio dependency needed for basic scraping)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);

    // Extract images
    const imgMatches = html.match(/<img[^>]+src="([^"]+)"/gi) || [];
    const images = imgMatches.slice(0, 10).map((img: string) => {
      const srcMatch = img.match(/src="([^"]+)"/i);
      return srcMatch ? srcMatch[1] : "";
    }).filter(Boolean);

    // Extract price patterns
    const priceMatch = html.match(/\$\s?\d+\.?\d*/i);
    const price = priceMatch ? priceMatch[0] : null;

    // Strip HTML tags for text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000);

    // Extract all meta tags
    const metaTags: Record<string, string> = {};
    const metaMatches = html.match(/<meta[^>]+>/gi) || [];
    for (const tag of metaMatches) {
      const nameMatch = tag.match(/name="([^"]*)"/i) || tag.match(/property="([^"]*)"/i);
      const contentMatch = tag.match(/content="([^"]*)"/i);
      if (nameMatch && contentMatch) {
        metaTags[nameMatch[1]] = contentMatch[1];
      }
    }

    return {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || new URL(url).hostname,
      description: descMatch?.[1] || ogDescMatch?.[1] || "",
      images,
      price,
      textContent,
      metaTags,
    };
  } catch {
    clearTimeout(timeout);
    throw new Error("Failed to scrape URL — site may be blocking requests or is unreachable.");
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url, type = "general" } = body || {};

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const scraped = await scrapeUrl(url);

    // Use GPT-4o to analyze and summarize the content
    let aiAnalysis = null;
    if (isOpenAIConfigured()) {
      try {
        const prompt = `Analyze this scraped web content and provide insights:

URL: ${url}
Type: ${type}
Title: ${scraped.title}
Description: ${scraped.description}
Text Content (first 5000 chars): ${scraped.textContent}

Return a JSON object with:
- summary: 2-3 sentence summary of the content
- contentType: what kind of page this is (product, article, landing-page, etc.)
- keyPoints: array of 3-5 key takeaways
- socialAngle: one idea for how this content could be repurposed for social media
- repurposeAs: suggested social media format (reel, carousel, story, post)`;

        const result = await chatCompletion([
          { role: "system", content: "You analyze web content and return structured JSON insights." },
          { role: "user", content: prompt },
        ], { temperature: 0.5, maxTokens: 500 });

        aiAnalysis = JSON.parse(result.content || "{}");
      } catch {
        // AI analysis is optional — don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      url,
      scraped: {
        title: scraped.title,
        description: scraped.description,
        images: scraped.images.slice(0, 5),
        price: scraped.price,
        textPreview: scraped.textContent.substring(0, 1000),
        metaTags: scraped.metaTags,
      },
      aiAnalysis,
    });
  } catch (e: any) {
    console.error("[research/scrape] error:", e);
    return NextResponse.json(
      { error: "SCRAPE_FAILED", message: e.message || "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
