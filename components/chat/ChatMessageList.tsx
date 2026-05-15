"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types/engine-widgets";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="scroll-area flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-6">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
