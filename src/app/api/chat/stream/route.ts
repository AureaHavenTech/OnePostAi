/**
 * POST /api/chat/stream — SSE streaming AI chat
 * Users see content as it generates instead of a 30-second white screen.
 */

import { NextRequest } from "next/server";
import { isOpenAIConfigured, getOpenAIClient } from "@/lib/openai";
import { breakers } from "@/lib/circuit-breaker";
import { withRetry } from "@/lib/retry";

const SYSTEM_PROMPT = `You are OnePost AI — a friendly, premium AI content assistant.
You talk like a competent human colleague: concise, warm, confident, never salesy.
You help creators, affiliate marketers, and brand owners plan, create, schedule, and publish content.
Keep replies under 120 words. Use 1-3 short paragraphs max.`;

export async function POST(req: NextRequest) {
  const { message, history = [], brandName } = await req.json().catch(() => ({}));

  if (!message) {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isOpenAIConfigured()) {
    return new Response(
      JSON.stringify({ error: "OpenAI is not configured. Set OPENAI_API_KEY." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Set up SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, any>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "status", message: "Thinking..." });

        const client = getOpenAIClient();
        const messages = [
          { role: "system" as const, content: brandName ? `${SYSTEM_PROMPT}\nThe user manages "${brandName}".` : SYSTEM_PROMPT },
          ...(Array.isArray(history) ? history.slice(-20) : []).filter(
            (m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
          ),
          { role: "user" as const, content: message },
        ];

        // Wrap in circuit breaker + retry
        await breakers.openai.call(() =>
          withRetry(async () => {
            const aiStream = await client.chat.completions.create({
              model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
              messages: messages as any,
              temperature: 0.7,
              max_tokens: 400,
              stream: true,
            });

            for await (const chunk of aiStream) {
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                send({ type: "chunk", content: delta });
              }
            }

            send({ type: "done" });
          }, { maxRetries: 2, baseDelay: 2000 })
        );
      } catch (err: any) {
        console.error("[chat/stream] Error:", err.message);
        send({ type: "error", message: err.message || "Streaming failed" });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
