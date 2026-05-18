/**
 * The widget skill catalog.
 *
 * Each widget intent is treated as an individual SKILL belonging to the
 * mini-bap agent — analogous to entries in engine-peripherals'
 * utility_directory user_skills table. The classify → choose flow picks
 * one skill per turn based on the user's prompt.
 *
 * `keywords` and `needsInteractivity` drive the classifier's suggestion
 * list. `designNote` is what the agent reads after choosing.
 */

export interface WidgetSkill {
  intent: string;
  /** One-line description of when this skill applies. */
  appliesWhen: string;
  /** Lowercase keyword set the classifier matches against the prompt. */
  keywords: string[];
  /** True if this widget needs <script> or <form> to be useful. */
  needsInteractivity: boolean;
  /** Family bucket — used for the system prompt's intent table grouping. */
  family: "static" | "diagram" | "chart" | "dashboard" | "interactive";
  /** Design note the agent reads in the CHOOSE phase. */
  designNote: string;
  /** Reference HTML — short, varied. NOT a template to copy. */
  html: string;
}

export const WIDGET_INTENTS = [
  "chips", "decision_card", "confirm_card", "stepper", "checklist",
  "table", "chart", "source_cards", "code_block", "inline_banner",
  "flowchart", "venn_diagram", "mind_map",
  "pie_chart", "heatmap",
  "kpi_dashboard", "profile_card", "kanban_board",
  "calculator", "quiz",
] as const;

export type WidgetIntent = (typeof WIDGET_INTENTS)[number];

const SKILLS: Record<WidgetIntent, WidgetSkill> = {
  chips: {
    intent: "chips",
    appliesWhen: "Conversational reply or disambiguation",
    keywords: ["hi", "hello", "help", "what", "suggest", "options"],
    needsInteractivity: false,
    family: "static",
    designNote: "Row of 3–5 follow-up pills, each with data-bap-prompt. Compact.",
    html: `<div style="background:#1b1f2a;color:#e7eaf3;padding:14px 16px;border-radius:14px;display:flex;flex-wrap:wrap;gap:8px;font-family:ui-sans-serif">
  <button data-bap-prompt="Tell me more" style="background:#262c3a;color:#e7eaf3;border:1px solid #353c4d;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer">Tell me more</button>
</div>`,
  },
  decision_card: {
    intent: "decision_card",
    appliesWhen: "User must pick between 2–4 options with tradeoffs",
    keywords: ["choose", "decide", "vs", "versus", "pick", "should i", "or", "tradeoff"],
    needsInteractivity: false,
    family: "static",
    designNote: "Two-column comparison. Color/weight differentiates the recommended option.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;font-family:Georgia,serif">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="border:1px solid #333;padding:14px;border-radius:8px"><div style="font-size:11px;color:#999">Option A</div><button data-bap-prompt="Choose A" style="margin-top:8px;width:100%;background:#EC3B4A;color:#fff;border:0;padding:8px;border-radius:6px">Choose</button></div>
    <div style="border:1px solid #333;padding:14px;border-radius:8px"><div style="font-size:11px;color:#999">Option B</div><button data-bap-prompt="Choose B" style="margin-top:8px;width:100%;background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;padding:8px;border-radius:6px">Choose</button></div>
  </div>
</div>`,
  },
  confirm_card: {
    intent: "confirm_card",
    appliesWhen: "Destructive / irreversible action",
    keywords: ["delete", "remove", "drop", "destroy", "send", "publish", "confirm", "irreversible"],
    needsInteractivity: false,
    family: "static",
    designNote: "Clear question + Confirm/Cancel. Confirm button MUST have data-bap-confirm.",
    html: `<div style="background:#2a1a1a;color:#f4e8e8;border-left:4px solid #EC3B4A;border-radius:10px;padding:18px;font-family:ui-sans-serif">
  <p style="margin:0 0 16px">Delete X? Cannot be undone.</p>
  <button data-bap-prompt="Confirmed delete" data-bap-confirm style="background:#EC3B4A;color:#fff;border:0;padding:9px 16px;border-radius:6px">Delete</button>
</div>`,
  },
  stepper: {
    intent: "stepper",
    appliesWhen: "Multi-step plan or process",
    keywords: ["steps", "plan", "process", "how to", "guide", "walk through", "onboard"],
    needsInteractivity: false,
    family: "static",
    designNote: "3–6 numbered steps with a current marker. Vertical, numbered circles.",
    html: `<div style="background:#0d1320;color:#e9eef7;border-radius:14px;padding:22px;font-family:ui-monospace">
  <ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px">
    <li style="display:flex;gap:12px"><span style="background:#7dd3fc;color:#0d1320;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">1</span><div>Step</div></li>
  </ol>
</div>`,
  },
  checklist: {
    intent: "checklist",
    appliesWhen: "List of items to review or tick off",
    keywords: ["checklist", "list", "review", "items", "verify list", "pre-flight"],
    needsInteractivity: false,
    family: "static",
    designNote: "List with ✓/□ glyphs. Dense. Read-only review surface.",
    html: `<div style="background:#fff7e6;color:#1f1410;border-radius:10px;padding:18px;font-family:Georgia,serif">
  <ul style="list-style:none;padding:0;margin:0;line-height:1.9"><li>✓ Done</li><li>□ Pending</li></ul>
</div>`,
  },
  table: {
    intent: "table",
    appliesWhen: "Tabular comparison or feature matrix",
    keywords: ["table", "matrix", "compare", "feature", "spec", "rows", "columns"],
    needsInteractivity: false,
    family: "static",
    designNote: "Compact grid. ≤ 4 columns. Highlight winners per row.",
    html: `<div style="background:#fafafa;color:#111;border-radius:10px;padding:18px;font-family:ui-sans-serif;border:1px solid #e5e5e5">
  <table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#111;color:#fff"><th style="padding:8px">A</th><th style="padding:8px">B</th></tr></thead></table>
</div>`,
  },
  chart: {
    intent: "chart",
    appliesWhen: "Numeric trend — bar / line / area",
    keywords: ["chart", "graph", "trend", "growth", "bar chart", "line chart", "metrics"],
    needsInteractivity: false,
    family: "chart",
    designNote: "Inline SVG only. 400×220 viewBox. BAP red #EC3B4A primary. Label data points.",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px">
  <svg viewBox="0 0 400 220" style="width:100%"><rect x="20" y="120" width="60" height="80" fill="#EC3B4A"/></svg>
</div>`,
  },
  source_cards: {
    intent: "source_cards",
    appliesWhen: "Citations with external links (the only widget where <a href> is allowed)",
    keywords: ["sources", "citations", "links", "references", "articles", "papers"],
    needsInteractivity: false,
    family: "static",
    designNote: "Card per source: title + 1-line summary + visible domain. Up to 5.",
    html: `<div style="background:#fff;color:#0a0a0a;border-radius:10px;padding:18px;border:1px solid #e5e5e5">
  <a href="https://example.com" style="display:block;text-decoration:none;color:#0a0a0a;border:1px solid #e5e5e5;padding:10px;border-radius:8px"><div style="font-weight:600">Title</div><div style="font-size:12px;color:#666">example.com</div></a>
</div>`,
  },
  code_block: {
    intent: "code_block",
    appliesWhen: "Code snippet",
    keywords: ["code", "function", "sql", "snippet", "script", "example code"],
    needsInteractivity: false,
    family: "static",
    designNote: "Filename header strip + monospace block. Dark surface.",
    html: `<div style="background:#0d1117;color:#e6edf3;border-radius:10px;font-family:ui-monospace;overflow:hidden">
  <div style="background:#161b22;padding:8px 14px;font-size:11px;color:#8b949e">example.ts</div>
  <pre style="margin:0;padding:14px"><code>function f(){}</code></pre>
</div>`,
  },
  inline_banner: {
    intent: "inline_banner",
    appliesWhen: "Short status or outcome notice",
    keywords: ["banner", "notice", "success", "warning", "error", "alert", "status"],
    needsInteractivity: false,
    family: "static",
    designNote: "Short status line. Border-accent color denotes severity (red/amber/green).",
    html: `<div style="background:#0f1f12;color:#d6f5dc;border-left:4px solid #34d399;border-radius:6px;padding:12px 14px;font-family:ui-sans-serif">
  <div style="font-size:13px">Deployment complete.</div>
</div>`,
  },
  flowchart: {
    intent: "flowchart",
    appliesWhen: "Process flow with boxes and arrows",
    keywords: ["flowchart", "flow", "diagram", "process flow", "pipeline"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG. Boxes (rect) + arrows (path with marker-end). ≤ 6 nodes.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 500 200" style="width:100%"><rect x="20" y="80" width="100" height="40" fill="#1b1f2a" stroke="#EC3B4A" rx="6"/></svg>
</div>`,
  },
  venn_diagram: {
    intent: "venn_diagram",
    appliesWhen: "Overlap between 2–3 sets",
    keywords: ["venn", "overlap", "intersection", "common", "shared"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG with 2–3 overlapping semi-transparent circles + region labels.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 400 250" style="width:100%"><circle cx="150" cy="125" r="80" fill="#EC3B4A" fill-opacity="0.45"/><circle cx="250" cy="125" r="80" fill="#7dd3fc" fill-opacity="0.45"/></svg>
</div>`,
  },
  mind_map: {
    intent: "mind_map",
    appliesWhen: "Central concept with radial branches",
    keywords: ["mind map", "concept map", "brainstorm", "branches", "radial"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG. Central node + 4–6 radial branches, one level deep.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 500 300" style="width:100%"><circle cx="250" cy="150" r="40" fill="#EC3B4A"/></svg>
</div>`,
  },
  pie_chart: {
    intent: "pie_chart",
    appliesWhen: "Part-to-whole breakdown",
    keywords: ["pie", "pie chart", "donut", "breakdown", "share", "percentage", "split"],
    needsInteractivity: false,
    family: "chart",
    designNote: "Inline SVG <path> arcs (compute with sin/cos per slice). ≤ 6 slices.",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px">
  <svg viewBox="0 0 200 200" style="width:200px"><path d="M100,100 L100,10 A90,90 0 0,1 178,145 Z" fill="#EC3B4A"/></svg>
</div>`,
  },
  heatmap: {
    intent: "heatmap",
    appliesWhen: "2D density grid (e.g. days × hours)",
    keywords: ["heatmap", "heat map", "density", "grid", "calendar activity"],
    needsInteractivity: false,
    family: "chart",
    designNote: "HTML table with per-cell inline background color. Use opacity for intensity.",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px">
  <table style="border-collapse:collapse"><tbody><tr><td style="width:24px;height:24px;background:rgba(236,59,74,0.6)"></td></tr></tbody></table>
</div>`,
  },
  kpi_dashboard: {
    intent: "kpi_dashboard",
    appliesWhen: "Grid of metric tiles",
    keywords: ["dashboard", "kpi", "metrics", "tiles", "scorecard", "analytics"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "Metric tile grid: big number + label + delta + optional inline sparkline.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
  <div style="background:#16181f;border:1px solid #333;border-radius:8px;padding:14px"><div style="font-size:11px;color:#999">MRR</div><div style="font-size:24px;font-weight:700">$42K</div></div>
</div>`,
  },
  profile_card: {
    intent: "profile_card",
    appliesWhen: "Person/entity summary card",
    keywords: ["profile", "contact", "card", "person", "bio", "user info"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "Avatar block + name + role + 2–3 stats + 1–2 action buttons.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:flex;gap:16px;align-items:center">
  <div style="width:60px;height:60px;border-radius:50%;background:#EC3B4A;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">JD</div>
  <div><div style="font-weight:700">Jane Doe</div></div>
</div>`,
  },
  kanban_board: {
    intent: "kanban_board",
    appliesWhen: "Multi-column task board",
    keywords: ["kanban", "board", "tasks", "backlog", "in progress", "done", "columns"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "2–4 columns × 2–4 cards. Static — no drag-and-drop.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
  <div><div style="font-size:11px;color:#999">Backlog</div><div style="background:#16181f;border:1px solid #333;padding:10px;border-radius:6px">Task</div></div>
</div>`,
  },
  calculator: {
    intent: "calculator",
    appliesWhen: "Numeric tool (tip, units, BMI, mortgage). REQUIRES <script>.",
    keywords: ["calculator", "calculate", "compute", "converter", "tip", "estimate", "compute", "tool"],
    needsInteractivity: true,
    family: "interactive",
    designNote:
      "Inputs + live output. Wrap script in IIFE. Scope queries via root id=\"bap-w-...\". Use addEventListener.",
    html: `<div id="bap-w-tip" style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:22px;font-family:ui-sans-serif">
  <input data-role="bill" type="number" value="50" style="width:100%;background:#16181f;color:#fff;border:1px solid #333;padding:8px">
  <input data-role="tip" type="range" min="0" max="40" value="18" style="width:100%;accent-color:#EC3B4A">
  <div data-role="total" style="font-size:24px;color:#EC3B4A">$59.00</div>
</div>
<script>(function(){var r=document.getElementById("bap-w-tip");if(!r)return;var b=r.querySelector("[data-role=bill]"),t=r.querySelector("[data-role=tip]"),o=r.querySelector("[data-role=total]");function f(){o.textContent="$"+(parseFloat(b.value)*(1+parseFloat(t.value)/100)).toFixed(2);}b.addEventListener("input",f);t.addEventListener("input",f);})();</script>`,
  },
  quiz: {
    intent: "quiz",
    appliesWhen: "Multiple-choice quiz with scoring. REQUIRES <form> + <script>.",
    keywords: ["quiz", "test", "questions", "score", "multiple choice", "trivia"],
    needsInteractivity: true,
    family: "interactive",
    designNote:
      "Form with radio inputs + script for scoring. Submit handler MUST call e.preventDefault().",
    html: `<form id="bap-w-quiz" style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:22px;font-family:ui-sans-serif">
  <fieldset style="border:1px solid #333;border-radius:8px;padding:12px"><legend>Q1</legend>
    <label><input type="radio" name="q1" value="a" data-correct> Right answer</label>
  </fieldset>
  <button type="submit" style="background:#EC3B4A;color:#fff;border:0;padding:10px 18px;border-radius:6px">Submit</button>
  <output data-role="out"></output>
</form>
<script>(function(){var f=document.getElementById("bap-w-quiz");if(!f)return;f.addEventListener("submit",function(e){e.preventDefault();/*score*/});})();</script>`,
  },
};

export function getSkill(intent: string): WidgetSkill | null {
  if ((WIDGET_INTENTS as readonly string[]).includes(intent)) {
    return SKILLS[intent as WidgetIntent];
  }
  return null;
}

export function listSkills(): WidgetSkill[] {
  return WIDGET_INTENTS.map((i) => SKILLS[i]);
}

export function listIntents(): string[] {
  return [...WIDGET_INTENTS];
}

// Back-compat alias for older callers / tests
export const getExample = getSkill;
export type WidgetExample = WidgetSkill;
