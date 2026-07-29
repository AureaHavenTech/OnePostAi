// /api/session/list — List sessions (filter by userId, sessionType)
// GET ?userId=X&sessionType=chat&limit=50
import { withApi } from "@/lib/api-utils";
import { listSessions } from "@/lib/services/utility-apis";

export const GET = withApi(
  {
    method: "GET",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const userId = (body?.userId as string) || undefined;
    const sessionType = (body?.sessionType as string) || undefined;
    const limit = body?.limit ? parseInt(String(body.limit), 10) : 50;
    const items = listSessions({ userId, sessionType, limit });
    return { success: true, sessions: items, total: items.length };
  }
);
