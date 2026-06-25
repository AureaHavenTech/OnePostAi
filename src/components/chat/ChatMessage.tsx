"use client";

import React, { useState } from "react";
import { Bot, User, Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye, ExternalLink, Copy, Check, Mail, Globe, BarChart3, List, FileText, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/chat-types";

interface ChatMessageProps {
  message: ChatMessage;
  onViewResults?: (taskId: string) => void;
}

export function ChatMessageBubble({ message, onViewResults }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Format content with markdown-like bold and links
  const formatContent = (text: string) => {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Links: [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-brand-400 hover:text-brand-300 underline">$1</a>');
    // Italic: *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
    // Inline code: `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-brand-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    return formatted;
  };

  // Render visual results based on metadata type
  const renderVisualResults = () => {
    const meta = message.metadata;
    if (!meta) return null;

    const visuals: React.ReactNode[] = [];

    // ---------- Email Preview Cards ----------
    if (meta.emails && Array.isArray(meta.emails) && meta.emails.length > 0) {
      visuals.push(
        <div key="emails" className="space-y-3 mt-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Mail className="h-4 w-4 text-brand-400" />
            <span>Generated Emails ({meta.emails.length})</span>
          </div>
          {meta.emails.slice(0, 3).map((email: any, idx: number) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                    {(email.to?.[0] || "T")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{email.subject || "No Subject"}</p>
                    <p className="text-[10px] text-slate-500">To: {Array.isArray(email.to) ? email.to.join(", ") : email.to || "recipient@example.com"}</p>
                  </div>
                </div>
                <button onClick={() => copyToClipboard(email.body || email.content || "")}
                  className="text-slate-500 hover:text-white p-1 rounded transition-colors">
                  {copiedText === (email.body || email.content) ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {(email.body || email.content || "").substring(0, 250)}
              </p>
              {email.body?.length > 250 && (
                <button className="text-[10px] text-brand-400 hover:text-brand-300 font-medium">Show full email →</button>
              )}
            </div>
          ))}
          {meta.emails.length > 3 && (
            <p className="text-xs text-slate-500 text-center">+{meta.emails.length - 3} more emails</p>
          )}
          {meta.needsApproval && (
            <div className="flex gap-2 mt-4 pt-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 flex-1">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve & Send All
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700 text-xs h-9 flex-1">
                Edit Drafts
              </Button>
            </div>
          )}
        </div>
      );
    }

    // ---------- Webpage Preview ----------
    if (meta.webpageUrl) {
      visuals.push(
        <div key="webpage" className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>Webpage Preview</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl overflow-hidden">
            <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700/60">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="ml-2 font-mono text-[10px]">{meta.pageTitle || "Generated Page"}</span>
              </div>
              <a href={meta.webpageUrl} target="_blank" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Open
              </a>
            </div>
            <iframe 
              src={meta.webpageUrl} 
              className="w-full h-48 md:h-64 bg-white rounded-b-xl"
              title="Webpage preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      );
    }

    // ---------- Marketing Strategy Visual ----------
    if (meta.taskType === "marketing" && meta.channels) {
      visuals.push(
        <div key="marketing" className="space-y-4 mt-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-brand-400" />
            <span>Marketing Growth Strategy</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {meta.channels.map((channel: any, i: number) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 hover:border-brand-500/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {channel.name}
                  </h4>
                  <Badge variant="secondary" className="text-[9px] opacity-60 px-1.5 py-0">Channel {i+1}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{channel.why}</p>
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/50 flex items-start gap-2">
                  <Badge className="bg-brand-500/10 text-brand-400 border-none text-[9px] px-1 py-0 shrink-0 mt-0.5">Strategy</Badge>
                  <p className="text-[10px] text-slate-300 italic leading-snug">{channel.strategy}</p>
                </div>
              </div>
            ))}
          </div>

          {meta.adCopy && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Ad Creative Drafts</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {meta.adCopy.slice(0, 2).map((ad: any, i: number) => (
                  <div key={i} className="bg-slate-950/40 border border-slate-800 border-l-2 border-l-brand-500 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-bold text-slate-500">{ad.platform}</span>
                      <button onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.body}`)} className="text-slate-600 hover:text-white">
                        {copiedText === `${ad.headline}\n\n${ad.body}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-white line-clamp-1">{ad.headline}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{ad.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ---------- Results Table ----------
    if (meta.resultsPreview && Array.isArray(meta.resultsPreview) && meta.resultsPreview.length > 0 && !meta.emails) {
      visuals.push(
        <div key="results" className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <List className="h-4 w-4 text-cyan-400" />
            <span>Results Preview</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-700/60 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700/60 text-slate-400 font-semibold">
                  {Object.keys(meta.resultsPreview[0]).slice(0, 4).map((key) => (
                    <th key={key} className="px-3 py-2.5 capitalize">{key.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {meta.resultsPreview.slice(0, 6).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                    {Object.values(item).slice(0, 4).map((val: any, vi: number) => (
                      <td key={vi} className={`px-3 py-2.5 ${vi === 0 ? "font-medium text-white" : "text-slate-400"} truncate max-w-[200px]`}>
                        {typeof val === "string" && val.startsWith("http") ? (
                          <a href={val} target="_blank" className="text-brand-400 hover:underline">{val.replace(/https?:\/\//, "").substring(0, 25)}</a>
                        ) : typeof val === "string" && val.includes("@") ? (
                          <span className="text-brand-400 font-mono">{val}</span>
                        ) : (
                          String(val).substring(0, 40)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {meta.resultsPreview.length > 6 && (
              <div className="px-3 py-2.5 text-xs text-slate-500 border-t border-slate-800/40 text-center bg-slate-900/40">
                +{meta.resultsPreview.length - 6} more results
              </div>
            )}
          </div>
        </div>
      );
    }

    // ---------- Stats Bar ----------
    if (meta.itemsCount || meta.executionTime || meta.companiesFound) {
      visuals.push(
        <div key="stats" className="flex flex-wrap items-center gap-2 mt-3">
          {meta.itemsCount && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300"><strong className="text-emerald-400">{meta.itemsCount}</strong> targets</span>
            </div>
          )}
          {meta.companiesFound && (
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-400" />
              <span className="text-xs text-brand-300"><strong className="text-brand-400">{meta.companiesFound}</strong> companies</span>
            </div>
          )}
          {meta.emailsCreated && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-300"><strong className="text-cyan-400">{meta.emailsCreated}</strong> emails drafted</span>
            </div>
          )}
          {meta.executionTime && (
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">⏱ {meta.executionTime}</span>
            </div>
          )}
          {meta.pagesBuilt && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300"><strong className="text-emerald-400">{meta.pagesBuilt}</strong> pages built</span>
            </div>
          )}
        </div>
      );
    }

    // ---------- Task Type Badge ----------
    if (meta.taskType) {
      const typeColors: Record<string, string> = {
        research: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        list_building: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        email_outreach: "bg-brand-500/10 text-brand-400 border-brand-500/20",
        data_gathering: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        marketing: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        webpage: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        product_page: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        cross_promotion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
      visuals.push(
        <div key="badge" className="flex items-center gap-2 mt-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${typeColors[meta.taskType] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
            {meta.taskType.replace(/_/g, " ")}
          </span>
        </div>
      );
    }

    // ---------- View Full Results Button ----------
    if (meta.taskId) {
      visuals.push(
        <Button key="view-btn" size="sm" variant="outline" onClick={() => onViewResults?.(meta.taskId!)}
          className="w-full text-xs h-9 mt-3 border-slate-700 hover:bg-slate-800 hover:text-white">
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> View Full Results in Task Board
        </Button>
      );
    }

    return visuals.length > 0 ? <div className="space-y-1">{visuals}</div> : null;
  };

  return (
    <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar (assistant only) */}
      {isAssistant && (
        <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-5 w-5 text-brand-400" />
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[85%] md:max-w-[75%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <div className={`text-[11px] font-semibold tracking-wider uppercase ${isUser ? "text-right text-slate-500" : "text-brand-400"}`}>
          {isUser ? "You" : "Axel AI"}
        </div>

        {/* Bubble */}
        <div className={`
          rounded-2xl px-5 py-3.5 text-sm leading-relaxed
          ${isUser
            ? "bg-brand-500 text-white rounded-br-md shadow-lg shadow-brand-500/20"
            : isError
              ? "bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-bl-md"
              : "bg-slate-900/60 border border-slate-800/50 text-slate-200 rounded-bl-md"
          }
        `}>
          {isStreaming && message.content === "" ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
              <span className="text-slate-400 text-xs">Thinking...</span>
            </div>
          ) : message.content ? (
            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
          ) : null}

          {isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-brand-400 animate-pulse ml-0.5 rounded-sm align-middle" />
          )}
        </div>

        {/* Visual Results */}
        {message.metadata && !isStreaming && renderVisualResults()}

        {/* Error state */}
        {isError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Task execution failed. Please try again.</span>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] text-slate-600 ${isUser ? "text-right" : ""}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Avatar (user only) */}
      {isUser && (
        <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-brand-500/20">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}