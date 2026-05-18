"use client";

import type { KanbanBoardPayload, KanbanColumn, KanbanCard, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

function tintForColumn(title: string): string {
  const t = title.toLowerCase();
  if (/done|ship|deploy|complete|closed/.test(t)) return "bg-green-500/[0.06] border-green-500/30";
  if (/doing|in[- ]progress|wip|review/.test(t)) return "bg-amber-500/[0.06] border-amber-500/30";
  if (/block|stuck|hold/.test(t)) return "bg-red-500/[0.06] border-red-500/30";
  return "bg-[var(--background)] border-[var(--border)]";
}

function tintHeader(title: string): string {
  const t = title.toLowerCase();
  if (/done|ship|deploy|complete|closed/.test(t)) return "text-green-700 dark:text-green-400";
  if (/doing|in[- ]progress|wip|review/.test(t)) return "text-amber-700 dark:text-amber-400";
  if (/block|stuck|hold/.test(t)) return "text-red-700 dark:text-red-400";
  return "text-[var(--secondary)]";
}

export function KanbanBoardWidget({ payload, actions }: { payload: KanbanBoardPayload; actions?: WidgetAction[] }) {
  const columns = payload?.columns ?? [];
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle="Board" />
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(columns.length, 4))}, minmax(0, 1fr))` }}>
        {columns.map((col) => <ColumnView key={col.id} col={col} />)}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function ColumnView({ col }: { col: KanbanColumn }) {
  const tint = tintForColumn(col.title);
  const headerTint = tintHeader(col.title);
  return (
    <div className={`rounded-lg border ${tint} p-2 min-h-[200px]`}>
      <div className={`flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] font-semibold ${headerTint} mb-2 px-1`}>
        <span>{col.title}</span>
        <span className="opacity-70">· {col.cards.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {col.cards.map((card) => <CardView key={card.id} card={card} />)}
        {col.cards.length === 0 && <div className="text-[11px] text-[var(--secondary)] italic opacity-60 text-center py-3">empty</div>}
      </div>
    </div>
  );
}

function CardView({ card }: { card: KanbanCard }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-sm">
      <div className="text-[12.5px] font-semibold leading-snug text-[var(--foreground)]">{card.title}</div>
      {card.body && <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--secondary)]">{card.body}</div>}
      {((card.tags && card.tags.length > 0) || card.assignee) && (
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {card.tags?.map((t) => (
            <span key={t} className="inline-block rounded-sm bg-accent/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-accent">{t}</span>
          ))}
          {card.assignee && <span className="text-[10px] text-[var(--secondary)]">· @{card.assignee}</span>}
        </div>
      )}
    </div>
  );
}
