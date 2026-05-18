"use client";

import { useState } from "react";
import { Brain, ChevronDown, AlertCircle, Repeat, Check, DollarSign } from "lucide-react";
import type { AgentDecision, AgentReflection } from "@/lib/engine/agent-runner";

function formatUsd(n: number): string {
  if (n < 0.0001) return "<$0.0001";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/**
 * Renders the Skill Decision Agent's recursive reasoning trace above the widget.
 *
 * Summary line: brain icon + chosen kind + confidence + iteration count + stop reason.
 * Expanded view: Round 1 candidates (ranked) + every reflection round in chronological
 * order + override warning if the runner forced a fallback.
 */
export function AgentDecisionPanel({ decision }: { decision: AgentDecision }) {
  const [open, setOpen] = useState(false);
  const confidencePct = Math.round(decision.confidence * 100);
  const lowConf = decision.confidence < 0.6;
  const stopLabel = STOP_REASON_LABEL[decision.stopReason];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)]/60">
      {/* Summary header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left cursor-pointer hover:bg-[var(--surface)]/60 transition-colors rounded-lg"
      >
        <Brain className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)]">
            Agent chose
          </span>
          <span className="text-[12px] font-semibold text-[var(--foreground)] font-mono">
            {decision.chosen}
          </span>
          <span
            className={
              "px-1.5 py-0.5 rounded text-[10px] font-mono " +
              (lowConf
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : "bg-accent/10 text-accent border border-accent/30")
            }
            title="Agent's self-reported confidence"
          >
            {confidencePct}% conf
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface)] border border-[var(--border)] text-[var(--secondary)]"
            title={`Decision loop ran ${decision.iterations} round${decision.iterations === 1 ? "" : "s"} · stopped because ${stopLabel.tooltip}`}
          >
            <Repeat className="h-2.5 w-2.5" strokeWidth={2} />
            {decision.iterations}× · {stopLabel.short}
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent"
            title={`Agent reasoning cost (excludes the specialist render). ${decision.agentInputTokens} input + ${decision.agentOutputTokens} output tokens across ${decision.iterations} round${decision.iterations === 1 ? "" : "s"}.`}
          >
            <DollarSign className="h-2.5 w-2.5" strokeWidth={2} />
            reasoning {formatUsd(decision.agentCost)}
          </span>
          {decision.overridden && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              title="Runner overrode the agent's pick (low confidence → fell back to chips)"
            >
              <AlertCircle className="h-2.5 w-2.5" strokeWidth={2} />
              overridden
            </span>
          )}
          <span
            className="text-[11px] text-[var(--secondary)] truncate flex-1 min-w-[10ch]"
            title={decision.rationale}
          >
            {decision.rationale}
          </span>
        </div>
        <ChevronDown
          className={
            "h-3.5 w-3.5 text-[var(--secondary)] transition-transform shrink-0 " +
            (open ? "rotate-180" : "")
          }
          strokeWidth={1.75}
        />
      </button>

      {/* Expanded reasoning trace */}
      {open && (
        <div className="border-t border-[var(--border)] px-3.5 py-3 space-y-4">
          {/* Round 1 — Propose */}
          <section>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] mb-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                Round 1
              </span>
              <span>Propose</span>
            </div>
            <div className="space-y-1">
              {decision.round1.candidates.map((c) => {
                const pct = Math.round((c.score ?? 0) * 100);
                const isPicked = c.kind === decision.round1.initial_pick;
                return (
                  <div key={c.kind} className="flex items-start gap-2 text-[11px] leading-snug">
                    <span className="font-mono text-[var(--secondary)] w-10 shrink-0 text-right tabular-nums">
                      {pct}%
                    </span>
                    <span
                      className={
                        "font-mono shrink-0 " +
                        (isPicked
                          ? "text-accent font-semibold"
                          : "text-[var(--foreground)]")
                      }
                    >
                      {c.kind}
                      {isPicked && <span className="ml-1 text-[9px]">★</span>}
                    </span>
                    <span className="text-[var(--secondary)] flex-1 min-w-0">
                      — {c.why}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Every reflection round in chronological order */}
          {decision.reflections.map((r, idx) => (
            <ReflectionSection
              key={r.round}
              reflection={r}
              isLast={idx === decision.reflections.length - 1}
            />
          ))}

          {/* Per-round cost breakdown */}
          {decision.perRoundCost.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                  Cost
                </span>
                <span>Reasoning breakdown</span>
                <span className="ml-auto normal-case tracking-normal text-[var(--foreground)]">
                  total <span className="text-accent font-semibold">{formatUsd(decision.agentCost)}</span>
                </span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                {decision.perRoundCost.map((r) => {
                  const label = r.round === 1 ? "Propose" : `Reflect ${r.round - 1}`;
                  return (
                    <div key={r.round} className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-[var(--secondary)] w-10 shrink-0 text-right">
                        R{r.round}
                      </span>
                      <span className="text-[var(--foreground)] w-20 shrink-0">{label}</span>
                      <span className="text-[var(--secondary)] flex-1 min-w-0">
                        {formatTokens(r.inputTokens)} in · {formatTokens(r.outputTokens)} out
                      </span>
                      <span className="text-[var(--foreground)] font-semibold w-16 text-right">
                        {formatUsd(r.cost)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1.5 text-[10px] text-[var(--secondary)] italic leading-relaxed">
                Reasoning cost only — the specialist call that rendered the widget is billed separately in the usage footer below.
              </div>
            </section>
          )}

          {/* Stop reason summary */}
          <section className="rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--secondary)]">
            <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--foreground)] mr-1.5">
              Stop reason
            </span>
            <span className="font-mono text-accent">{stopLabel.short}</span>
            <span className="ml-2">{stopLabel.tooltip}</span>
          </section>

          {decision.overridden && (
            <section className="rounded border border-amber-500/30 bg-amber-500/[0.06] px-2.5 py-2 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Runner override:</strong> the agent&apos;s final confidence was below
              the 0.55 threshold. Falling back to <span className="font-mono">chips</span> to
              keep the conversation moving with a safe conversational reply.
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ReflectionSection({
  reflection: r,
  isLast,
}: {
  reflection: AgentReflection;
  isLast: boolean;
}) {
  const pct = Math.round(r.confidence * 100);
  return (
    <section>
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--secondary)] mb-1.5">
        <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
          Round {r.round}
        </span>
        <span>Reflect</span>
        {isLast && (
          <span className="ml-auto inline-flex items-center gap-1 text-accent normal-case tracking-normal">
            <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
            committed
          </span>
        )}
      </div>
      <div className="space-y-1 text-[11px] leading-relaxed">
        {r.critique && (
          <div>
            <span className="font-mono text-[var(--secondary)]">critique: </span>
            <span className="text-[var(--foreground)]">{r.critique}</span>
          </div>
        )}
        {r.decision && (
          <div>
            <span className="font-mono text-[var(--secondary)]">decision: </span>
            <span className="text-[var(--foreground)]">{r.decision}</span>
          </div>
        )}
        <div>
          <span className="font-mono text-[var(--secondary)]">chosen: </span>
          <span className="text-accent font-mono font-semibold">{r.chosen}</span>
          <span className="text-[var(--secondary)] ml-2 font-mono">({pct}% conf)</span>
        </div>
      </div>
    </section>
  );
}

const STOP_REASON_LABEL: Record<
  AgentDecision["stopReason"],
  { short: string; tooltip: string }
> = {
  high_confidence: {
    short: "high-conf",
    tooltip: "confidence ≥ 0.85, loop stopped early",
  },
  converged: {
    short: "converged",
    tooltip: "same pick + similar confidence two rounds in a row",
  },
  max_rounds: {
    short: "max-rounds",
    tooltip: "iteration cap (4 rounds) reached without convergence",
  },
  override: {
    short: "override",
    tooltip: "runner forced fallback due to low confidence or invalid output",
  },
};
