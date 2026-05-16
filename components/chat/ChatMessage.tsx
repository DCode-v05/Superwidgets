"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import type { ChatMessage as ChatMessageType, UsageReport, OutputFormat } from "@/lib/types/engine-widgets";
import { OutputSystem } from "@/components/output/OutputSystem";
import { downloadWidget, copyWidget } from "@/lib/download-widget";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-fade-up">
        <div className="max-w-[80%] flex items-start gap-3 flex-row-reverse">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] pt-2.5 select-none">
            You
          </div>
          <div className="bg-accent text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-8 animate-fade-up">
      <div className="max-w-[92%] w-full flex items-start gap-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent pt-2.5 select-none">
          BAP
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-[var(--surface)] border border-[var(--border)] px-5 py-4">
            <OutputSystem message={message} />
          </div>
          {message.widgetHtml && !message.isStreaming && (
            <WidgetActions
              content={message.widgetHtml}
              format={message.outputFormat ?? "html"}
            />
          )}
          {message.usage && <UsageFooter usage={message.usage} />}
        </div>
      </div>
    </div>
  );
}

function WidgetActions({ content, format }: { content: string; format: OutputFormat }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await copyWidget(content, format);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked — best-effort */
    }
  };

  const onDownload = () => downloadWidget(content, format);
  const downloadLabel = format === "react" ? "Download .tsx" : "Download .html";
  const copyLabel = format === "react" ? "Copy TSX" : "Copy HTML";
  const downloadTitle = format === "react"
    ? "Download as standalone .tsx component file"
    : "Download as standalone .html file";
  const copyTitle = format === "react"
    ? "Copy React TSX source to clipboard"
    : "Copy widget HTML to clipboard";

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        type="button"
        onClick={onDownload}
        title={downloadTitle}
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] hover:text-accent transition-colors px-2 py-1 rounded border border-transparent hover:border-[var(--border)]"
      >
        <Download className="h-3 w-3" strokeWidth={1.75} />
        {downloadLabel}
      </button>
      <span className="text-[var(--secondary)] opacity-30">·</span>
      <button
        type="button"
        onClick={onCopy}
        title={copyTitle}
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] hover:text-accent transition-colors px-2 py-1 rounded border border-transparent hover:border-[var(--border)]"
      >
        {copied ? (
          <Check className="h-3 w-3 text-accent" strokeWidth={2} />
        ) : (
          <Copy className="h-3 w-3" strokeWidth={1.75} />
        )}
        {copied ? "Copied" : copyLabel}
      </button>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatCost(usd: number): string {
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

function UsageFooter({ usage }: { usage: UsageReport }) {
  const hitPct = Math.round(usage.cacheHitRate * 100);
  return (
    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] px-1">
      <span>
        <span className="text-[var(--foreground)]">{formatTokens(usage.inputTokens)}</span> in
      </span>
      <span className="opacity-40">·</span>
      <span>
        <span className="text-[var(--foreground)]">{formatTokens(usage.outputTokens)}</span> out
      </span>
      <span className="opacity-40">·</span>
      <span>
        <span className={hitPct > 0 ? "text-accent" : "text-[var(--foreground)]"}>
          {hitPct}%
        </span>{" "}
        cached
      </span>
      <span className="opacity-40">·</span>
      <span>
        <span className="text-[var(--foreground)]">{formatCost(usage.totalCost)}</span>
      </span>
      <span className="opacity-40 ml-auto normal-case tracking-normal">
        {usage.providerId}
      </span>
    </div>
  );
}
