// /api/search — Smart search across brands, content, posts, trends, affiliates
// GET ?q=keyword&scope=all|brands|content|posts|trends|affiliates|reports&limit=25&brandId=X
// POST { query, scope?, limit?, brandId?, userId? } — same logic, body form for chat-style usage
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { smartSearch, type SearchScope } from "@/lib/services/utility-apis";

const VALID_SCOPES: SearchScope[] = ["all", "brands", "content", "posts", "trends", "affiliates", "reports"];

export const GET = withApi(
  {
    method: "GET",
    cache: "no-store", // search is per-request; no caching
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const q = String(body?.q || body?.query || "").trim();
    if (!q) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required. Pass ?q=keyword or POST { query: 'keyword' }",
          example: { query: "Mellow Sleep", scope: "all", limit: 25 },
        },
        { status: 400 }
      );
    }
    const scope = (String(body?.scope || "all") as SearchScope);
    if (!VALID_SCOPES.includes(scope)) {
      return NextResponse.json(
        { success: false, error: `Invalid scope. Must be one of: ${VALID_SCOPES.join(", ")}` },
        { status: 400 }
      );
    }
    const limit = body?.limit ? Math.min(50, Math.max(1, parseInt(String(body.limit), 10))) : 25;
    const brandId = (body?.brandId as string) || undefined;
    const userId = (body?.userId as string) || undefined;
    return smartSearch({ query: q, scope, limit, brandId, userId });
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 120 },
    validate: (b) => (!b?.query ? "query is required" : true),
  },
  async (req, body) => {
    const q = String(body.query || "").trim();
    const scope = (String(body.scope || "all") as SearchScope);
    if (!VALID_SCOPES.includes(scope)) {
      return NextResponse.json(
        { success: false, error: `Invalid scope. Must be one of: ${VALID_SCOPES.join(", ")}` },
        { status: 400 }
      );
    }
    const limit = body.limit ? Math.min(50, Math.max(1, parseInt(String(body.limit), 10))) : 25;
    return smartSearch({ query: q, scope, limit, brandId: body.brandId, userId: body.userId });
  }
);
