"use client";

import dynamic from "next/dynamic";
import type { ChatMessage } from "@/lib/types/engine-widgets";
import { InlineTextRenderer } from "./InlineTextRenderer";
import { HtmlBubble } from "./HtmlBubble";
import { TypedBubble } from "./TypedBubble";

// react-live + sucrase are ~200KB; only load them when React mode is in use.
const ReactLiveBubble = dynamic(
  () => import("./ReactLiveBubble").then((m) => m.ReactLiveBubble),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-[var(--border)] bg-[#0d1117] px-4 py-6 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] text-center">
        Loading React renderer…
      </div>
    ),
  },
);

interface OutputSystemProps {
  message: ChatMessage;
}

export function OutputSystem({ message }: OutputSystemProps) {
  const hasText = message.text.length > 0;
  const hasHtmlWidget = message.widgetHtml !== null;
  const hasTypedWidgets = (message.typedWidgets?.length ?? 0) > 0;
  const hasAnyWidget = hasHtmlWidget || hasTypedWidgets;

  if (!hasText && !hasAnyWidget) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-text-secondary">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
        <span className="ml-1">Thinking…</span>
      </div>
    );
  }

  const showCursor = message.isStreaming === true && !hasAnyWidget;
  const format = message.outputFormat ?? "html";

  return (
    <div className="space-y-3">
      {hasText && (
        <InlineTextRenderer text={message.text} isStreaming={showCursor} />
      )}
      {hasTypedWidgets && <TypedBubble widgets={message.typedWidgets!} />}
      {hasHtmlWidget && !hasTypedWidgets && (
        format === "react"
          ? <ReactLiveBubble code={message.widgetHtml!} />
          : <HtmlBubble html={message.widgetHtml!} />
      )}
    </div>
  );
}
