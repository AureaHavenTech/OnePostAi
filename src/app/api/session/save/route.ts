// /api/session/save — Auto-save chat sessions, dashboard state, editor snapshots
// Accepts the canonical OnePost spec:
//   { sessionId?, userId, sessionType?, chatMessages?, generatedContent?, state?, metadata? }
//   - chatMessages is mapped to state.messages
//   - generatedContent is stored under state.generatedContent
//   - state (if provided directly) is merged on top
// Returns { success: true, saved: true, timestamp, session } on success.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { saveSession } from "@/lib/services/utility-apis";

const VALID_TYPES = ["chat", "editor", "dashboard", "calendar", "onboarding", "support"] as const;

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 120 },
    validate: (b) => {
      if (b?.sessionType && !VALID_TYPES.includes(String(b.sessionType))) {
        return `sessionType must be one of: ${VALID_TYPES.join(", ")}`;
      }
      return true;
    },
  },
  async (req, body) => {
    // Build the state object: merge spec-style fields (chatMessages, generatedContent)
    // with any explicit `state` object passed by the caller. Spec fields take precedence
    // because they are the canonical OnePost contract.
    const state: Record<string, any> = { ...(body.state || {}) };
    if (Array.isArray(body.chatMessages)) {
      state.messages = body.chatMessages;
      state.chatMessages = body.chatMessages;
    }
    if (body.generatedContent !== undefined) {
      state.generatedContent = body.generatedContent;
    }
    // Add convenience top-level mirrors for the restore endpoint
    if (body.userId && !state.userId) state.userId = body.userId;
    if (body.sessionType && !state.sessionType) state.sessionType = body.sessionType;

    const session = saveSession({
      sessionId: body.sessionId,
      userId: body.userId,
      sessionType: body.sessionType || (state.sessionType as any) || "chat",
      state,
      metadata: body.metadata,
    });
    return NextResponse.json(
      {
        success: true,
        saved: true,
        timestamp: session.lastActiveAt,
        session,
        meta: {
          hint: "Pass the same sessionId on subsequent saves to upsert; omit to create a new session. Restore with GET /api/session/restore?userId=...",
          ttl: "Sessions persist indefinitely; call /api/session/load?id=... then DELETE to remove.",
        },
      },
      { status: 201 }
    );
  }
);

export const PUT = withApi(
  {
    method: "PUT",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 120 },
    validate: (b) => (!b?.sessionId ? "sessionId is required for PUT (use POST to create new)" : true),
  },
  async (req, body) => {
    const state: Record<string, any> = { ...(body.state || {}) };
    if (Array.isArray(body.chatMessages)) {
      state.messages = body.chatMessages;
      state.chatMessages = body.chatMessages;
    }
    if (body.generatedContent !== undefined) {
      state.generatedContent = body.generatedContent;
    }
    const session = saveSession({
      sessionId: body.sessionId,
      userId: body.userId,
      sessionType: body.sessionType,
      state,
      metadata: body.metadata,
    });
    return { success: true, saved: true, timestamp: session.lastActiveAt, session };
  }
);
