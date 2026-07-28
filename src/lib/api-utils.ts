/**
 * Shared API route utilities — caching, validation, error boundaries, timing.
 * Drop-in: `import { withApi } from "@/lib/api-utils";`
 *
 * Usage:
 *   export const POST = withApi({
 *     method: "POST",
 *     cache: "no-store",
 *     validate: (b) => !!b.brandName && !!b.prompt,
 *   }, async (req, body) => {
 *     return generateContent(body);
 *   });
 */
import { NextRequest, NextResponse } from "next/server";

export type CacheControl = "no-store" | "short" | "medium" | "long" | "immutable";

const CACHE_MAX_AGE: Record<CacheControl, number> = {
  "no-store": 0,
  short: 30,
  medium: 300,
  long: 3600,
  immutable: 31536000,
};

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  cache?: CacheControl;
  rateLimit?: { windowMs: number; max: number };
  validate?: (body: any) => true | string;
  logLevel?: "silent" | "error" | "info" | "debug";
}

// In-process rate limiter (per route). Replace with Redis/Upstash for multi-instance.
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function withApi<T = any>(
  options: ApiOptions,
  handler: (req: NextRequest, body: T, ctx: { timingMs: number; requestId: string }) => Promise<NextResponse | any> | NextResponse | any
) {
  return async function wrapped(req: NextRequest, ...rest: any[]) {
    const start = performance.now ? performance.now() : Date.now();
    const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const method = options.method || req.method;
    const logLevel = options.logLevel || "info";

    try {
      // Method check
      if (options.method && req.method !== options.method) {
        return NextResponse.json({ error: `Method ${req.method} not allowed. Use ${options.method}.` }, { status: 405, headers: { Allow: options.method } });
      }

      // Rate limit (per IP, per route)
      if (options.rateLimit) {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "local";
        const ok = rateLimit(`${ip}:${req.nextUrl.pathname}`, options.rateLimit.windowMs, options.rateLimit.max);
        if (!ok) {
          return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil(options.rateLimit.windowMs / 1000)) } });
        }
      }

      // Body parsing & validation
      let body: any = null;
      if (method !== "GET" && method !== "DELETE") {
        try {
          body = await req.json();
        } catch (e) {
          return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
      } else {
        // For GET, also support query params as body
        body = Object.fromEntries(req.nextUrl.searchParams);
      }
      if (options.validate) {
        const v = options.validate(body);
        if (v !== true) {
          return NextResponse.json({ error: typeof v === "string" ? v : "Validation failed" }, { status: 400 });
        }
      }

      // Execute handler
      const result = await handler(req, body as T, { timingMs: 0, requestId });

      // Coerce result to NextResponse if it isn't already
      let response: NextResponse;
      if (result instanceof NextResponse) {
        response = result;
      } else {
        const status = (result && typeof result === "object" && "status" in result && typeof result.status === "number") ? result.status : 200;
        response = NextResponse.json(result, { status });
      }

      // Add caching headers
      const cache = options.cache || "no-store";
      const maxAge = CACHE_MAX_AGE[cache];
      response.headers.set("Cache-Control", cache === "no-store" ? "no-store" : `public, max-age=${maxAge}, s-maxage=${maxAge}`);
      response.headers.set("X-Request-Id", requestId);

      const elapsed = (performance.now ? performance.now() : Date.now()) - start;
      response.headers.set("X-Response-Time-Ms", elapsed.toFixed(2));
      if (logLevel !== "silent") {
        console.log(`[api] ${method} ${req.nextUrl.pathname} ${response.status} ${elapsed.toFixed(1)}ms ${requestId}`);
      }
      return response;
    } catch (error: any) {
      const elapsed = (performance.now ? performance.now() : Date.now()) - start;
      console.error(`[api] ${method} ${req.nextUrl.pathname} ERROR ${elapsed.toFixed(1)}ms ${requestId}`, error?.message || error);
      return NextResponse.json({ error: error?.message || "Internal server error", requestId }, { status: 500, headers: { "X-Request-Id": requestId, "X-Response-Time-Ms": elapsed.toFixed(2) } });
    }
  };
}

export function jsonError(message: string, status: number = 400, extra: Record<string, any> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function requireFields<T extends Record<string, any>>(body: T, fields: (keyof T)[]): true | string {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === "") {
      return `Missing required field: ${String(f)}`;
    }
  }
  return true;
}
