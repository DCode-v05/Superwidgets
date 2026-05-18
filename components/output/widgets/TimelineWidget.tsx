"use client";

import type { TimelinePayload, TimelineEvent, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Timeline — vertical chronological list. Date on the left, dot marker,
 * title + body on the right. Different from `stepper`: stepper is a process
 * with status icons; timeline is dated historical events.
 */

const TONE_DOT: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  accent: "bg-accent",
  good: "bg-green-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
  neutral: "bg-[var(--secondary)]",
};

const TONE_DATE: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  accent: "text-accent font-bold",
  good: "text-green-600 dark:text-green-400 font-semibold",
  warn: "text-amber-600 dark:text-amber-400 font-semibold",
  bad: "text-red-600 dark:text-red-400 font-semibold",
  neutral: "text-[var(--secondary)] font-semibold",
};

export function TimelineWidget({
  payload,
  actions,
}: {
  payload: TimelinePayload;
  actions?: WidgetAction[];
}) {
  const events = payload?.events ?? [];

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ?? "Timeline"} />
      <ol className="relative pl-[110px]">
        {/* Vertical line */}
        <span className="absolute left-[94px] top-1 bottom-1 w-px bg-[var(--border)]" aria-hidden />
        {events.map((ev) => {
          const tone = ev.tone ?? "neutral";
          return (
            <li key={ev.id} className="relative pb-4 last:pb-0">
              {/* Date label, right-aligned in the left gutter */}
              <span
                className={
                  "absolute left-[-110px] top-0.5 w-[80px] text-right text-[12px] font-mono tabular-nums " +
                  TONE_DATE[tone]
                }
              >
                {ev.date}
              </span>
              {/* Dot */}
              <span
                className={`absolute left-[-22px] top-1.5 h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]} ring-2 ring-[var(--surface)]`}
                aria-hidden
              />
              {/* Body */}
              <div className="text-[13px] font-semibold leading-snug text-[var(--foreground)]">
                {ev.title}
              </div>
              {ev.body && (
                <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--secondary)]">
                  {ev.body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
