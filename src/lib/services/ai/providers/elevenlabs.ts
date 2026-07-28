/**
 * OnePost AI — ElevenLabs Provider (Next.js / TypeScript)
 * Professional AI voiceovers for social media videos.
 * Supports multiple tones: upbeat, calm, luxury, casual, energetic, british, deep, narrator.
 *
 * Required env: ELEVENLABS_API_KEY
 */

import type { ProviderResult, AIVoiceover, VoiceTone } from "@/lib/services/ai/types";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

// ── Voice ID Map ─────────────────────────────────────────────────────

export const TONE_VOICES: Record<VoiceTone, { id: string; name: string; description: string }> = {
  upbeat: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Energetic, friendly, youthful American female" },
  calm: { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", description: "Calm, soothing, meditative American female" },
  luxury: { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Sophisticated, elegant, premium American female" },
  casual: { id: "MF3mGyEYCl7XYWbV9V6O", name: "Emily", description: "Casual, relatable, conversational American female" },
  energetic: { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", description: "High-energy, enthusiastic American male" },
  british: { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", description: "Warm British female, refined" },
  deep: { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", description: "Deep, authoritative American male" },
  narrator: { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "Warm, engaging documentary narrator" },
};

// ── Helpers ──────────────────────────────────────────────────────────

function missingKeyErr(): Error {
  const e = new Error("ELEVENLABS_API_KEY is not configured. Set it in .env to enable AI voiceovers.");
  (e as any).code = "MISSING_API_KEY";
  (e as any).provider = "elevenlabs";
  return e;
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw missingKeyErr();
  return key;
}

function success<T>(data: T): ProviderResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): ProviderResult<any> {
  return { success: false, error: message, code, provider: "elevenlabs" };
}

async function apiRequest(path: string, method: string, body?: unknown, isBinary = false): Promise<any> {
  const apiKey = getApiKey();
  const url = new URL(path, ELEVENLABS_BASE);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || errData.detail || `ElevenLabs HTTP ${res.status}`);
    }

    if (isBinary) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return buffer;
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public API ───────────────────────────────────────────────────────

export type SpeechOptions = {
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
};

/**
 * Generate a voiceover from text.
 */
export async function generateSpeech(
  text: string,
  tone: VoiceTone | string = "upbeat",
  options: SpeechOptions = {}
): Promise<ProviderResult<AIVoiceover>> {
  try {
    const voiceInfo = TONE_VOICES[tone as VoiceTone] || { id: tone, name: "custom", description: "" };
    const voiceId = voiceInfo.id;

    const body = {
      text,
      model_id: options.model || "eleven_multilingual_v2",
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.0,
        use_speaker_boost: options.speakerBoost !== false,
      },
    };

    const audioBuffer: Buffer = await apiRequest(`/text-to-speech/${voiceId}`, "POST", body, true);

    return success({
      audioBase64: audioBuffer.toString("base64"),
      mimeType: "audio/mpeg",
      voiceId,
      voiceName: voiceInfo.name,
      tone,
      charCount: text.length,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("ELEVENLABS_ERROR", err.message || String(err));
  }
}

/**
 * Generate a voiceover and return a data URL.
 */
export async function generateSpeechDataUrl(
  text: string,
  tone: VoiceTone | string = "upbeat",
  options: SpeechOptions = {}
): Promise<ProviderResult<AIVoiceover>> {
  const result = await generateSpeech(text, tone, options);
  if (!result.success) return result;

  return success({
    ...result.data,
    dataUrl: `data:${result.data.mimeType};base64,${result.data.audioBase64}`,
  });
}

/**
 * List available voices.
 */
export async function listVoices(): Promise<ProviderResult<any[]>> {
  try {
    const data = await apiRequest("/voices", "GET");
    const voices = (data.voices || []).map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      labels: v.labels || {},
      previewUrl: v.preview_url,
    }));
    return success(voices);
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("ELEVENLABS_ERROR", err.message || String(err));
  }
}

/**
 * Generate with a custom voice ID.
 */
export async function generateWithCustomVoice(
  text: string,
  voiceId: string,
  options: SpeechOptions = {}
): Promise<ProviderResult<AIVoiceover>> {
  try {
    const body = {
      text,
      model_id: options.model || "eleven_multilingual_v2",
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.0,
        use_speaker_boost: options.speakerBoost !== false,
      },
    };

    const audioBuffer: Buffer = await apiRequest(`/text-to-speech/${voiceId}`, "POST", body, true);

    return success({
      audioBase64: audioBuffer.toString("base64"),
      mimeType: "audio/mpeg",
      voiceId,
      voiceName: "custom",
      tone: "custom",
      charCount: text.length,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("ELEVENLABS_ERROR", err.message || String(err));
  }
}
