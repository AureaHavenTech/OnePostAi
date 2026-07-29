// /api/session/restore — Restore the most recent saved session for a user
// GET ?userId=X[&sessionType=chat] — returns the latest session's data
//   (chatMessages, generatedContent, and any other state), or null if none
//
// Designed to be called by the frontend on page load to auto-resume where
// the user left off, even after a refresh, browser restart, or device switch.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { listSessions } from "@/lib/services/utility-apis";

export const GET = withApi(
  {
    method: "GET",
    cache: "no-store", // always return fresh; sessions update frequently
    rateLimit: { windowMs: 60_000, max: 240 },
  },
  async (req, body) => {
    const userId = (body?.userId as string) || undefined;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query param is required" },
        { status: 400 }
      );
    }
    const sessionType = (body?.sessionType as string) || undefined;
    const sessions = listSessions({ userId, sessionType, limit: 1 });
    if (sessions.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        session: null,
        meta: { hint: "No previous session found for this user. Start a new chat to begin." },
      });
    }
    const latest = sessions[0];
    // Convenience: extract chatMessages and generatedContent if present in state
    const state = (latest.state || {}) as Record<string, any>;
    return {
      success: true,
      found: true,
      session: latest,
      // Convenience fields the frontend can use directly without reaching into session.state
      chatMessages: Array.isArray(state.messages) ? state.messages : Array.isArray(state.chatMessages) ? state.chatMessages : [],
      generatedContent: state.generatedContent || null,
      timestamp: latest.lastActiveAt,
      meta: {
        hint: "This is the most recently active session for this user. Call POST /api/session/save with the same sessionId to keep updating it.",
        ageMs: Date.now() - new Date(latest.lastActiveAt).getTime(),
      },
    };
  }
);
