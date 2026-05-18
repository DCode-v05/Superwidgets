/**
 * Typed widget contract — the "registry-of-React-components" architecture.
 *
 * In `outputFormat: "typed"` mode the model emits one or more typed widget
 * directives instead of raw HTML or TSX:
 *
 *   <ui-widget kind="chart" id="wgt_1">
 *     { "type": "bar", "data": [...], "x_key": "month", "y_keys": ["revenue"] }
 *   </ui-widget>
 *
 * The widget-parser-typed parses these into TypedWidget objects. The frontend
 * dispatches each one through the renderer registry to a dedicated React
 * component (no DOMPurify, no react-live — pure typed JSX with React props).
 */

export type WidgetKind =
  | "chips"
  | "decision_card"
  | "confirm_card"
  | "stepper"
  | "checklist"
  | "source_cards"
  | "table"
  | "chart"
  | "code_block"
  | "inline_banner"
  // New: visual / structured widgets added in v2 of the catalog
  | "flowchart"
  | "kpi_tiles"
  | "timeline"
  | "kanban"
  | "pricing_table";

export const WIDGET_KINDS: WidgetKind[] = [
  "chips",
  "decision_card",
  "confirm_card",
  "stepper",
  "checklist",
  "source_cards",
  "table",
  "chart",
  "code_block",
  "inline_banner",
  "flowchart",
  "kpi_tiles",
  "timeline",
  "kanban",
  "pricing_table",
];

export function isWidgetKind(v: unknown): v is WidgetKind {
  return typeof v === "string" && (WIDGET_KINDS as string[]).includes(v);
}

/** Generic action attached to any widget — click sends `prompt` as next turn. */
export interface WidgetAction {
  id: string;
  label: string;
  prompt: string;
  confirm?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

// ---------- per-widget payloads ----------

export interface ChipsPayload {
  chips: Array<{ id: string; label: string; prompt: string }>;
}

export interface DecisionCardOption {
  id: string;
  title: string;
  subtitle?: string;
  pros?: string[];
  cons?: string[];
  cta: { label: string; prompt: string };
}
export interface DecisionCardPayload {
  question?: string;
  options: DecisionCardOption[];
}

export interface ConfirmCardPayload {
  title: string;
  body?: string;
  proceed: { label: string; prompt: string };
  cancel?: { label: string; prompt: string };
  tone?: "danger" | "neutral";
}

export interface StepperPayload {
  steps: Array<{
    id: string;
    title: string;
    body?: string;
    status?: "todo" | "doing" | "done";
  }>;
}

export interface ChecklistPayload {
  title?: string;
  items: Array<{ id: string; label: string; description?: string; checked?: boolean }>;
}

export interface SourceCard {
  id: string;
  url: string;
  title: string;
  snippet?: string;
  domain?: string;
}
export interface SourceCardsPayload {
  title?: string;
  sources: SourceCard[];
}

export type TableCellType = "string" | "number" | "badge" | "boolean";
export interface TableColumn {
  id: string;
  header: string;
  type?: TableCellType;
  align?: "left" | "right" | "center";
}
export interface TablePayload {
  title?: string;
  subtitle?: string;
  columns: TableColumn[];
  rows: Record<string, string | number | boolean>[];
  /** Per-row highlight: keys of `rows[i]` that should be visually emphasized. */
  highlight?: Array<{ row: number; columns: string[] }>;
}

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
}
export interface ChartPayload {
  title?: string;
  subtitle?: string;
  type: "bar" | "line" | "area";
  x_key: string;
  series: ChartSeries[];
  data: Array<Record<string, string | number>>;
  y_unit?: string;
}

export interface CodeBlockPayload {
  language: string;
  filename?: string;
  code: string;
}

export type BannerTone = "success" | "warn" | "error" | "info";
export interface InlineBannerPayload {
  tone: BannerTone;
  title: string;
  body?: string;
}

// ---------- v2 visual widgets ----------

export type FlowchartNodeShape = "rect" | "diamond" | "round" | "pill";
export interface FlowchartNode {
  id: string;
  label: string;
  shape?: FlowchartNodeShape;
  tone?: "default" | "accent" | "good" | "warn" | "bad";
}
export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}
export interface FlowchartPayload {
  title?: string;
  /** Optional layout hint — auto-laid-out left-to-right if missing. */
  direction?: "LR" | "TB";
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export type KpiTone = "good" | "warn" | "bad" | "neutral";
export interface KpiTile {
  id: string;
  label: string;
  value: string;
  /** "+8%", "-2", "↑ 12 / wk" — model owns formatting. */
  delta?: string;
  /** Visual tone for the delta + accent bar. */
  tone?: KpiTone;
  /** Optional sparkline: 4–24 numeric values. Rendered as a tiny inline SVG. */
  spark?: number[];
}
export interface KpiTilesPayload {
  title?: string;
  subtitle?: string;
  tiles: KpiTile[];
}

export interface TimelineEvent {
  id: string;
  /** Free-form date string — model picks the format ("Q1 2024", "Mar 15", "2024"). */
  date: string;
  title: string;
  body?: string;
  tone?: "accent" | "good" | "warn" | "bad" | "neutral";
}
export interface TimelinePayload {
  title?: string;
  subtitle?: string;
  events: TimelineEvent[];
}

export interface KanbanCard {
  id: string;
  title: string;
  body?: string;
  tags?: string[];
  /** Optional assignee name; shown as a small chip. */
  assignee?: string;
}
export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}
export interface KanbanPayload {
  title?: string;
  columns: KanbanColumn[];
}

export interface PricingFeature {
  label: string;
  included: boolean;
  /** Optional one-line note (e.g. "first 1,000 free"). */
  note?: string;
}
export interface PricingTier {
  id: string;
  name: string;
  /** Display string — model owns currency/period ("$0", "$29/mo", "Custom"). */
  price: string;
  /** Short pitch line under the price. */
  tagline?: string;
  features: PricingFeature[];
  cta: { label: string; prompt: string };
  /** If true, this tier is visually highlighted as the recommended pick. */
  recommended?: boolean;
}
export interface PricingTablePayload {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
}

// ---------- envelope ----------

export interface TypedWidget {
  id: string;
  kind: WidgetKind;
  payload: unknown; // narrowed by the renderer registry
  actions?: WidgetAction[];
}
