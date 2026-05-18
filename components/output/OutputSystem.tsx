"use client";

import type { ChatMessage } from "@/lib/types/engine-widgets";
import { InlineTextRenderer } from "./InlineTextRenderer";
import { HtmlBubble } from "./HtmlBubble";

interface OutputSystemProps {
  message: ChatMessage;
}

export function OutputSystem({ message }: OutputSystemProps) {
  const hasText = message.text.length > 0;
  const hasWidget = message.widgetHtml !== null;

  if (!hasText && !hasWidget) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-text-secondary">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
        <span className="ml-1">Thinking…</span>
      </div>
    );
  }

  const showCursor = message.isStreaming === true && !hasWidget;

  return (
    <div className="space-y-3">
      {hasText && <InlineTextRenderer text={message.text} isStreaming={showCursor} />}
      {hasWidget && <HtmlBubble html={message.widgetHtml!} />}
    </div>
  );
}
