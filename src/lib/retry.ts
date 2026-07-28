/**
 * OnePost AI — Retry Logic with Exponential Backoff
 *
 * Usage:
 *   import { withRetry } from "@/lib/retry";
 *   const result = await withRetry(() => openaiCall(), { maxRetries: 3 });
 */

const RETRYABLE_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_ERRORS = [
  "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED",
  "ECONNABORTED", "EPIPE", "socket hang up",
  "network error", "timeout", "aborted", "rate limit",
];

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (info: { attempt: number; maxRetries: number; error: string; waitMs: number }) => void;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    onRetry,
  } = opts;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt === maxRetries) break;

      const status = err.status || err.statusCode || err.response?.status;
      const msg = (err.message || err.code || "").toLowerCase();
      const isRetryable =
        (status && RETRYABLE_CODES.has(status)) ||
        RETRYABLE_ERRORS.some((e) => msg.includes(e.toLowerCase())) ||
        err.type === "rate_limit_exceeded" ||
        err.type === "server_error";

      if (!isRetryable) throw err;

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.floor(delay * 0.2 * Math.random());
      const waitMs = delay + jitter;

      console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries}: ${err.message}. Waiting ${waitMs}ms...`);
      onRetry?.({ attempt: attempt + 1, maxRetries, error: err.message, waitMs });
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  throw lastError;
}

/**
 * Async handler wrapper for Next.js route handlers.
 * Catches errors and returns a proper NextResponse.
 */
import { NextResponse } from "next/server";

export type AsyncHandler<T> = (
  ...args: any[]
) => Promise<T | NextResponse> | T | NextResponse;

export function asyncHandler(fn: AsyncHandler<any>): AsyncHandler<NextResponse> {
  return async (...args: any[]) => {
    try {
      const result = await fn(...args);
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("[AsyncHandler]", err.message);
      return NextResponse.json(
        { error: err.message || "Internal server error" },
        { status: err.statusCode || 500 }
      );
    }
  };
}
