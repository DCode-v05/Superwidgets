import { SKILL_BASE } from "./base";
import { SKILL as CHIPS } from "./chips";
import { SKILL as DECISION_CARD } from "./decision_card";
import { SKILL as CONFIRM_CARD } from "./confirm_card";
import { SKILL as STEPPER } from "./stepper";
import { SKILL as CHECKLIST } from "./checklist";
import { SKILL as TABLE } from "./table";
import { SKILL as CHART } from "./chart";
import { SKILL as SOURCE_CARDS } from "./source_cards";
import { SKILL as CODE_BLOCK } from "./code_block";
import { SKILL as INLINE_BANNER } from "./inline_banner";
import { FRONTEND_DESIGN_SKILL } from "../frontend-design-skill";

export type WidgetIntent =
  | "chips"
  | "decision_card"
  | "confirm_card"
  | "stepper"
  | "checklist"
  | "table"
  | "chart"
  | "source_cards"
  | "code_block"
  | "inline_banner";

export const WIDGET_INTENTS: WidgetIntent[] = [
  "chips",
  "decision_card",
  "confirm_card",
  "stepper",
  "checklist",
  "table",
  "chart",
  "source_cards",
  "code_block",
  "inline_banner",
];

const SKILLS: Record<WidgetIntent, string> = {
  chips: CHIPS,
  decision_card: DECISION_CARD,
  confirm_card: CONFIRM_CARD,
  stepper: STEPPER,
  checklist: CHECKLIST,
  table: TABLE,
  chart: CHART,
  source_cards: SOURCE_CARDS,
  code_block: CODE_BLOCK,
  inline_banner: INLINE_BANNER,
};

/**
 * Compose the specialist system prompt for a chosen widget intent.
 * Order: optional Frontend Design Skill → SKILL_BASE (shared contract) → widget specialist.
 * The specialist gets the cross-cutting rules first, then its widget-specific guidance.
 */
export function composeSpecialistPrompt(
  intent: WidgetIntent,
  useDesignSkill: boolean,
): string {
  const designPrefix = useDesignSkill
    ? FRONTEND_DESIGN_SKILL + "\n\n---\n\n"
    : "";
  return designPrefix + SKILL_BASE + "\n\n" + SKILLS[intent];
}

export function isWidgetIntent(value: unknown): value is WidgetIntent {
  return typeof value === "string" && WIDGET_INTENTS.includes(value as WidgetIntent);
}
