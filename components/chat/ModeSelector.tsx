"use client";

import { ChevronDown, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderId } from "@/lib/engine/providers";

export interface ChatSelection {
  providerId: ProviderId;
  useSkill: boolean;
}

interface ModelOption {
  id: ProviderId;
  label: string;
  family: "Anthropic" | "Google" | "OpenAI";
}

const MODEL_OPTIONS: ModelOption[] = [
  { id: "sonnet", label: "Sonnet 4.6", family: "Anthropic" },
  { id: "haiku", label: "Haiku 4.5", family: "Anthropic" },
  { id: "gemini-3", label: "Gemini 3 Flash (preview)", family: "Google" },
  { id: "gemini-3.1", label: "Gemini 3.1 Flash Lite (preview)", family: "Google" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 Mini (UI-tuned)", family: "OpenAI" },
  { id: "gpt-5.4", label: "GPT-5.4 (UI flagship)", family: "OpenAI" },
  { id: "gpt-5.5", label: "GPT-5.5 (premium)", family: "OpenAI" },
];

const FAMILIES: Array<ModelOption["family"]> = ["Anthropic", "Google", "OpenAI"];

export function selectionToOpts(sel: ChatSelection) {
  return {
    providerId: sel.providerId,
    useSkill: sel.useSkill ?? false,
  };
}

interface ModeSelectorProps {
  selection: ChatSelection;
  onChange: (next: ChatSelection) => void;
  disabled?: boolean;
}

export function ModeSelector({ selection, onChange, disabled }: ModeSelectorProps) {
  const active = MODEL_OPTIONS.find((m) => m.id === selection.providerId);
  const useSkill: boolean = selection.useSkill ?? false;

  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
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
              {MODEL_OPTIONS.filter((m) => m.family === family).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
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

      <div className="ml-auto text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono select-none">
        {active?.family} · {active?.label}
        {useSkill ? " · +skill" : ""}
      </div>
    </div>
  );
}
