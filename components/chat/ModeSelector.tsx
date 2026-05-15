"use client";

import { Sparkles, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderId } from "@/lib/engine/providers";

export type Mode = "anthropic" | "other";
export type AnthropicSubModel = "sonnet" | "haiku";
export type OtherSubModel =
  | "gemini-2.5"
  | "gemini-3"
  | "llama"
  | "gpt-5.4-mini"
  | "gpt-5.4";

export interface ModeSelection {
  mode: Mode;
  anthropicSub: AnthropicSubModel;
  otherSub: OtherSubModel;
}

const ANTHROPIC_LABELS: Record<AnthropicSubModel, string> = {
  sonnet: "Sonnet 4.6",
  haiku: "Haiku 4.5",
};

const OTHER_LABELS: Record<OtherSubModel, string> = {
  "gemini-2.5": "Gemini 2.5 Flash",
  "gemini-3": "Gemini 3 Flash (preview)",
  "gpt-5.4-mini": "GPT-5.4 Mini",
  "gpt-5.4": "GPT-5.4",
  llama: "Llama 3.3 70B (Groq)",
};

const STATUS_CAPTION: Record<ProviderId, string> = {
  sonnet: "Sonnet 4.6 · cached",
  haiku: "Haiku 4.5 · cached",
  "gemini-2.5": "Gemini 2.5 · skill prepended",
  "gemini-3": "Gemini 3 (preview) · skill prepended",
  "gpt-5.4-mini": "GPT-5.4 Mini · skill · auto-cache",
  "gpt-5.4": "GPT-5.4 · skill · auto-cache",
  llama: "Llama · skill · no cache",
};

export function selectionToProvider(
  sel: ModeSelection,
): { providerId: ProviderId; useSkill: boolean } {
  if (sel.mode === "anthropic") {
    return { providerId: sel.anthropicSub as ProviderId, useSkill: false };
  }
  return { providerId: sel.otherSub as ProviderId, useSkill: true };
}

interface ModeSelectorProps {
  selection: ModeSelection;
  onChange: (next: ModeSelection) => void;
  disabled?: boolean;
}

export function ModeSelector({ selection, onChange, disabled }: ModeSelectorProps) {
  const activeProviderId = selectionToProvider(selection).providerId;

  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--secondary)] font-mono select-none">
        Mode
      </div>

      <div
        className={cn(
          "inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        <button
          type="button"
          onClick={() => onChange({ ...selection, mode: "anthropic" })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
            selection.mode === "anthropic"
              ? "bg-accent text-white"
              : "text-[var(--secondary)] hover:text-[var(--foreground)]",
          )}
        >
          <Sparkles className="h-3 w-3" strokeWidth={1.75} />
          Anthropic
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...selection, mode: "other" })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
            selection.mode === "other"
              ? "bg-accent text-white"
              : "text-[var(--secondary)] hover:text-[var(--foreground)]",
          )}
        >
          <Zap className="h-3 w-3" strokeWidth={1.75} />
          Other + Skill
        </button>
      </div>

      {selection.mode === "anthropic" ? (
        <SubSelect
          value={selection.anthropicSub}
          options={ANTHROPIC_LABELS}
          onChange={(v) => onChange({ ...selection, anthropicSub: v as AnthropicSubModel })}
          disabled={disabled}
        />
      ) : (
        <SubSelect
          value={selection.otherSub}
          options={OTHER_LABELS}
          onChange={(v) => onChange({ ...selection, otherSub: v as OtherSubModel })}
          disabled={disabled}
        />
      )}

      <div className="ml-auto text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono select-none">
        {STATUS_CAPTION[activeProviderId]}
      </div>
    </div>
  );
}

interface SubSelectProps<K extends string> {
  value: K;
  options: Record<K, string>;
  onChange: (next: K) => void;
  disabled?: boolean;
}

function SubSelect<K extends string>({ value, options, onChange, disabled }: SubSelectProps<K>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as K)}
        disabled={disabled}
        className={cn(
          "appearance-none rounded-full border border-[var(--border)] bg-[var(--surface)] pl-3 pr-7 py-1 font-medium text-[var(--foreground)] focus:outline-none focus:border-accent cursor-pointer",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        {(Object.entries(options) as Array<[K, string]>).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--secondary)] pointer-events-none" strokeWidth={1.75} />
    </div>
  );
}
