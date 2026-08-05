"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles, Loader2, Zap, Send, Mic, MicOff, Maximize2, Minimize2,
  Trash2, Copy, Coins, Clock, History, MessageSquare,
  Film, Image, ShoppingCart, Search, TrendingUp, User, AlertTriangle, RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  pipeline?: PipelineStep[];
}

interface PipelineStep {
  icon: string;
  label: string;
  status: "pending" | "running" | "done";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// SSE event types from /api/chat/stream
interface SSEStatus { type: "status"; message: string; }
interface SSEChunk { type: "chunk"; content: string; }
interface SSEDone { type: "done"; }
interface SSEError { type: "error"; message: string; }
type SSEEvent = SSEStatus | SSEChunk | SSEDone | SSEError;

// ── Pipeline template ─────────────────────────────────────
function detectPipeline(input: string): PipelineStep[] | null {
  const lower = input.toLowerCase();
  if (lower.includes("unboxing") || lower.includes("video") || lower.includes("ugc")) {
    return [
      { icon: "🎬", label: "Analyzing content brief...", status: "pending" },
      { icon: "✍️", label: "Writing script & hooks...", status: "pending" },
      { icon: "🎥", label: "Generating video content...", status: "pending" },
      { icon: "🎵", label: "Adding music & captions...", status: "pending" },
      { icon: "📱", label: "Formatting for each platform...", status: "pending" },
      { icon: "🚀", label: "Ready to publish!", status: "pending" },
    ];
  }
  if (lower.includes("shopify") || lower.includes("product page") || lower.includes("store")) {
    return [
      { icon: "🔍", label: "Researching product market...", status: "pending" },
      { icon: "📝", label: "Writing SEO product page...", status: "pending" },
      { icon: "🖼️", label: "Generating product images...", status: "pending" },
      { icon: "💰", label: "Setting optimal pricing...", status: "pending" },
      { icon: "🛒", label: "Shopify page ready!", status: "pending" },
    ];
  }
  if (lower.includes("research") || lower.includes("trend") || lower.includes("find product")) {
    return [
      { icon: "📊", label: "Scanning trending products...", status: "pending" },
      { icon: "📈", label: "Analyzing margins & competition...", status: "pending" },
      { icon: "🏆", label: "Ranking by viral potential...", status: "pending" },
      { icon: "✅", label: "Research complete!", status: "pending" },
    ];
  }
  if (lower.includes("avatar") || lower.includes("twin") || lower.includes("ai me")) {
    return [
      { icon: "📸", label: "Analyzing your photos...", status: "pending" },
      { icon: "🧠", label: "Building AI model of your face...", status: "pending" },
      { icon: "🎬", label: "Generating UGC videos...", status: "pending" },
      { icon: "🎙️", label: "Adding voiceover...", status: "pending" },
      { icon: "🤖", label: "AI twin ready!", status: "pending" },
    ];
  }
  return null;
}

// ── Save/load chat history ────────────────────────────────
const STORAGE_KEY = "onepost_chat_sessions";

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
  } catch { /* quota exceeded */ }
}

// ── Component ──────────────────────────────────────────────
export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [thinkingText, setThinkingText] = useState(""); // status message from SSE
  const [streamError, setStreamError] = useState(""); // error from SSE
  const [activePipeline, setActivePipeline] = useState<PipelineStep[] | null>(null);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Full screen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // History
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Credits
  const [credits] = useState(50);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Load history on mount ───────────────────────────────
  useEffect(() => {
    const saved = loadSessions();
    setSessions(saved);
    if (saved.length > 0) {
      const last = saved[saved.length - 1];
      setMessages(last.messages);
      setCurrentSessionId(last.id);
    }
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, streamedText, activePipeline, thinkingText]);

  // ── Voice recognition ───────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ── SSE Stream from /api/chat/stream ────────────────────
  const startSSEStream = async (userMessage: string, pipeline: PipelineStep[] | null) => {
    // Build history excluding the streaming placeholder
    const history = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const abort = new AbortController();
    abortRef.current = abort;

    let fullResponse = "";

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const event: SSEEvent = JSON.parse(jsonStr);
            switch (event.type) {
              case "status":
                setThinkingText(event.message);
                break;
              case "chunk":
                setThinkingText(""); // clear thinking once content arrives
                fullResponse += event.content;
                setStreamedText(fullResponse);
                break;
              case "done":
                // Finalize the message
                const assistantMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: fullResponse,
                  timestamp: Date.now(),
                  pipeline: pipeline ?? undefined,
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamedText("");
                setThinkingText("");
                setActivePipeline(null);
                setIsStreaming(false);
                setStreamError("");
                saveCurrentSession([...messages, assistantMsg]);
                return;
              case "error":
                throw new Error(event.message || "Streaming error occurred.");
            }
          } catch (parseErr: any) {
            // If it's our own thrown error from "error" type, rethrow
            if (parseErr.message !== "Unexpected end of JSON input" &&
                parseErr.message !== "Unexpected token" &&
                !parseErr.message.includes("JSON")) {
              throw parseErr;
            }
            // Otherwise skip malformed lines
          }
        }
      }

      // If stream ends without "done" event, finalize with whatever we have
      if (fullResponse) {
        const msg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
          pipeline: pipeline ?? undefined,
        };
        setMessages((prev) => [...prev, msg]);
        saveCurrentSession([...messages, msg]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return; // user cancelled
      console.error("[chat/stream] error:", err);
      setStreamError(err.message || "Connection lost. Please try again.");
      // If we have a partial response, show it
      if (fullResponse) {
        const msg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullResponse + "\n\n⚠️ _Response was cut short._",
          timestamp: Date.now(),
          pipeline: pipeline ?? undefined,
        };
        setMessages((prev) => [...prev, msg]);
        saveCurrentSession([...messages, msg]);
      }
    } finally {
      setStreamedText("");
      setThinkingText("");
      setActivePipeline(null);
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  // ── Send message ────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const pipeline = detectPipeline(trimmed);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setStreamedText("");
    setThinkingText("");
    setStreamError("");
    setActivePipeline(pipeline);

    const updatedMessages = [...messages, userMsg];

    // If pipeline detected, animate it first, then start streaming
    if (pipeline) {
      let stepIdx = 0;
      const pipelineInterval = setInterval(() => {
        stepIdx++;
        setActivePipeline((prev) =>
          prev
            ? prev.map((s, i) => ({
                ...s,
                status:
                  i < stepIdx
                    ? ("done" as const)
                    : i === stepIdx
                    ? ("running" as const)
                    : ("pending" as const),
              }))
            : null
        );

        if (stepIdx >= pipeline.length) {
          clearInterval(pipelineInterval);
          setTimeout(() => startSSEStream(trimmed, pipeline), 300);
        }
      }, 800);
    } else {
      // No pipeline — stream immediately
      setTimeout(() => startSSEStream(trimmed, null), 200);
    }
  }, [input, isStreaming, messages]);

  // ── Save session ────────────────────────────────────────
  const saveCurrentSession = (msgs: Message[]) => {
    const all = loadSessions();
    const existingIdx = all.findIndex((s) => s.id === currentSessionId);
    const session: ChatSession = {
      id: currentSessionId || Date.now().toString(),
      title: msgs.find((m) => m.role === "user")?.content.slice(0, 40) || "New Chat",
      messages: msgs,
      createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIdx >= 0) {
      all[existingIdx] = session;
    } else {
      all.push(session);
      setCurrentSessionId(session.id);
    }

    saveSessions(all);
    setSessions(all);
  };

  // ── New chat ────────────────────────────────────────────
  const newChat = () => {
    // Cancel any in-flight stream
    abortRef.current?.abort();
    setMessages([]);
    setCurrentSessionId(null);
    setActivePipeline(null);
    setStreamedText("");
    setThinkingText("");
    setStreamError("");
    setIsStreaming(false);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // ── Load session ────────────────────────────────────────
  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  // ── Delete session ──────────────────────────────────────
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const all = loadSessions().filter((s) => s.id !== id);
    saveSessions(all);
    setSessions(all);
    if (currentSessionId === id) {
      newChat();
    }
  };

  // ── Copy message ────────────────────────────────────────
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // ── Handle key press ────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Quick actions ───────────────────────────────────────
  const quickActions = [
    { label: "Unboxing video", icon: Film, prompt: "Create a 15-second unboxing video for Mellow Sleep gummies, upbeat style, post to TikTok and IG Reels" },
    { label: "Trend research", icon: TrendingUp, prompt: "Research trending beauty tech products with high margins for Shopify" },
    { label: "Product page", icon: ShoppingCart, prompt: "Create a Shopify product page for a premium LED light therapy mask" },
    { label: "AI Avatar", icon: User, prompt: "Create an AI avatar video of me reviewing Mellow Sleep gummies" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-gradient-luxury" : "h-[calc(100vh-7rem)]"
      )}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-cream font-heading">AI Chat</h1>
          <span className="text-[10px] text-gold/60 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/10">
            Unfiltered · Streaming
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Credits */}
          <div className="flex items-center gap-1.5 text-xs text-cream/50 bg-dark-card/80 border border-gold/10 rounded-lg px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-gold" />
            <span className="font-semibold text-gold">{credits}</span>
          </div>
          {/* History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-lg transition-all text-xs flex items-center gap-1",
              showHistory ? "bg-gold/10 text-gold" : "text-cream/40 hover:text-cream"
            )}
          >
            <History className="w-4 h-4" />
          </button>
          {/* New chat */}
          <button
            onClick={newChat}
            className="p-2 rounded-lg text-cream/40 hover:text-cream transition-all"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg text-cream/40 hover:text-cream transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* ── History sidebar ──────────────────────────── */}
        {showHistory && (
          <div className="w-64 shrink-0 glass-card p-4 overflow-y-auto animate-slideUp">
            <h3 className="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              Chat History
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-cream/40">No conversations yet</p>
            ) : (
              <div className="space-y-1">
                {[...sessions].reverse().map((s) => (
                  <div
                    key={s.id}
                    onClick={() => loadSession(s)}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-all",
                      s.id === currentSessionId
                        ? "bg-gold/10 text-gold font-medium"
                        : "text-cream/50 hover:bg-gold/5"
                    )}
                  >
                    <span className="truncate flex-1">{s.title}</span>
                    <button
                      onClick={(e) => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={newChat}
              className="mt-3 w-full text-xs text-gold hover:text-gold-light font-medium py-2 border border-gold/20 rounded-lg transition-colors"
            >
              + New Chat
            </button>
          </div>
        )}

        {/* ── Chat area ────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20 mb-6">
                  <Sparkles className="w-10 h-10 text-dark" />
                </div>
                <h2 className="text-2xl font-bold text-cream font-heading mb-2">
                  Hey, I'm OnePost AI ✨
                </h2>
                <p className="text-cream/40 text-sm max-w-md mb-6">
                  I create content, research trends, build product pages, and publish everywhere.
                  Just talk to me like a human — no filters, no limits.
                </p>
                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => {
                        setInput(qa.prompt);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl glass-card text-left text-xs text-cream/60 hover:border-gold/30 hover:text-cream transition-all group"
                    >
                      <qa.icon className="w-4 h-4 text-gold/40 group-hover:text-gold shrink-0" />
                      <span>{qa.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error banner */}
            {streamError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{streamError}</span>
                <button
                  onClick={() => setStreamError("")}
                  className="ml-auto text-red-400/60 hover:text-red-400"
                >
                  &times;
                </button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-fadeIn",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-dark" />
                  </div>
                )}
                <div className={cn("max-w-[80%] group relative", msg.role === "user" ? "order-first" : "")}>
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-gold text-dark rounded-br-md"
                        : "glass-card rounded-bl-md text-cream/90"
                    )}
                  >
                    {msg.content}
                  </div>
                  {/* Copy button */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="absolute -bottom-6 left-2 opacity-0 group-hover:opacity-100 text-[10px] text-cream/30 hover:text-gold flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                  {/* Timestamp */}
                  <span className="text-[10px] text-cream/20 mt-1 block px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm font-semibold text-cream/60">U</span>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking indicator — SSE "status" events */}
            {isStreaming && thinkingText && !streamedText && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-dark" />
                </div>
                <div className="glass-card p-4 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-cream/40">{thinkingText}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming response (real SSE chunks) */}
            {isStreaming && streamedText && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-dark" />
                </div>
                <div className="max-w-[80%]">
                  <div className="glass-card p-4 rounded-2xl rounded-bl-md text-sm text-cream/90 leading-relaxed whitespace-pre-wrap">
                    {streamedText}
                    <span className="inline-block w-1.5 h-4 bg-gold ml-0.5 animate-pulse align-middle" />
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline visualization */}
            {activePipeline && (
              <div className="ml-11 max-w-[75%] animate-fadeIn">
                <div className="glass-card p-4 rounded-2xl rounded-bl-md border-gold/20">
                  <p className="text-xs font-medium text-gold mb-3">⚡ Executing pipeline...</p>
                  <div className="space-y-1.5">
                    {activePipeline.map((step, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 text-xs p-1.5 rounded-lg transition-all duration-300",
                          step.status === "running"
                            ? "bg-gold/10 text-gold"
                            : step.status === "done"
                            ? "text-cream/30"
                            : "text-cream/20"
                        )}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-sm">
                          {step.icon}
                        </span>
                        <span className="flex-1">{step.label}</span>
                        {step.status === "running" && (
                          <Loader2 className="w-3 h-3 text-gold animate-spin" />
                        )}
                        {step.status === "done" && (
                          <Check className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Input area ─────────────────────────────── */}
          <div className="shrink-0 pt-2">
            <div className="glass-card border-gold/20 rounded-2xl p-2 flex items-end gap-2 shadow-lg">
              {/* Voice button */}
              <button
                onClick={toggleVoice}
                className={cn(
                  "p-2.5 rounded-xl transition-all shrink-0",
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-cream/30 hover:text-gold hover:bg-gold/5"
                )}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Talk to me like a human — no filters, no limits..."}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-cream placeholder:text-cream/20 py-2 min-h-[40px] max-h-[120px]"
                rows={1}
                disabled={isStreaming}
              />

              {/* Send button */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "p-2.5 rounded-xl transition-all shrink-0",
                  input.trim() && !isStreaming
                    ? "bg-gradient-to-r from-gold to-gold-light text-dark shadow-md shadow-gold/20 hover:shadow-gold/40"
                    : "text-cream/10 bg-white/5 cursor-not-allowed"
                )}
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-cream/20 text-center mt-2">
              Press Enter to send · Shift+Enter for new line · 🎤 Voice input supported
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
