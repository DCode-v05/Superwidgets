"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isStreaming,
  disabled,
  placeholder = "Ask Mini-BAP anything…",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 240);
    el.style.height = `${next}px`;
  }, [value]);

  const submit = () => {
    if (disabled || isStreaming) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 placeholder:text-[var(--secondary)] py-1 text-[var(--foreground)]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "h-9 w-9 inline-flex items-center justify-center rounded-full transition-all",
            canSend
              ? "bg-accent text-white hover:bg-accent-deep shadow-sm"
              : "bg-[var(--border)] text-[var(--secondary)]",
          )}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
          )}
        </button>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-center text-[var(--secondary)] font-mono">
        <kbd className="font-mono">Enter</kbd> send · <kbd className="font-mono">Shift+Enter</kbd> newline
      </p>
    </div>
  );
}
