"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Library, X } from "lucide-react";
import { TEST_PROMPTS } from "@/lib/test-prompts";
import { cn } from "@/lib/utils";

interface PromptLibraryProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Trigger button + slide-out drawer holding every demo prompt grouped by intent.
 *
 * Available everywhere — empty state and mid-conversation. Click a prompt to
 * submit it as the next user message; the drawer closes automatically.
 *
 * Open state is controlled by the parent so other components (e.g. EmptyState)
 * can trigger the drawer. Uses `createPortal` to escape the header's
 * `backdrop-filter` containing block (same trick CostCalculator uses).
 */
export function PromptLibrary({
  open,
  onOpenChange,
  onPick,
  disabled,
}: PromptLibraryProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePick = (prompt: string) => {
    onOpenChange(false);
    onPick(prompt);
  };

  const totalCount = TEST_PROMPTS.reduce((n, g) => n + g.prompts.length, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        disabled={disabled}
        title="Open the prompt library"
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--secondary)] hover:text-accent transition-colors",
          disabled && "opacity-40 pointer-events-none",
        )}
      >
        <Library className="h-3 w-3" strokeWidth={1.5} />
        Prompts
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] animate-fade-up">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => onOpenChange(false)}
            />

            <aside
              role="dialog"
              aria-label="Prompt library"
              className="absolute top-0 left-0 h-full w-full max-w-md bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col"
            >
              <header className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight leading-none">
                    Prompt library
                  </h2>
                  <p className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)]">
                    {TEST_PROMPTS.length} sections · {totalCount} prompts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="text-[var(--secondary)] hover:text-accent p-1 -m-1 rounded transition-colors"
                  aria-label="Close prompt library"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  {TEST_PROMPTS.map((group) => (
                    <section key={group.kind}>
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)]">
                          {group.label}
                        </span>
                        <span className="flex-1 h-px bg-[var(--border)]" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.prompts.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePick(p)}
                            className="text-xs px-3 py-1.5 border border-[var(--border)] rounded-full bg-[var(--background)] hover:border-accent hover:bg-accent/5 hover:text-[var(--foreground)] text-[var(--foreground)] transition-colors text-left leading-snug"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <footer className="px-6 py-3 border-t border-[var(--border)] text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)]">
                Esc to close
              </footer>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
