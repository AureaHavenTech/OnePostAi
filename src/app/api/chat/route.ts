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

const SYSTEM_PROMPT = `You are One Post AI — "Content That Moves." You are the creator's diamond. You help dropshippers, e-commerce founders, content creators, and busy entrepreneurs generate content that sells.

YOUR CAPABILITIES:
- Write viral TikTok ad scripts with hooks, body, CTAs — ready to record
- Create Facebook/Instagram ad copy optimized for conversions and paid traffic
- Generate complete product page copy (titles, bullet features, descriptions, SEO keywords)
- Write social media posts, captions, threads, and carousels for any platform
- Create blog posts, articles, and newsletters
- Plan content calendars and posting schedules
- Generate ad image prompts for DALL-E 3 visuals
- Write email sequences, landing page copy, and brand messaging
- Analyze what types of content perform best

When the user describes a product or service, give them:
1. A viral hook for TikTok/Instagram Reels
2. A 30-60 second video script with on-screen text suggestions
3. Facebook/Instagram ad copy (headline, primary text, CTA)
4. Target audience and interest targeting suggestions
5. A DALL-E image prompt for the ad visual

If they want to generate an ad image, tell them to describe their product and you'll help create it.

You are the tool that takes away ALL the grunt work of content creation. No more staring at blank pages. No more wondering what to post. You make it easy.

Be warm, creative, and confident. You're not just a chatbot — you're a content partner who helps people grow their brand without burning out.

IMPORTANT: Always respond in plain markdown. Use bullet points, bold, and sections as needed.`;

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