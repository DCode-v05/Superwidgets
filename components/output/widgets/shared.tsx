"use client";

import type { WidgetAction } from "@/lib/types/widgets-typed";

/**
 * Action chip row — appears at the bottom of every widget that opts in.
 * Clicking sends `action.prompt` back as the next user turn via the global
 * `data-bap-prompt` delegation in ChatShell.
 */
export function ActionChips({ actions }: { actions?: WidgetAction[] }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-black/5 dark:border-white/10">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          data-bap-prompt={a.prompt}
          {...(a.confirm ? { "data-bap-confirm": "" } : {})}
          className={
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer " +
            (a.variant === "danger"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/40 hover:bg-red-500/15"
              : a.variant === "primary"
                ? "bg-accent text-white border border-accent hover:bg-accent/90"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--secondary)] hover:text-accent hover:border-accent/40")
          }
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

/** Widget chrome — every typed widget renders into this card. */
export function WidgetShell({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border bg-[var(--surface)] " +
        (accent ? "border-accent/40" : "border-[var(--border)]") +
        " px-5 py-4"
      }
    >
      {children}
    </div>
  );
}

export function WidgetHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="mb-3">
      {subtitle && (
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] mb-0.5">
          {subtitle}
        </div>
      )}
      {title && (
        <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)] leading-tight">
          {title}
        </h3>
      )}
    </div>
  );
}
