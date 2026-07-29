// /api/email-capture/list — list captured emails with filters
// GET ?email=X&source=Y&limit=50
import { withApi } from "@/lib/api-utils";
import { listEmailCaptures } from "@/lib/services/utility-apis";

export const GET = withApi(
  {
    method: "GET",
    cache: "short",
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const email = (body?.email as string) || undefined;
    const source = (body?.source as string) || undefined;
    const limit = body?.limit ? parseInt(String(body.limit), 10) : 50;
    const items = listEmailCaptures({ email, source, limit });
    return { success: true, captures: items, total: items.length };
  }
);
