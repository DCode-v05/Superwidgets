"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, CheckCircle2, AlertTriangle, Loader2, Hammer, Send } from "lucide-react";
import type { TraceStep } from "@/lib/types/engine-widgets";
import { cn } from "@/lib/utils";

interface AgentTraceProps {
  steps: TraceStep[];
  isStreaming?: boolean;
}

export function AgentTrace({ steps, isStreaming }: AgentTraceProps) {
  const [open, setOpen] = useState(false);

  if (steps.length === 0 && !isStreaming) return null;

  const iterations = Math.max(...steps.map((s) => s.iteration), 0);
  const errored = steps.filter((s) => s.isError).length;
  const headerLabel = isStreaming && steps.length === 0
    ? "Agent thinking…"
    : `Agent loop · ${steps.length} step${steps.length === 1 ? "" : "s"} · ${iterations} iter`;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        ) : (
          <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
        )}
        <Wrench className="h-3 w-3" strokeWidth={1.75} />
        <span className="flex-1 text-left">{headerLabel}</span>
        {errored > 0 && (
          <span className="text-amber-500 normal-case tracking-normal">
            {errored} retry
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-3 py-2 space-y-2 max-h-96 overflow-y-auto">
          {steps.map((step, i) => (
            <TraceRow key={i} step={step} />
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] pt-1">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
              <span>loop running…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function iconForTool(name: string) {
  switch (name) {
    case "build_widget":
      return <Hammer className="h-3 w-3" strokeWidth={1.75} />;
    case "submit_widget":
      return <Send className="h-3 w-3" strokeWidth={1.75} />;
    default:
      return <Wrench className="h-3 w-3" strokeWidth={1.75} />;
  }
}

function phaseLabelForTool(name: string): string {
  switch (name) {
    case "build_widget":
      return "BUILD";
    case "submit_widget":
      return "SUBMIT";
    default:
      return "TOOL";
  }
}

function TraceRow({ step }: { step: TraceStep }) {
  const pending = step.resultSummary === "";
  return (
    <div className="text-[11px] font-mono leading-snug border-l-2 border-[var(--border)] pl-3">
      <div className="flex items-baseline gap-2">
        <span className="text-[var(--secondary)] opacity-60 select-none">
          {String(step.iteration).padStart(2, "0")}
        </span>
        <span className="text-[var(--secondary)] opacity-60 select-none text-[9px]">
          {phaseLabelForTool(step.toolName)}
        </span>
        <span className="text-accent flex items-center gap-1">
          {iconForTool(step.toolName)}
          <span className="font-semibold">{step.toolName}</span>
        </span>
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin text-[var(--secondary)] translate-y-0.5" strokeWidth={1.75} />
        ) : step.isError ? (
          <AlertTriangle className="h-3 w-3 text-amber-500 translate-y-0.5" strokeWidth={1.75} />
        ) : (
          <CheckCircle2 className="h-3 w-3 text-emerald-500/70 translate-y-0.5" strokeWidth={1.75} />
        )}
      </div>
      <div className="pl-1 mt-1 text-[var(--secondary)] break-words">
        <span className="opacity-60">in: </span>
        {step.inputSummary}
      </div>
      {!pending && (
        <div
          className={cn(
            "pl-1 mt-0.5 break-words whitespace-pre-wrap",
            step.isError ? "text-amber-600 dark:text-amber-400" : "text-[var(--secondary)]",
          )}
        >
          <span className="opacity-60">out: </span>
          {step.resultSummary}
        </div>
      )}
    </div>
  );
}
