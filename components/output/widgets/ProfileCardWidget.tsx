"use client";

import type { ProfileCardPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetShell } from "./shared";

export function ProfileCardWidget({ payload, actions }: { payload: ProfileCardPayload; actions?: WidgetAction[] }) {
  const initials = payload?.initials ?? deriveInitials(payload?.name);
  const avatarBg = payload?.avatarColor ?? "#EC3B4A";
  const stats = payload?.stats ?? [];
  const profileActions = payload?.actions ?? [];

  return (
    <WidgetShell>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-[22px] font-bold shrink-0"
          style={{ background: avatarBg, fontFamily: "Georgia, serif" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[16px] font-semibold text-[var(--foreground)] leading-snug">{payload?.name}</div>
          {payload?.role && <div className="text-[12px] text-[var(--secondary)] mt-0.5">{payload.role}</div>}
        </div>
      </div>

      {payload?.bio && (
        <p className="text-[13px] text-[var(--foreground)] leading-relaxed mb-3">{payload.bio}</p>
      )}

      {stats.length > 0 && (
        <div
          className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))` }}
        >
          {stats.map((s, i) => (
            <div key={i} className="rounded-md bg-[var(--background)] border border-[var(--border)] p-2.5 text-center">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)]">
                {s.label}
              </div>
              <div className="text-[18px] font-display font-bold text-[var(--foreground)] tabular-nums">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {profileActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profileActions.map((a, i) => (
            <button
              key={i}
              type="button"
              data-bap-prompt={a.prompt}
              className={
                "rounded-md px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer transition-colors " +
                (a.primary
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "border border-[var(--border)] text-[var(--foreground)] bg-[var(--background)] hover:border-accent")
              }
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function deriveInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
