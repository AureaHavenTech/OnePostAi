import { withApi } from "@/lib/api-utils";
import { generateThreeLiner, THREE_LINER_TEMPLATES } from "@/lib/services/three-liner";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
  },
  async (req, body) => {
    return generateThreeLiner(body);
  }
);

export const GET = withApi(
  {
    method: "GET",
    cache: "long", // 1h — template catalog rarely changes
  },
  async () => {
    return { templates: Object.keys(THREE_LINER_TEMPLATES), details: THREE_LINER_TEMPLATES };
  }
);
