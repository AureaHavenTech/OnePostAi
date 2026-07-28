/**
 * OnePost AI — Replicate Provider (Next.js / TypeScript)
 * AI video generation via Replicate models (Stable Video Diffusion, AnimateDiff, ZeroScope).
 * Also supports image-to-video and Wav2Lip lip-sync.
 *
 * Required env: REPLICATE_API_TOKEN
 */

import type { ProviderResult, AIVideo } from "@/lib/services/ai/types";

const REPLICATE_BASE = "https://api.replicate.com/v1";

// ── Helpers ──────────────────────────────────────────────────────────

function missingKeyErr(): Error {
  const e = new Error("REPLICATE_API_TOKEN is not configured. Set it in .env to enable AI video generation.");
  (e as any).code = "MISSING_API_KEY";
  (e as any).provider = "replicate";
  return e;
}

function getToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw missingKeyErr();
  return token;
}

function success<T>(data: T): ProviderResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): ProviderResult<any> {
  return { success: false, error: message, code, provider: "replicate" };
}

async function replicateRequest(method: string, path: string, body?: unknown): Promise<any> {
  const token = getToken();
  const url = new URL(path, REPLICATE_BASE);
  const payload = body ? JSON.stringify(body) : null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: payload,
      signal: controller.signal,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || `Replicate HTTP ${res.status}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function pollPrediction(predictionId: string, maxWaitMs: number = 300000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const prediction = await replicateRequest("GET", `/predictions/${predictionId}`);
    if (prediction.status === "succeeded") return prediction;
    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Replicate prediction ${prediction.status}: ${JSON.stringify(prediction.error)}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Replicate prediction timed out");
}

// ── Model Constants ──────────────────────────────────────────────────

const MODELS = {
  "image-to-video": {
    owner: "stability-ai",
    name: "stable-video-diffusion",
    version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
  },
  "text-to-video": {
    owner: "lucataco",
    name: "animate-diff",
    version: "beec9f479a7fbc3ec545309cef103129660af5ba8c2b2a93afa8617ae24aec64",
  },
  zeroscope: {
    owner: "anotherjesse",
    name: "zeroscope-v2-xl",
    version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
  },
  wav2lip: {
    owner: "devxpy",
    name: "cog-wav2lip",
    version: "8ded65d04c70fac248e50c1daed3eabcedee755eaaaf9cd346e71b8e5b1f5e6e",
  },
};

export { MODELS };

// ── Public API ───────────────────────────────────────────────────────

export type TextToVideoOptions = {
  model?: string;
  numFrames?: number;
  fps?: number;
  width?: number;
  height?: number;
  numSteps?: number;
  guidance?: number;
};

/**
 * Generate a video from a text prompt.
 */
export async function textToVideo(
  prompt: string,
  options: TextToVideoOptions = {}
): Promise<ProviderResult<AIVideo>> {
  try {
    const modelKey = options.model || "zeroscope";
    const model = MODELS[modelKey as keyof typeof MODELS];
    if (!model) {
      return failure("BAD_REQUEST", `Unknown Replicate model: ${modelKey}. Valid: ${Object.keys(MODELS).join(", ")}`);
    }

    const input = {
      prompt,
      num_frames: options.numFrames || 16,
      fps: options.fps || 8,
      width: options.width || 576,
      height: options.height || 320,
      num_inference_steps: options.numSteps || 25,
      guidance_scale: options.guidance || 9,
    };

    const prediction = await replicateRequest("POST", "/predictions", {
      version: model.version,
      input,
    });

    const result = await pollPrediction(prediction.id);
    return success({
      id: result.id,
      status: result.status,
      output: result.output,
      model: `${model.owner}/${model.name}`,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("REPLICATE_ERROR", err.message || String(err));
  }
}

export type ImageToVideoOptions = {
  fps?: number;
  motionBucketId?: number;
  seed?: number;
  videoLength?: string;
};

/**
 * Generate a video from an image URL (product shots → motion).
 */
export async function imageToVideo(
  imageUrl: string,
  options: ImageToVideoOptions = {}
): Promise<ProviderResult<AIVideo>> {
  try {
    const model = MODELS["image-to-video"];

    const input = {
      input_image: imageUrl,
      video_length: options.videoLength || "14_frames_with_svd",
      sizing_strategy: "maintain_aspect_ratio",
      frames_per_second: options.fps || 6,
      motion_bucket_id: options.motionBucketId || 127,
      decode_chunk_size: 8,
      seed: options.seed || Math.floor(Math.random() * 1000000),
    };

    const prediction = await replicateRequest("POST", "/predictions", {
      version: model.version,
      input,
    });

    const result = await pollPrediction(prediction.id);
    return success({
      id: result.id,
      status: result.status,
      output: result.output,
      model: `${model.owner}/${model.name}`,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("REPLICATE_ERROR", err.message || String(err));
  }
}

export type LipSyncOptions = {
  pads?: string;
  smooth?: boolean;
};

/**
 * Generate a lip-synced video from a face video + audio URL.
 */
export async function lipSync(
  faceVideoUrl: string,
  audioUrl: string,
  options: LipSyncOptions = {}
): Promise<ProviderResult<AIVideo>> {
  try {
    const model = MODELS["wav2lip"];

    const input = {
      face: faceVideoUrl,
      audio: audioUrl,
      pads: options.pads || "0 10 0 0",
      smooth: options.smooth !== false,
    };

    const prediction = await replicateRequest("POST", "/predictions", {
      version: model.version,
      input,
    });

    const result = await pollPrediction(prediction.id);
    return success({
      id: result.id,
      status: result.status,
      output: result.output,
      model: `${model.owner}/${model.name}`,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("REPLICATE_ERROR", err.message || String(err));
  }
}

/**
 * Get an existing prediction by ID.
 */
export async function getPrediction(id: string): Promise<any> {
  return replicateRequest("GET", `/predictions/${id}`);
}
