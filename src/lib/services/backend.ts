// OnePost AI Backend Integration
// Imports from separate backend project or inline implementation

// Content Generation Pipeline
export async function generateContent(params: {
  brandName: string;
  prompt: string;
  platforms: string[];
  tone?: string;
}) {
  const { brandName, prompt, platforms } = params;
  
  // Mock implementation — ready for OpenAI API key
  const scripts: Record<string, string> = {
    tiktok: `🔥 ${prompt.split(" ").slice(0, 5).join(" ")}... YOU NEED TO SEE THIS! #viral #fyp`,
    instagram: `✨ The secret to ${prompt.toLowerCase().slice(0, 30)}... Save this for later! 📌`,
    youtube: `${prompt.slice(0, 50)} - Full Tutorial and Review`,
    facebook: `I had to share this with you all! ${prompt.slice(0, 60)}`,
    linkedin: `I've been researching ${prompt.slice(0, 40)}... Here's what I found.`,
  };

  const captions: Record<string, string> = {
    tiktok: `Stop scrolling. This changes everything. ${prompt.slice(0, 80)}`,
    instagram: `✨ This is your sign to try ${brandName}\n\n👇 Save for later\n💬 Comment "YES" for more`,
    youtube: `In this video, I break down ${prompt.slice(0, 50)}. Make sure to watch until the end!`,
    facebook: `📢 ATTENTION: If you care about ${prompt.slice(0, 40)}, read this 👇`,
    linkedin: `The ${brandName} approach to ${prompt.slice(0, 40)} is changing the game. Here's why.`,
  };

  const hashtags: Record<string, string[]> = {
    tiktok: ["fyp", "viral", "trending", "contentcreator", brandName.replace(/\s/g, "").toLowerCase()],
    instagram: ["explorepage", "trending", "contentcreator", "viral", "marketingtips"],
    youtube: ["tutorial", "howto", "review", brandName.replace(/\s/g, "").toLowerCase(), "2026"],
    facebook: ["trending", "mustwatch", "viralvideo", "sharethis"],
    linkedin: ["contentstrategy", "marketing", "branding", "growth", "productivity"],
  };

  const selectedPlatforms = platforms.length > 0 ? platforms : Object.keys(scripts);
  
  return {
    brandName,
    prompt,
    platformContent: selectedPlatforms.map(p => ({
      platform: p,
      script: scripts[p] || scripts.tiktok,
      caption: captions[p] || captions.tiktok,
      hashtags: hashtags[p] || hashtags.tiktok,
    })),
    suggestedFormat: selectedPlatforms.includes("tiktok") || selectedPlatforms.includes("instagram") 
      ? "9:16 vertical" : "16:9 horizontal",
    estimatedDuration: "15 seconds",
  };
}

// Scheduling Engine
export const OPTIMAL_TIMES: Record<string, string[]> = {
  tiktok: ["7:00-9:00 AM", "12:00-2:00 PM", "7:00-11:00 PM"],
  instagram: ["9:00-11:00 AM", "12:00-2:00 PM", "7:00-9:00 PM"],
  youtube: ["2:00-4:00 PM", "6:00-8:00 PM"],
  facebook: ["9:00 AM-1:00 PM", "1:00-4:00 PM"],
  linkedin: ["7:00-8:00 AM", "12:00-1:00 PM", "5:00-6:00 PM"],
  pinterest: ["8:00-11:00 PM"],
  snapchat: ["10:00 AM-12:00 PM", "7:00-10:00 PM"],
};

export function generateSchedule(params: {
  brandName: string;
  platforms: string[];
  postsPerDay: number;
  startDate: Date;
  durationDays: number;
}) {
  const { platforms, postsPerDay, startDate, durationDays } = params;
  const schedule = [];
  
  for (let day = 0; day < durationDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    
    for (let post = 0; post < postsPerDay; post++) {
      for (const platform of platforms) {
        const times = OPTIMAL_TIMES[platform] || ["12:00 PM"];
        const time = times[post % times.length];
        
        schedule.push({
          platform,
          date: date.toISOString().split("T")[0],
          time,
          brandName: params.brandName,
          optimized: true,
        });
      }
    }
  }
  
  return schedule;
}

// Conversational AI Parser
export function parseChatIntent(message: string): {
  action: "create" | "schedule" | "post" | "analyze" | "unknown";
  brandName?: string;
  platforms?: string[];
  frequency?: string;
  duration?: string;
} {
  const lower = message.toLowerCase();
  
  // Detect platforms mentioned
  const platformKeywords: Record<string, string[]> = {
    tiktok: ["tiktok", "tt"],
    instagram: ["instagram", "ig", "reels", "insta"],
    youtube: ["youtube", "yt", "shorts"],
    facebook: ["facebook", "fb"],
    linkedin: ["linkedin"],
    snapchat: ["snapchat", "snap"],
    pinterest: ["pinterest", "pin"],
  };
  
  const platforms: string[] = [];
  for (const [platform, keywords] of Object.entries(platformKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      platforms.push(platform);
    }
  }
  
  // Detect action
  let action: "create" | "schedule" | "post" | "analyze" | "unknown" = "unknown";
  if (lower.includes("create") || lower.includes("make") || lower.includes("generate") || lower.includes("write")) action = "create";
  else if (lower.includes("schedule") || lower.includes("plan") || lower.includes("calendar")) action = "schedule";
  else if (lower.includes("post") || lower.includes("publish") || lower.includes("share")) action = "post";
  else if (lower.includes("analyze") || lower.includes("research") || lower.includes("trend") || lower.includes("find")) action = "analyze";
  
  // Detect frequency
  const freqMatch = lower.match(/(\d+)\s*(?:post|time|video)s?\s*(?:per|a|every|each)\s*(day|week|month)/);
  const frequency = freqMatch ? `${freqMatch[1]} posts/${freqMatch[2]}` : undefined;
  
  // Detect brand name (words after "for" or "my")
  let brandName: string | undefined;
  const brandMatch = lower.match(/(?:for|my)\s+(\w+(?:\s+\w+)?)\s*(?:brand|company|product)?/);
  if (brandMatch) brandName = brandMatch[1];
  
  return { action, brandName, platforms, frequency };
}