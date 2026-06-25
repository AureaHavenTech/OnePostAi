import { NextRequest } from "next/server";
import { openai } from "@/lib/openai-client";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamNatural(controller: ReadableStreamDefaultController, encoder: TextEncoder, text: string) {
  const chunks = text.split(/(?<=\n)/);
  for (const chunk of chunks) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`));
    await sleep(20);
  }
}

const SYSTEM_PROMPT = `You are One Post AI — an intelligent content creation assistant. You help creators, entrepreneurs, and busy people write, edit, schedule, and publish content across all platforms.

You can:
- Write social media posts, captions, and threads
- Create blog posts, articles, and newsletters
- Generate content ideas and strategies
- Edit and refine existing content
- Help with content scheduling and planning
- Analyze what types of content perform best
- Write ad copy, product descriptions, and marketing copy
- Help maintain a consistent brand voice across platforms

Be warm, creative, and supportive. You're a content partner who helps people show up consistently and grow their brand without burning out.

IMPORTANT: Always respond in plain markdown text that renders well in a chat interface. Use bullet points, bold, and sections as needed.`;

export async function POST(request: NextRequest) {
  const { message, conversationId, history } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Build messages array
        const messages: any[] = [
          { role: "system", content: SYSTEM_PROMPT },
        ];

        // Add conversation history (last 10 messages)
        if (history && Array.isArray(history)) {
          const recentHistory = history.slice(-10);
          for (const msg of recentHistory) {
            if (msg.role && msg.content) {
              messages.push({ role: msg.role, content: msg.content });
            }
          }
        }

        // Add the current message
        messages.push({ role: "user", content: message });

        // Send initial acknowledgment
        sendEvent({ type: "text", content: "" });

        // Call OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          stream: true,
        });

        let fullContent = "";

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            sendEvent({ type: "text", content });
          }
        }

        // Send task result metadata
        sendEvent({
          type: "result",
          content: "",
          metadata: {
            taskType: "content",
            taskId: "task_" + Date.now().toString(36),
            executionTime: "realtime",
          },
        });

        sendEvent({ type: "done" });
      } catch (error: any) {
        console.error("Chat route error:", error);
        
        // Send a fallback response if OpenAI fails
        await streamNatural(controller, encoder, 
          "I apologize, but I'm having trouble connecting to my AI engine right now. " +
          "This is likely a temporary issue. Please try again in a moment.\n\n" +
          "If the problem persists, check that your OpenAI API key is still valid and has available credits."
        );
        sendEvent({ type: "done" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}