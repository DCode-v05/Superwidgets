"use client";

import { Check, X } from "lucide-react";
import type { PricingTablePayload, PricingTier, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Pricing table — tiered SaaS pricing with a "Recommended" tier visually
 * highlighted. Distinct from generic `table` (it's not a feature matrix —
 * it's a vertical-card sales surface) and from `decision_card` (pricing
 * forces a specific structure: tier name + price + feature✓✗ + CTA).
 */

export function PricingTableWidget({
  payload,
  actions,
}: {
  payload: PricingTablePayload;
  actions?: WidgetAction[];
}) {
  const tiers = payload?.tiers ?? [];
  const cols = Math.max(1, Math.min(tiers.length, 4));

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title ?? "Pricing"} subtitle={payload?.subtitle ?? "Plans"} />
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function TierCard({ tier }: { tier: PricingTier }) {
  const recommended = tier.recommended === true;
  return (
    <div
      className={
        "relative flex flex-col rounded-xl border-2 p-4 " +
        (recommended
          ? "border-accent bg-accent/[0.04] shadow-[0_6px_18px_rgba(236,59,74,0.10)]"
          : "border-[var(--border)] bg-[var(--background)]")
      }
    >
      {recommended && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
          Recommended
        </div>
      )}

      <div
        className={
          "text-[11px] font-mono uppercase tracking-[0.15em] font-semibold " +
          (recommended ? "text-accent" : "text-[var(--secondary)]")
        }
      >
        {tier.name}
      </div>

      <div className="mt-2 font-display text-[28px] font-bold leading-none tabular-nums text-[var(--foreground)]">
        {tier.price}
      </div>

      {tier.tagline && (
        <div className="mt-1.5 text-[12px] text-[var(--secondary)]">{tier.tagline}</div>
      )}

      <ul className="flex-1 list-none p-0 mt-3 mb-3 space-y-1.5">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
            {f.included ? (
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600 dark:text-green-400" strokeWidth={2.5} />
            ) : (
              <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--secondary)] opacity-50" strokeWidth={2} />
            )}
            <span className={f.included ? "text-[var(--foreground)]" : "text-[var(--secondary)] line-through"}>
              {f.label}
              {f.note && <span className="opacity-70"> — {f.note}</span>}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-bap-prompt={tier.cta.prompt}
        className={
          "w-full rounded-md py-2 text-[12px] font-semibold cursor-pointer transition-colors " +
          (recommended
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:border-accent")
        }
      >
        {tier.cta.label}
      </button>
    </div>
  );
}
