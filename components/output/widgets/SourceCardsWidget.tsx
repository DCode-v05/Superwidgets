"use client";

import { ExternalLink } from "lucide-react";
import type { SourceCardsPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Source cards — citation grid. The ONLY widget allowed to render outbound
 * links. target="_blank" + rel="noopener noreferrer" are enforced here (the
 * model can't break this even if it forgets to ask for them).
 */
export function SourceCardsWidget({
  payload,
  actions,
}: {
  payload: SourceCardsPayload;
  actions?: WidgetAction[];
}) {
  const sources = payload?.sources ?? [];
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title ?? "Sources"} subtitle="Citations" />
      <div className="grid grid-cols-1 gap-2.5">
        {sources.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5 transition-colors hover:border-accent/60 no-underline"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent">
                {s.domain ?? safeDomain(s.url)}
              </span>
              <ExternalLink className="h-3 w-3 text-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
            </div>
            <div className="text-[14px] font-semibold leading-snug text-[var(--foreground)]">
              {s.title}
            </div>
            {s.snippet && (
              <div className="text-[12px] leading-relaxed text-[var(--secondary)]">
                {s.snippet}
              </div>
            )}
          </a>
        ))}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
