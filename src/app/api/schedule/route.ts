import { NextRequest, NextResponse } from "next/server";
import { generateSchedule } from "@/lib/services/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, platforms, postsPerDay, startDate, durationDays } = body;

    if (!brandName || !platforms) {
      return NextResponse.json({ error: "brandName and platforms are required" }, { status: 400 });
    }

    const schedule = generateSchedule({
      brandName,
      platforms,
      postsPerDay: postsPerDay || 3,
      startDate: startDate ? new Date(startDate) : new Date(),
      durationDays: durationDays || 14,
    });

    return NextResponse.json({ schedule, total: schedule.length });
  } catch (error) {
    return NextResponse.json({ error: "Scheduling failed" }, { status: 500 });
  }
}