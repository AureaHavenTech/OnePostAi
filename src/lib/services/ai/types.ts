/**
 * OnePost AI — Shared types for the unified AI pipeline.
 */

// ── Providers ──────────────────────────────────────────────────────────

export type AIProvider = "openai" | "replicate" | "elevenlabs" | "stability" | "heygen";

export type ProviderStatus = {
  provider: AIProvider;
  available: boolean;
  message: string;
};

// ── Content types ───────────────────────────────────────────────────────

export type ContentType =
  | "unboxing"
  | "voiceover"
  | "talkingHead"
  | "productDemo"
  | "storytelling"
  | "trendingHook"
  | "ugc";

export type Tone = "upbeat" | "calm" | "luxury" | "casual" | "energetic";

export type Platform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "snapchat"
  | "pinterest";

// ── Image styles ────────────────────────────────────────────────────────

export type ImageStyle = "product-shot" | "ugc-thumbnail" | "influencer" | "brand-kit";

// ── ElevenLabs tones ────────────────────────────────────────────────────

export type VoiceTone =
  | "upbeat"
  | "calm"
  | "luxury"
  | "casual"
  | "energetic"
  | "british"
  | "deep"
  | "narrator";

// ── Result wrapper ──────────────────────────────────────────────────────

export type ProviderResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; provider: string };

// ── Script generation ───────────────────────────────────────────────────

export type AIScript = {
  hook: string;
  script?: string;
  body?: string[];
  story?: string;
  features?: string[];
  cta: string;
  captions: Partial<Record<Platform, string>>;
  hashtags: string[];
  onScreenText?: string[];
  bRoll?: string[];
  musicVibe?: string;
  deliveryNotes?: string;
  ugcStyle?: string;
};

// ── Image generation ────────────────────────────────────────────────────

export type AIImage = {
  url: string;
  revisedPrompt: string;
  style: ImageStyle;
  size: string;
};

// ── Video generation ────────────────────────────────────────────────────

export type AIVideo = {
  id: string;
  status: string;
  output: string | string[];
  model: string;
};

// ── Voiceover ────────────────────────────────────────────────────────────

export type AIVoiceover = {
  audioBase64: string;
  mimeType: string;
  voiceId: string;
  voiceName: string;
  tone: string;
  charCount: number;
  dataUrl?: string;
};

// ── Product page ────────────────────────────────────────────────────────

export type AIProductPage = {
  title: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  productDescription: string;
  keyFeatures: { title: string; description: string }[];
  specifications: { label: string; value: string }[];
  pricingStrategy: {
    recommendedPrice: string;
    anchorPrice: string;
    paymentOptions: string[];
  };
  faq: { question: string; answer: string }[];
  socialProofBlocks: string[];
  urgencyTriggers: string[];
  seoKeywords: string[];
  guaranteeText: string;
};

// ── Ad campaign ─────────────────────────────────────────────────────────

export type AIAdCampaign = {
  campaignName: string;
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  adVariants: {
    angle: string;
    headline: string;
    primaryText: string;
  }[];
  audienceTargeting: {
    interests: string[];
    behaviors: string[];
    demographics: string;
  };
  budgetTips: string;
  thumbnailPrompt: string;
};

// ── Pipeline input / output ─────────────────────────────────────────────

export type GenerateContentInput = {
  product: string;
  contentType?: ContentType;
  tone?: Tone;
  duration?: number;
  platforms?: Platform[];
  brand?: { name?: string; colors?: Record<string, string>; logo?: string };
  options?: {
    includeImage?: boolean;
    includeVoice?: boolean;
    includeVideo?: boolean;
    imagePrompt?: string;
    videoPrompt?: string;
  };
};

export type GenerateContentOutput = {
  product: string;
  contentType: ContentType;
  tone: Tone;
  duration: number;
  platforms: Platform[];
  generatedAt: string;
  providers: Record<AIProvider, boolean>;
  script?: AIScript;
  scriptError?: string;
  captions?: Partial<Record<Platform, { caption: string; hashtags: string[] }>>;
  image?: AIImage;
  imageError?: string;
  voiceover?: {
    voiceName: string;
    tone: string;
    audioBase64: string;
    mimeType: string;
  };
  voiceoverError?: string;
  video?: AIVideo;
  videoError?: string;
};

// ── Avatar / AI Twin ────────────────────────────────────────────────────

export type AvatarSource = "photos" | "ai-generated" | "preset";

export type AvatarGender = "male" | "female" | "neutral";

export type AvatarInput = {
  /** Source type: upload photos, generate from scratch, or use a preset */
  source: AvatarSource;
  /** Photo URLs (3-5) for digital twin creation (when source = "photos") */
  photoUrls?: string[];
  /** Description to generate an AI model face (when source = "ai-generated") */
  appearance?: string;
  /** Gender hint for AI-generated models */
  gender?: AvatarGender;
  /** Preset avatar ID (when source = "preset") */
  presetId?: string;
  /** The script the avatar should speak */
  script: string;
  /** Voice tone for the avatar's speech */
  voiceTone?: VoiceTone;
  /** Whether to include natural gestures (default: true) */
  gestures?: boolean;
  /** Video background description */
  background?: string;
  /** Provider preference: "heygen" | "replicate" | "auto" */
  provider?: "heygen" | "replicate" | "auto";
};

export type AIAvatar = {
  id: string;
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  provider: string;
  model: string;
  source: AvatarSource;
  metadata?: {
    faceCount?: number;
    gestureModel?: string;
    voiceModel?: string;
  };
};

// ── Chat ────────────────────────────────────────────────────────────────

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatResult = {
  reply: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};
