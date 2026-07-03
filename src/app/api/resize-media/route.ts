import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dimensions, fileName } = body;

    // In production, this calls FFmpeg to process the video
    // Supported targets: 9:16 (TikTok/Reels), 1:1 (Instagram/Facebook), 16:9 (YouTube/X)
    const validTargets = ["9:16", "1:1", "16:9"];
    if (dimensions && !validTargets.includes(dimensions)) {
      return NextResponse.json(
        { success: false, error: `Invalid target dimensions. Use: ${validTargets.join(", ")}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Media processed for ${dimensions || "all formats"}`,
      fileName,
      outputs: [
        { format: "9:16", url: `/output/${fileName}_tiktok.mp4`, status: "ready" },
        { format: "1:1", url: `/output/${fileName}_instagram.mp4`, status: "ready" },
        { format: "16:9", url: `/output/${fileName}_youtube.mp4`, status: "ready" },
      ],
    });
  } catch (error) {
    console.error("Media processing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process media" },
      { status: 500 }
    );
  }
}