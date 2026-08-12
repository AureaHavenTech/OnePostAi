// POST /api/research/shopify — Scrape a Shopify storefront
// Auth-protected. Extracts products, collections, pricing for content repurposing.

import { NextRequest, NextResponse } from "next/server";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { storeUrl } = body || {};

    if (!storeUrl) {
      return NextResponse.json({ error: "storeUrl is required" }, { status: 400 });
    }

    // Scrape the Shopify store
    let html = "";
    try {
      const res = await fetch(storeUrl, {
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "OnePostAI/1.0 Research Bot" },
      });
      html = await res.text();
    } catch {
      return NextResponse.json(
        { error: "SCRAPE_FAILED", message: "Could not reach the Shopify store. Check the URL." },
        { status: 502 }
      );
    }

    // Extract products from JSON-LD structured data
    const products: Array<{
      name: string;
      price: string;
      image: string;
      url: string;
      description: string;
    }> = [];

    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    for (const match of jsonLdMatches) {
      const jsonStr = match.replace(/<script type="application\/ld\+json">/i, "").replace(/<\/script>/i, "");
      try {
        const data = JSON.parse(jsonStr);
        if (data["@type"] === "Product" || (Array.isArray(data["@graph"]) && data["@graph"].some((i: any) => i["@type"] === "Product"))) {
          const items = data["@type"] === "Product" ? [data] : (data["@graph"] || []).filter((i: any) => i["@type"] === "Product");
          for (const item of items) {
            products.push({
              name: item.name || "Unknown Product",
              price: item.offers?.price ? `$${item.offers.price}` : "N/A",
              image: item.image?.[0] || item.image || "",
              url: item.url || item.offers?.url || "",
              description: (item.description || "").replace(/<[^>]+>/g, "").substring(0, 300),
            });
          }
        }
      } catch { /* skip invalid JSON-LD blocks */ }
    }

    // Fallback: extract product grid cards
    if (products.length === 0) {
      const cardMatches = html.match(/<a[^>]+href="\/products\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi) || [];
      for (const card of cardMatches.slice(0, 20)) {
        const urlMatch = card.match(/href="(\/products\/[^"]+)"/i);
        const nameMatch = card.match(/(?:alt|title)="([^"]+)"/i) || card.match(/>([^<]{5,100})</i);
        const priceMatch = card.match(/\$\s?\d+\.?\d*/i);
        const imgMatch = card.match(/src="([^"]+\.(jpg|png|webp)[^"]*)"/i);
        if (nameMatch?.length) {
          products.push({
            name: nameMatch[1].trim(),
            price: priceMatch?.[0] || "N/A",
            image: imgMatch?.[1] || "",
            url: urlMatch?.[1] ? new URL(urlMatch[1], storeUrl).toString() : storeUrl,
            description: "",
          });
        }
      }
    }

    // Extract collections/categories
    const collectionMatches = html.match(/href="\/collections\/([^"]+)"/gi) || [];
    const collections = [...new Set(
      collectionMatches.map((m: string) => {
        const nameMatch = m.match(/collections\/([^"]+)/i);
        return nameMatch ? nameMatch[1].replace(/-/g, " ") : "";
      }).filter(Boolean)
    )].slice(0, 10);

    // GPT-4o content suggestions
    let aiSuggestions = null;
    if (isOpenAIConfigured() && products.length > 0) {
      try {
        const productList = products.slice(0, 5).map(p => `${p.name} (${p.price})`).join(", ");
        const prompt = `Analyze these Shopify products and suggest social media content angles:

Products: ${productList}
${collections.length > 0 ? `Collections: ${collections.join(", ")}` : ""}

Return JSON:
{
  "contentAngles": ["angle1", "angle2", ...] — 3-5 content angles for social media
  "bestProductsForSocial": ["name1", ...] — top 3 products to feature
  "suggestedFormats": ["format1", ...] — best content formats (unboxing, demo, comparison, etc.)
  "hookIdeas": ["hook1", ...] — 3 viral hook ideas
}`;

        const result = await chatCompletion<Record<string, unknown>>({
        messages: [
          { role: "system", content: "You are an e-commerce content strategist. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 500,
        responseFormat: "json_object",
      });
      if (result.ok) aiSuggestions = result.data;
} catch { /* AI is optional */ }
    }

    return NextResponse.json({
      success: true,
      storeUrl,
      products: products.slice(0, 20),
      collections,
      productCount: products.length,
      aiSuggestions,
    });
  } catch (e: any) {
    console.error("[research/shopify] error:", e);
    return NextResponse.json(
      { error: "SHOPIFY_SCRAPE_FAILED", message: "Could not analyze Shopify store." },
      { status: 500 }
    );
  }
}
