import { NextRequest, NextResponse } from "next/server";
import { generateThreeLiner, THREE_LINER_TEMPLATES } from "@/lib/services/three-liner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = generateThreeLiner(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ templates: Object.keys(THREE_LINER_TEMPLATES), details: THREE_LINER_TEMPLATES });
}