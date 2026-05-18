"use client";

import { PROMPT_CATEGORIES } from "@/lib/test-prompts";

interface EmptyStateProps {
  onPick: (prompt: string) => void;
}

export function EmptyState({ onPick }: EmptyStateProps) {
  const totalWidgets = PROMPT_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="scroll-area flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 md:px-10 py-12 md:py-16">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--secondary)] mb-5 font-mono">
            Prototype · {totalWidgets} widget intents
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-tight leading-[1.05] text-[var(--foreground)]">
            What can{" "}
            <em className="font-medium italic text-accent">widgets</em>
            <br />
            do for chat?
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-sm text-[var(--secondary)] leading-relaxed">
            Pick any prompt below. The reply renders as a dedicated widget — chart, table,
            flowchart, calculator, quiz, and more. Flip <span className="font-mono text-accent">Agent ON</span>{" "}
            to see the recursive reasoning that picked the widget.
          </p>
        </div>

        {/* Category sections — full width with headings */}
        <div className="space-y-8">
          {PROMPT_CATEGORIES.map((cat) => (
            <section key={cat.category}>
              <header className="flex items-baseline gap-3 mb-3">
                <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
                  {cat.category}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] opacity-60">
                  {cat.items.length} widget{cat.items.length === 1 ? "" : "s"}
                </span>
                <span className="flex-1 h-px bg-[var(--border)]" />
              </header>
              {cat.hint && (
                <p className="text-[11px] text-[var(--secondary)] mb-3 leading-relaxed">{cat.hint}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <button
                    key={item.kind}
                    onClick={() => onPick(item.prompt)}
                    className="group inline-flex items-center gap-2 text-xs px-3 py-1.5 border border-[var(--border)] rounded-full bg-[var(--surface)] hover:border-accent hover:bg-accent/5 hover:text-[var(--foreground)] text-[var(--foreground)] transition-colors text-left leading-snug"
                    title={item.prompt}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--secondary)] group-hover:text-accent">
                      {item.label}
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="truncate max-w-[34ch]">{item.prompt}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
