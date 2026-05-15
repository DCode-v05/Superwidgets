"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/types/engine-widgets";
import { OutputSystem } from "@/components/output/OutputSystem";

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
        <div className="flex-1 rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-[var(--surface)] border border-[var(--border)] px-5 py-4">
          <OutputSystem message={message} />
        </div>
      </div>
    </div>
  );
}
