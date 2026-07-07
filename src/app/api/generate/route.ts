import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/services/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, prompt, platforms, tone } = body;

    if (!brandName || !prompt) {
      return NextResponse.json({ error: "brandName and prompt are required" }, { status: 400 });
    }

    const result = await generateContent({ brandName, prompt, platforms: platforms || [], tone });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}