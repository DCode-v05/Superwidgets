/**
 * Phase 2 — CHOOSE.
 *
 * The agent commits to ONE widget skill from the catalog. This tool verifies
 * the choice (must exist), bundles GATHER (returns the design note + a
 * short reference example so the agent has everything it needs to start
 * implementing), and surfaces any phase-specific reminders.
 *
 * Verification baked in:
 *   - chosen widget is in WIDGET_INTENTS
 *   - reasoning is provided (forces the model to articulate the choice)
 */

import { getSkill, type WidgetIntent } from "./widget-library";

export interface ChoiceInput {
  widget: string;
  reasoning: string;
}

export interface ChoiceResult {
  ok: boolean;
  issues: string[];
  chosen: WidgetIntent | null;
  design_note: string | null;
  reference_html: string | null;
  reminders: string[];
}

export function chooseWidget(input: ChoiceInput): ChoiceResult {
  const issues: string[] = [];

  const widget = String(input.widget ?? "").trim();
  const reasoning = String(input.reasoning ?? "").trim();

  if (!widget) {
    issues.push(`"widget" is required.`);
  }
  if (!reasoning) {
    issues.push(`"reasoning" is required — briefly explain why this widget fits.`);
  }

  const skill = getSkill(widget);
  if (widget && !skill) {
    issues.push(`Unknown widget "${widget}". Must be one of the 20 catalog skills.`);
  }

  if (!skill) {
    return {
      ok: false,
      issues,
      chosen: null,
      design_note: null,
      reference_html: null,
      reminders: [],
    };
  }

  const reminders: string[] = [];
  if (skill.needsInteractivity) {
    reminders.push(
      `This widget uses <script>${skill.intent === "quiz" ? " and <form>" : ""}. Wrap script in IIFE, ` +
        `give the root element a unique id="bap-w-...", use addEventListener (no on* attrs), ` +
        `no fetch/XHR/eval/document.write.`,
    );
    if (skill.intent === "quiz") {
      reminders.push(`Form submit handler MUST call e.preventDefault() at the top.`);
    }
  }
  if (skill.intent === "source_cards") {
    reminders.push(`source_cards is the ONLY widget where <a href> is allowed.`);
  }
  if (skill.intent === "confirm_card") {
    reminders.push(`The confirm/proceed button MUST have data-bap-confirm.`);
  }

  return {
    ok: true,
    issues: [],
    chosen: skill.intent as WidgetIntent,
    design_note: skill.designNote,
    reference_html: skill.html,
    reminders,
  };
}
