import { NextResponse } from "next/server";
import { getOpenAI, hasApiKey } from "@/lib/openai-client";

const SYSTEM_PROMPT = `You are an expert social media content strategist. Generate viral post ideas for a specific niche.

Return a JSON object with:
- "ideas": Array of objects, each with:
  - "title": The post title/hook (1 sentence, attention-grabbing)
  - "hook": The hook strategy (1 sentence describing why it works)
  - "format": Suggested video format
  - "viralScore": Number 1-100 estimating viral potential
  - "platforms": Array of best platforms for this idea
- "trendingFormats": Array of 3 trending content formats for this niche
- "bestPlatform": The single best platform for this niche right now (1 sentence)

Return ONLY valid JSON.`;

const FALLBACK_IDEAS = [
  { title: `"Why I stopped using [competitor] and switched to [niche]"`, hook: "Honest story that builds trust", format: "Talking head / testimonial", viralScore: 92, platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"] },
  { title: `"3 things nobody tells you about [niche]"`, hook: "Curiosity gap — must watch to find out", format: "Listicle with text overlays", viralScore: 88, platforms: ["TikTok", "Instagram Reel", "YouTube Shorts", "LinkedIn"] },
  { title: `"The $0 [niche] hack that changed everything"`, hook: "Value-driven — saves money/time", format: "Before/after demonstration", viralScore: 95, platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"] },
  { title: `"I tried [niche] for 30 days — here's what happened"`, hook: "Social proof through experience", format: "Progress journey / montage", viralScore: 85, platforms: ["YouTube", "TikTok", "Instagram"] },
  { title: `"Stop doing [common mistake] in [niche] — do this instead"`, hook: "Corrects a common pain point", format: "Educational with graphics", viralScore: 90, platforms: ["TikTok", "Instagram", "LinkedIn", "YouTube"] },
  { title: `"How I make money with [niche] — full breakdown"`, hook: "Money talk drives engagement", format: "Screen recording + voiceover", viralScore: 87, platforms: ["YouTube", "LinkedIn", "TikTok"] },
  { title: `"The truth about [niche] that nobody talks about"`, hook: "Controversial / myth-busting", format: "Storytelling with B-roll", viralScore: 91, platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"] },
  { title: `"5 ways [niche] makes my life easier (link in bio)"`, hook: "Listicle + call to action", format: "Quick cuts with text overlays", viralScore: 83, platforms: ["Instagram Reel", "TikTok", "YouTube Shorts"] },
  { title: `"Day in the life using [niche] — real results"`, hook: "Behind-the-scenes authenticity", format: "Vlog style with timestamps", viralScore: 86, platforms: ["YouTube", "TikTok", "Instagram"] },
  { title: `"[Niche] for beginners: start here (save this post)"`, hook: "Educational + saveable content", format: "Tutorial screencast", viralScore: 89, platforms: ["YouTube", "LinkedIn", "Instagram", "TikTok"] },
];

function buildFallback(niche: string, count: number) {
  const ideas = FALLBACK_IDEAS.map(i => ({
    ...i,
    title: i.title.replace(/\[niche\]/gi, niche || "your niche"),
  }));
  return {
    success: true,
    niche,
    aiGenerated: false,
    ideas: ideas.slice(0, count),
    trendingFormats: ["Talking head reviews", "Product demonstrations", "Educational listicles"],
    bestPlatform: "Instagram Reel (highest viral potential for this niche)",
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  let niche = "";
  let platform = "";
  let count = 10;

  try {
    const body = await req.json();
    niche = body.niche || "";
    platform = body.platform || "";
    count = body.count || 10;

    if (!hasApiKey()) {
      console.warn("[generate-ideas] No API key — using fallback");
      return NextResponse.json(buildFallback(niche, count));
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Niche: "${niche || "general content creation"}"\nPlatform focus: ${platform || "all"}\nNumber of ideas: ${count}\n\nGenerate viral post ideas tailored to this niche.` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.9,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      niche,
      aiGenerated: true,
      ideas: (parsed.ideas || []).slice(0, count),
      trendingFormats: parsed.trendingFormats || ["Talking head reviews", "Product demonstrations", "Educational listicles"],
      bestPlatform: parsed.bestPlatform || "Instagram Reel",
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[generate-ideas] Error:", error?.message || error);
    return NextResponse.json(buildFallback(niche, count));
  }
}
