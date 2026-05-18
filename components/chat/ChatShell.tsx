"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, RotateCcw, AlertTriangle, Download } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import {
  ModeSelector,
  selectionToOpts,
  type ChatSelection,
} from "./ModeSelector";
import { CostCalculator } from "./CostCalculator";
import { PromptLibrary } from "./PromptLibrary";
import { downloadChatPage } from "@/lib/download-page";

const DEFAULT_SELECTION: ChatSelection = {
  providerId: "sonnet",
  useSkill: false,
  // Agent ON by default — the recursive decision loop runs unless the user
  // turns it off. Matches the DCode-v05 default behaviour.
  pipeline: true,
  outputFormat: "html",
};

export function ChatShell() {
  const { messages, isStreaming, error, send, reset } = useChat();
  const [selection, setSelection] = useState<ChatSelection>(DEFAULT_SELECTION);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const sendWithMode = useCallback(
    (message: string) => send(message, selectionToOpts(selection)),
    [send, selection],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const el = target.closest<HTMLElement>("[data-bap-prompt]");
      if (!el) return;
      e.preventDefault();
      const prompt = el.dataset.bapPrompt;
      if (!prompt) return;
      if ("bapConfirm" in el.dataset) {
        const label = el.textContent?.trim() ?? "this action";
        if (!window.confirm(`Confirm: ${label}?`)) return;
      }
      void sendWithMode(prompt);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [sendWithMode]);

  const handleReset = useCallback(() => {
    reset();
    setSelection(DEFAULT_SELECTION);
  }, [reset]);

  const showExpensiveWarning = selection.providerId === "gpt-5";

  return (
    <div className="relative flex flex-col h-full">
      <header className="relative z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md px-6 md:px-10 py-4">
        <div className="flex items-baseline gap-3">
          <Sparkles className="h-5 w-5 text-accent translate-y-[3px]" strokeWidth={1.5} />
          <h1 className="font-display text-2xl font-bold tracking-tight leading-none">
            Mini-BAP
          </h1>
          <span className="hidden md:inline text-[10px] uppercase tracking-[0.25em] text-[var(--secondary)] ml-2 font-mono">
            Interactive UI Responses
          </span>
        </div>
        <div className="flex items-center gap-5">
          <PromptLibrary
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            onPick={sendWithMode}
            disabled={isStreaming}
          />
          <CostCalculator />
          <button
            onClick={() => downloadChatPage(messages)}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--secondary)] hover:text-accent disabled:opacity-30 disabled:hover:text-[var(--secondary)] transition-colors"
            title="Download the entire chat as a standalone .html page"
          >
            <Download className="h-3 w-3" strokeWidth={1.5} />
            Download page
          </button>
          <button
            onClick={handleReset}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--secondary)] hover:text-accent disabled:opacity-30 disabled:hover:text-[var(--secondary)] transition-colors"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
            New chat
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <EmptyState onOpenPrompts={() => setLibraryOpen(true)} />
        ) : (
          <ChatMessageList messages={messages} />
        )}
      </div>

      {error && (
        <div className="relative z-10 mx-auto max-w-3xl w-full px-6 md:px-10 pb-2">
          <div className="rounded border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        </div>
      )}

      <div className="relative z-10 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-6 md:px-10 py-4 space-y-3">
          <ModeSelector
            selection={selection}
            onChange={setSelection}
            disabled={isStreaming}
          />
          {showExpensiveWarning && (
            <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
              <span>
                GPT-5 is the premium tier — pricier per token than GPT-4o Mini or the Gemini Flash lite line, and runs with low reasoning effort by default. Use selectively for the hardest queries.
              </span>
            </div>
          )}
          <ChatInput onSend={sendWithMode} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}
