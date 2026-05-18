"use client";

import { ChevronDown, Wand2, Brain, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDER_IDS, type ProviderId } from "@/lib/engine/providers";
import { MODEL_INFO, type ModelFamily } from "@/lib/engine/model-info";
import type { OutputFormat } from "@/lib/types/engine-widgets";

export interface ChatSelection {
  providerId: ProviderId;
  useSkill: boolean;
  pipeline: boolean;
  outputFormat: OutputFormat;
}

const FAMILIES: ModelFamily[] = ["Anthropic", "Google", "OpenAI"];

export function selectionToOpts(sel: ChatSelection) {
  return {
    providerId: sel.providerId,
    useSkill: sel.useSkill ?? false,
    pipeline: sel.pipeline ?? false,
    outputFormat: "html" as OutputFormat,
  };
}

interface ModeSelectorProps {
  selection: ChatSelection;
  onChange: (next: ChatSelection) => void;
  disabled?: boolean;
}

export function ModeSelector({ selection, onChange, disabled }: ModeSelectorProps) {
  const active = MODEL_INFO[selection.providerId];
  const useSkill: boolean = selection.useSkill ?? false;
  const pipeline: boolean = selection.pipeline ?? false;

  return (
    <div className="flex flex-col gap-2 text-xs">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--secondary)] font-mono select-none">
          Model
        </div>

        <div className="relative">
          <select
            value={selection.providerId}
            onChange={(e) =>
              onChange({ ...selection, providerId: e.target.value as ProviderId })
            }
            disabled={disabled}
            className={cn(
              "appearance-none rounded-full border border-[var(--border)] bg-[var(--surface)] pl-3 pr-7 py-1 font-medium text-[var(--foreground)] focus:outline-none focus:border-accent cursor-pointer",
              disabled && "opacity-60 pointer-events-none",
            )}
          >
            {FAMILIES.map((family) => (
              <optgroup key={family} label={family}>
                {PROVIDER_IDS.filter((id) => MODEL_INFO[id].family === family).map((id) => (
                  <option key={id} value={id} title={MODEL_INFO[id].bestFor}>
                    {MODEL_INFO[id].label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--secondary)] pointer-events-none" strokeWidth={1.75} />
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...selection, useSkill: !useSkill })}
          disabled={disabled}
          title="Prepend the Frontend Design Skill to the system prompt"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors",
            useSkill
              ? "bg-accent text-white border-accent"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--secondary)] hover:text-[var(--foreground)] hover:border-accent/40",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <Wand2 className="h-3 w-3" strokeWidth={1.75} />
          Skill {useSkill ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...selection, pipeline: !pipeline })}
          disabled={disabled}
          title="Agent: recursive Skill Decision Agent (propose → reflect → commit, 1..4 rounds) picks the widget kind, then a specialist renders it. The reasoning is shown above the widget."
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors",
            pipeline
              ? "bg-accent text-white border-accent"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--secondary)] hover:text-[var(--foreground)] hover:border-accent/40",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <Brain className="h-3 w-3" strokeWidth={1.75} />
          Agent {pipeline ? "ON" : "OFF"}
        </button>

        <div className="ml-auto text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono select-none">
          {active?.family} · {active?.label}
          {useSkill ? " · +skill" : ""}
          {pipeline ? " · agent→specialist" : " · single-call"}
        </div>
      </div>

      {/* "Best for" recommendation line for the active model */}
      <div className="flex items-start gap-1.5 text-[11px] text-[var(--secondary)] leading-relaxed">
        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-accent" strokeWidth={1.75} />
        <span>
          <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--foreground)] mr-1.5">
            Best for
          </span>
          {active.bestFor}
        </span>
      </div>
    </div>
  );
}
