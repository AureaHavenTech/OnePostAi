"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessageBubble } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { ChatMessage, ChatStreamChunk } from "@/lib/chat-types";
import { Bot, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function generateId(): string {
  return "msg_" + Math.random().toString(36).substring(2, 11);
}

export function ChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm Axel AI, your autonomous AI executive assistant.\n\nTell me what you need done, and I'll take care of it. I can:\n\n• **Research the web** for companies, people, or data\n• **Build lists** of prospects with verified contacts\n• **Draft emails** and outreach campaigns\n• **Gather intel** on competitors or markets\n• **Scrape websites** for structured data\n\nWhat would you like me to work on?",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId] = useState(() => "conv_" + Math.random().toString(36).substring(2, 11));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (isProcessing) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "done",
    };

    // Add placeholder assistant message (streaming)
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "streaming",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsProcessing(true);

    try {
      // Call the real streaming API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Mark as done
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, status: "done" }
                    : m
                )
              );
            } else {
              try {
                const chunk: ChatStreamChunk = JSON.parse(data);

                if (chunk.type === "text") {
                  // Append text content
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: m.content + chunk.content }
                        : m
                    )
                  );
                } else if (chunk.type === "result") {
                  // Set metadata (results preview, stats)
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, metadata: { ...m.metadata, ...chunk.metadata } }
                        : m
                    )
                  );
                } else if (chunk.type === "error") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: chunk.content, status: "error" }
                        : m
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error: any) {
      // Set error state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: error.message || "Failed to process task. Please try again.",
                status: "error",
              }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewResults = (taskId: string) => {
    router.push("/dashboard/tasks");
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm Axel AI, your autonomous AI executive assistant.\n\nStart a new conversation by telling me what you need done!",
        timestamp: new Date(),
        status: "done",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Axel AI Chat</h2>
            <p className="text-[11px] text-slate-500">
              {isProcessing ? "Agent is working..." : "Ready to execute tasks"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="text-slate-500 hover:text-slate-300 h-8"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> New Chat
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scroll-smooth min-h-0" style={{ maxHeight: "calc(100vh - 380px)" }}>
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onViewResults={handleViewResults}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-slate-800/60 mt-4">
        <ChatInput onSend={handleSend} disabled={isProcessing} />
      </div>
    </div>
  );
}