"use client";

import type { ChipsPayload } from "@/lib/types/widgets-typed";

/**
 * Chips — row of clickable suggestions. The simplest widget. Each chip's
 * `prompt` becomes the next user turn on click (via the global delegated
 * handler in ChatShell that listens for `data-bap-prompt`).
 */
export function ChipsWidget({ payload }: { payload: ChipsPayload }) {
  if (!payload?.chips?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {payload.chips.map((c) => (
        <button
          key={c.id}
          type="button"
          data-bap-prompt={c.prompt}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition-colors hover:border-accent hover:text-accent cursor-pointer"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
