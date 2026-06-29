export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "streaming" | "done" | "error";
  metadata?: Record<string, any>;
}

export interface ChatStreamChunk {
  type: "text" | "result" | "error";
  content: string;
  metadata?: Record<string, any>;
}