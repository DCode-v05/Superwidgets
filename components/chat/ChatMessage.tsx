"use client";

import { useState } from "react";
import { Download, Copy, Check, AlertOctagon } from "lucide-react";
import type { ChatMessage as ChatMessageType, UsageReport } from "@/lib/types/engine-widgets";
import { OutputSystem } from "@/components/output/OutputSystem";
import { downloadWidget, copyWidget } from "@/lib/download-widget";
import { MODEL_INFO } from "@/lib/engine/model-info";
import type { ProviderId } from "@/lib/engine/providers";
import { AgentDecisionPanel } from "./AgentDecisionPanel";

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
          {message.agentDecision && (
            <AgentDecisionPanel decision={message.agentDecision} />
          )}
          <div className="rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-[var(--surface)] border border-[var(--border)] px-5 py-4">
            <OutputSystem message={message} />
          </div>
          {message.error && (
            <ApiErrorBanner error={message.error} />
          )}
          {message.widgetHtml && !message.isStreaming && (
            <WidgetActions content={message.widgetHtml} />
          )}
          {message.usage && (
            <UsageFooter
              usage={message.usage}
              useSkill={message.useSkill}
              pipeline={message.pipeline}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WidgetActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await copyWidget(content, "html");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked — best-effort */
    }
  };

  const onDownload = () => downloadWidget(content, "html");
  const downloadLabel = "Download .html";
  const copyLabel = "Copy HTML";
  const downloadTitle = "Download as standalone .html file";
  const copyTitle = "Copy widget HTML to clipboard";

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

function ApiErrorBanner({ error }: { error: NonNullable<ChatMessageType["error"]> }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/[0.06] px-3.5 py-2.5"
    >
      <AlertOctagon className="h-4 w-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-red-700 dark:text-red-300 leading-snug">
          {error.message}
        </div>
        {error.hint && (
          <div className="mt-0.5 text-[11px] text-red-700/85 dark:text-red-300/80 leading-relaxed">
            {error.hint}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTokensExact(n: number): string {
  return n.toLocaleString("en-US");
}

function formatTokensCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatCost(usd: number): string {
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

function getModelMeta(providerId: string): { label: string; bestFor: string | null } {
  if (providerId in MODEL_INFO) {
    const info = MODEL_INFO[providerId as ProviderId];
    return { label: info.label, bestFor: info.bestFor };
  }
  return { label: providerId, bestFor: null };
}

interface UsageFooterProps {
  usage: UsageReport;
  useSkill?: boolean;
  pipeline?: boolean;
}

function UsageFooter({ usage, useSkill, pipeline }: UsageFooterProps) {
  const hitPct = Math.round(usage.cacheHitRate * 100);
  const total = usage.inputTokens + usage.outputTokens;
  const meta = getModelMeta(usage.providerId);

  return (
    <div className="flex flex-col gap-1 px-1">
      {/* Primary line: clear English summary of what was used */}
      <div className="flex items-center gap-x-2 gap-y-1 flex-wrap text-[11px] text-[var(--secondary)] leading-snug">
        <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--foreground)]">
          Tokens used
        </span>
        <span>
          <span className="text-[var(--foreground)] font-medium">
            {formatTokensExact(usage.inputTokens)}
          </span>{" "}
          input
        </span>
        <span className="opacity-40">+</span>
        <span>
          <span className="text-[var(--foreground)] font-medium">
            {formatTokensExact(usage.outputTokens)}
          </span>{" "}
          output
        </span>
        <span className="opacity-40">=</span>
        <span>
          <span className="text-[var(--foreground)] font-medium">
            {formatTokensCompact(total)}
          </span>{" "}
          total
        </span>
        <span className="opacity-40">·</span>
        <span title="Fraction of input tokens served from prompt cache">
          cache{" "}
          <span className={hitPct > 0 ? "text-accent font-medium" : "text-[var(--foreground)] font-medium"}>
            {hitPct}%
          </span>
        </span>
        <span className="opacity-40">·</span>
        <span>
          cost{" "}
          <span className="text-[var(--foreground)] font-medium">
            {formatCost(usage.totalCost)}
          </span>
        </span>
      </div>

      {/* Secondary line: which model + config produced this */}
      <div className="flex items-center gap-x-2 gap-y-1 flex-wrap text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)]">
        <span className="text-[var(--foreground)]">{meta.label}</span>
        <span
          className={
            "px-1.5 py-0.5 rounded border text-[9px] " +
            (useSkill
              ? "border-accent text-accent"
              : "border-[var(--border)] opacity-50")
          }
          title={useSkill ? "Frontend Design Skill prepended" : "Skill off"}
        >
          {useSkill ? "+skill" : "no skill"}
        </span>
        <span
          className={
            "px-1.5 py-0.5 rounded border text-[9px] " +
            (pipeline
              ? "border-accent text-accent"
              : "border-[var(--border)] opacity-50")
          }
          title={pipeline ? "Skill Decision Agent: 2-round reasoning loop → specialist (3 LLM calls)" : "Single LLM call"}
        >
          {pipeline ? "agent" : "single"}
        </span>
      </div>

      {/* Tertiary line: full "Best for" recommendation — wraps naturally, never truncated */}
      {meta.bestFor && (
        <div className="text-[11px] leading-relaxed text-[var(--secondary)]">
          <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--foreground)] mr-1.5">
            Best for
          </span>
          {meta.bestFor}
        </div>
      )}
    </div>
  );
}
