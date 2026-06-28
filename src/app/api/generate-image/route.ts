import { NextRequest } from "next/server";
import { openai } from "@/lib/openai-client";

export async function POST(request: NextRequest) {
  try {
    const { prompt, productDescription, brand, style } = await request.json();

    if (!prompt && !productDescription) {
      return new Response(JSON.stringify({ error: "Prompt or product description required" }), { status: 400 });
    }

    const imagePrompt = productDescription 
      ? `Professional product advertisement for ${brand || "Aura Haven"}. Product: ${productDescription}. Style: ${style || "modern luxury, premium"}, clean background, professional lighting, e-commerce ready. No text, no watermarks.`
      : prompt;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    });

    const imageData = response.data?.[0];
    if (!imageData?.url) {
      return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500 });
    }
    return new Response(JSON.stringify({
      url: imageData.url,
      revisedPrompt: imageData.revised_prompt || null
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}