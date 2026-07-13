import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { generateSchedule } from "@/lib/services/backend";

export const POST = withApi(
  {
    method: "POST",
    cache: "short", // 30s — schedule results are deterministic for the same params
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => (!b?.brandName ? "brandName is required" : !b?.platforms ? "platforms is required" : true),
  },
  async (req, body) => {
    const { brandName, platforms, postsPerDay, startDate, durationDays } = body;
    const schedule = generateSchedule({
      brandName,
      platforms,
      postsPerDay: postsPerDay || 3,
      startDate: startDate ? new Date(startDate) : new Date(),
      durationDays: durationDays || 14,
    });
    return { schedule, total: schedule.length };
  }
);
