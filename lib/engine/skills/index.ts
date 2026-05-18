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
// Teammate's 10
import { SKILL as FLOWCHART } from "./flowchart";
import { SKILL as VENN_DIAGRAM } from "./venn_diagram";
import { SKILL as MIND_MAP } from "./mind_map";
import { SKILL as PIE_CHART } from "./pie_chart";
import { SKILL as HEATMAP } from "./heatmap";
import { SKILL as KPI_DASHBOARD } from "./kpi_dashboard";
import { SKILL as PROFILE_CARD } from "./profile_card";
import { SKILL as KANBAN_BOARD } from "./kanban_board";
import { SKILL as CALCULATOR } from "./calculator";
import { SKILL as QUIZ } from "./quiz";
// My 2 unique
import { SKILL as TIMELINE } from "./timeline";
import { SKILL as PRICING_TABLE } from "./pricing_table";
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
  | "inline_banner"
  | "flowchart"
  | "venn_diagram"
  | "mind_map"
  | "pie_chart"
  | "heatmap"
  | "kpi_dashboard"
  | "profile_card"
  | "kanban_board"
  | "calculator"
  | "quiz"
  | "timeline"
  | "pricing_table";

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
  "flowchart",
  "venn_diagram",
  "mind_map",
  "pie_chart",
  "heatmap",
  "kpi_dashboard",
  "profile_card",
  "kanban_board",
  "calculator",
  "quiz",
  "timeline",
  "pricing_table",
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
  flowchart: FLOWCHART,
  venn_diagram: VENN_DIAGRAM,
  mind_map: MIND_MAP,
  pie_chart: PIE_CHART,
  heatmap: HEATMAP,
  kpi_dashboard: KPI_DASHBOARD,
  profile_card: PROFILE_CARD,
  kanban_board: KANBAN_BOARD,
  calculator: CALCULATOR,
  quiz: QUIZ,
  timeline: TIMELINE,
  pricing_table: PRICING_TABLE,
};

/**
 * Compose the specialist system prompt for a chosen widget intent.
 * Order: optional Frontend Design Skill → SKILL_BASE (shared contract) → widget specialist.
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
