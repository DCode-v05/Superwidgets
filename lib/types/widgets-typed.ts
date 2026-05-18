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
  // Original 10
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
  // Teammate's 10 (Diagrams / Charts / Dashboards / Interactive)
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
  // My 2 unique ones
  | "timeline"
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

// ---------- DIAGRAMS (teammate) ----------

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
  direction?: "LR" | "TB";
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface VennSet {
  id: string;
  label: string;
  color?: string;
}
export interface VennIntersection {
  /** Array of set ids in this intersection — order doesn't matter. */
  sets: string[];
  items: string[];
}
export interface VennDiagramPayload {
  title?: string;
  /** 2 or 3 sets — those are the only Venn configurations we render. */
  sets: VennSet[];
  intersections: VennIntersection[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}
export interface MindMapPayload {
  title?: string;
  root: MindMapNode;
}

// ---------- CHARTS (teammate) ----------

export interface PieSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}
export interface PieChartPayload {
  title?: string;
  subtitle?: string;
  slices: PieSlice[];
}

export interface HeatmapPayload {
  title?: string;
  subtitle?: string;
  /** Column headers (e.g. hours of the day). */
  cols: string[];
  /** Row labels (e.g. days of the week). */
  rows: string[];
  /** 2D matrix: cells[row][col] — same dimensions as rows × cols. */
  cells: number[][];
  /** Display unit for the legend ("visits", "%", ...). */
  unit?: string;
}

// ---------- DASHBOARDS (teammate) ----------

export type KpiTone = "good" | "warn" | "bad" | "neutral";
export interface KpiTile {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: KpiTone;
  spark?: number[];
}
export interface KpiDashboardPayload {
  title?: string;
  subtitle?: string;
  tiles: KpiTile[];
}

export interface ProfileStat {
  label: string;
  value: string;
}
export interface ProfileCardPayload {
  name: string;
  role?: string;
  bio?: string;
  /** Initials shown as the avatar — renderer derives from name if missing. */
  initials?: string;
  /** Background color for the avatar tile. */
  avatarColor?: string;
  stats?: ProfileStat[];
  actions?: Array<{ label: string; prompt: string; primary?: boolean }>;
}

export interface KanbanCard {
  id: string;
  title: string;
  body?: string;
  tags?: string[];
  assignee?: string;
}
export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}
export interface KanbanBoardPayload {
  title?: string;
  columns: KanbanColumn[];
}

// ---------- INTERACTIVE (teammate) ----------

export interface CalculatorInput {
  id: string;
  label: string;
  /** number = numeric input · slider = range input · select = dropdown */
  type: "number" | "slider";
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}
export interface CalculatorOutput {
  id: string;
  label: string;
  /** JS-like expression referencing input ids (e.g. "bill * (tip / 100)"). */
  formula: string;
  unit?: string;
  precision?: number;
}
export interface CalculatorPayload {
  title?: string;
  subtitle?: string;
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  /** id of the correct option. */
  correctId: string;
  /** Shown after the user picks. */
  explanation?: string;
}
export interface QuizPayload {
  title?: string;
  subtitle?: string;
  questions: QuizQuestion[];
}

// ---------- KEPT FROM MY 5 (unique) ----------

export interface TimelineEvent {
  id: string;
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

export interface PricingFeature {
  label: string;
  included: boolean;
  note?: string;
}
export interface PricingTier {
  id: string;
  name: string;
  price: string;
  tagline?: string;
  features: PricingFeature[];
  cta: { label: string; prompt: string };
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
