/**
 * POST /api/ai/product-page — Shopify / e-commerce product page generation
 * Requires: OPENAI_API_KEY
 */

import { NextResponse } from "next/server";
import { generateProductPage } from "@/lib/services/ai/pipeline";
import { isOpenAIConfigured } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, category, targetAudience, pricePoint, keyBenefits } = body;

    if (!product || typeof product !== "string") {
      return NextResponse.json(
        { success: false, error: "product (string) is required" },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured. Set it in .env to enable product page generation.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await generateProductPage(product, {
      category: category || "",
      targetAudience: targetAudience || "",
      pricePoint: pricePoint || "",
      keyBenefits: keyBenefits || "",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      productPage: result.data,
    });
  } catch (error: any) {
    console.error("Product page generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate product page" },
      { status: 500 }
    );
  }
}
