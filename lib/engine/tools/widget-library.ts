/** The widget skill catalog. 22 skills the agent picks from per turn. */

export interface WidgetSkill {
  intent: string;
  appliesWhen: string;
  keywords: string[];
  needsInteractivity: boolean;
  family: "static" | "diagram" | "chart" | "dashboard" | "interactive";
  designNote: string;
  html: string;
}

export const WIDGET_INTENTS = [
  "chips", "decision_card", "confirm_card", "stepper", "checklist", "timeline",
  "table", "chart", "source_cards", "code_block", "inline_banner",
  "flowchart", "venn_diagram", "mind_map",
  "sequence_diagram", "tree_diagram", "gantt_chart", "map",
  "pie_chart", "heatmap",
  "scatter_plot", "funnel_chart", "radar_chart",
  "kpi_dashboard", "profile_card", "kanban_board", "pricing_table",
  "calculator", "quiz", "form",
] as const;

export type WidgetIntent = (typeof WIDGET_INTENTS)[number];

const SKILLS: Record<WidgetIntent, WidgetSkill> = {
  chips: {
    intent: "chips",
    appliesWhen: "Conversational reply or disambiguation",
    keywords: ["hi", "hello", "help", "what", "suggest", "options"],
    needsInteractivity: false,
    family: "static",
    designNote: "Row of 3–5 follow-up pills, each with data-superwidgets-prompt. Compact.",
    html: `<div style="background:#1b1f2a;color:#e7eaf3;padding:14px 16px;border-radius:14px;display:flex;flex-wrap:wrap;gap:8px;font-family:ui-sans-serif">
  <button data-superwidgets-prompt="Tell me more" style="background:#262c3a;color:#e7eaf3;border:1px solid #353c4d;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer">Tell me more</button>
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
    <div style="border:1px solid #333;padding:14px;border-radius:8px"><div style="font-size:11px;color:#999">Option A</div><button data-superwidgets-prompt="Choose A" style="margin-top:8px;width:100%;background:#EC3B4A;color:#fff;border:0;padding:8px;border-radius:6px">Choose</button></div>
    <div style="border:1px solid #333;padding:14px;border-radius:8px"><div style="font-size:11px;color:#999">Option B</div><button data-superwidgets-prompt="Choose B" style="margin-top:8px;width:100%;background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;padding:8px;border-radius:6px">Choose</button></div>
  </div>
</div>`,
  },
  confirm_card: {
    intent: "confirm_card",
    appliesWhen: "Destructive / irreversible action",
    keywords: ["delete", "remove", "drop", "destroy", "send", "publish", "confirm", "irreversible"],
    needsInteractivity: false,
    family: "static",
    designNote: "Clear question + Confirm/Cancel. Confirm button MUST have data-superwidgets-confirm.",
    html: `<div style="background:#2a1a1a;color:#f4e8e8;border-left:4px solid #EC3B4A;border-radius:10px;padding:18px;font-family:ui-sans-serif">
  <p style="margin:0 0 16px">Delete X? Cannot be undone.</p>
  <button data-superwidgets-prompt="Confirmed delete" data-superwidgets-confirm style="background:#EC3B4A;color:#fff;border:0;padding:9px 16px;border-radius:6px">Delete</button>
</div>`,
  },
  stepper: {
    intent: "stepper",
    appliesWhen: "Multi-step plan or process",
    keywords: ["steps", "plan", "process", "how to", "guide", "walk through", "onboard"],
    needsInteractivity: false,
    family: "static",
    designNote: "3–6 numbered steps with a current marker. Vertical, numbered circles. Each step row gets data-superwidgets-prompt=\"Tell me more about step N: [title]\" + cursor:pointer.",
    html: `<div style="background:#0d1320;color:#e9eef7;border-radius:14px;padding:22px;font-family:ui-monospace">
  <ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px">
    <li data-superwidgets-prompt="Tell me more about step 1: Setup" style="display:flex;gap:12px;cursor:pointer"><span style="background:#7dd3fc;color:#0d1320;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">1</span><div>Setup</div></li>
  </ol>
</div>`,
  },
  checklist: {
    intent: "checklist",
    appliesWhen: "List of items to review or tick off",
    keywords: ["checklist", "list", "review", "items", "verify list", "pre-flight"],
    needsInteractivity: false,
    family: "static",
    designNote: "List with ✓/□ glyphs. Dense. Each item gets data-superwidgets-prompt=\"Help me with: [item]\" so clicking it asks for help on that item.",
    html: `<div style="background:#fff7e6;color:#1f1410;border-radius:10px;padding:18px;font-family:Georgia,serif">
  <ul style="list-style:none;padding:0;margin:0;line-height:1.9">
    <li data-superwidgets-prompt="Help me with: Done item" style="cursor:pointer">✓ Done</li>
    <li data-superwidgets-prompt="Help me with: Pending item" style="cursor:pointer">□ Pending</li>
  </ul>
</div>`,
  },
  table: {
    intent: "table",
    appliesWhen: "Tabular comparison or feature matrix",
    keywords: ["table", "matrix", "compare", "feature", "spec", "rows", "columns"],
    needsInteractivity: false,
    family: "static",
    designNote: "Compact grid. ≤ 4 columns. Highlight winners per row. Each <tbody><tr> gets data-superwidgets-prompt=\"Tell me more about [row label]\" + cursor:pointer.",
    html: `<div style="background:#fafafa;color:#111;border-radius:10px;padding:18px;font-family:ui-sans-serif;border:1px solid #e5e5e5">
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#111;color:#fff"><th style="padding:8px">Feature</th><th style="padding:8px">A</th><th style="padding:8px">B</th></tr></thead>
    <tbody><tr data-superwidgets-prompt="Tell me more about: Speed" style="cursor:pointer"><td style="padding:8px">Speed</td><td style="padding:8px">Fast</td><td style="padding:8px">Faster</td></tr></tbody>
  </table>
</div>`,
  },
  chart: {
    intent: "chart",
    appliesWhen: "Numeric trend — bar / line / area",
    keywords: ["chart", "graph", "trend", "growth", "bar chart", "line chart", "metrics"],
    needsInteractivity: true,
    family: "chart",
    designNote:
      "Inline SVG only. 400×220 viewBox. Superwidgets red #EC3B4A primary. Label data points. " +
      "Each bar/data-point <rect> (or wrapping <g>) gets data-superwidgets-prompt=\"What's the data for [label]?\" " +
      "+ data-tip=\"[label]: [value]\" + style=\"cursor:pointer\". " +
      "INSTANT hover tooltip pattern: wrap everything in a div id=\"superwidgets-w-chart\" with position:relative + " +
      "an absolutely-positioned tooltip <div data-role=\"tip\">, then an IIFE script binds " +
      "mouseenter/mousemove/mouseleave on each [data-tip] element to fill + position + show the tooltip. " +
      "Also include a <title>[label]: [value]</title> CHILD inside each bar as an accessibility fallback.",
    html: `<div id="superwidgets-w-chart" style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px;position:relative;font-family:ui-sans-serif">
  <svg viewBox="0 0 400 220" style="width:100%">
    <rect data-superwidgets-prompt="What's the data for Jan?" data-tip="Jan · $42K" x="20" y="120" width="60" height="80" fill="#EC3B4A" style="cursor:pointer"><title>Jan: $42K</title></rect>
    <rect data-superwidgets-prompt="What's the data for Feb?" data-tip="Feb · $58K" x="100" y="80" width="60" height="120" fill="#EC3B4A" style="cursor:pointer"><title>Feb: $58K</title></rect>
  </svg>
  <div data-role="tip" style="position:absolute;display:none;pointer-events:none;background:#fff;color:#0a0a0a;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;box-sizing:border-box;z-index:10;white-space:nowrap"></div>
</div>
<script>(function(){var r=document.getElementById("superwidgets-w-chart");if(!r)return;var t=r.querySelector("[data-role=tip]");if(!t)return;var items=r.querySelectorAll("[data-tip]");items.forEach(function(el){el.addEventListener("mouseenter",function(){t.textContent=el.getAttribute("data-tip")||"";t.style.display="block";});el.addEventListener("mousemove",function(ev){var b=r.getBoundingClientRect();t.style.left=(ev.clientX-b.left+12)+"px";t.style.top=(ev.clientY-b.top+12)+"px";});el.addEventListener("mouseleave",function(){t.style.display="none";});});})();</script>`,
  },
  source_cards: {
    intent: "source_cards",
    appliesWhen: "Citations with external links (the only widget where <a href> is allowed)",
    keywords: ["sources", "citations", "links", "references", "articles", "papers"],
    needsInteractivity: false,
    family: "static",
    designNote: "Card per source: title + 1-line summary + visible domain. Up to 5. Each anchor MUST have target=\"_blank\" rel=\"noopener\" so the source opens in a new tab without leaving the chat.",
    html: `<div style="background:#fff;color:#0a0a0a;border-radius:10px;padding:18px;border:1px solid #e5e5e5">
  <a href="https://example.com" target="_blank" rel="noopener" style="display:block;text-decoration:none;color:#0a0a0a;border:1px solid #e5e5e5;padding:10px;border-radius:8px"><div style="font-weight:600">Title</div><div style="font-size:12px;color:#666">example.com</div></a>
</div>`,
  },
  code_block: {
    intent: "code_block",
    appliesWhen: "Code snippet",
    keywords: ["code", "function", "sql", "snippet", "script", "example code"],
    needsInteractivity: false,
    family: "static",
    designNote:
      "Filename header strip + monospace block. Dark surface. Include a Copy button in the header " +
      "wired via IIFE <script> that copies the <code> text to clipboard. Use unique root " +
      "id=\"superwidgets-w-code-...\", null-guard all queries. " +
      "**HARD RULE — NO data-superwidgets-prompt on the Copy button.** Copy is a LOCAL action (clipboard " +
      "write inside the widget); data-superwidgets-prompt would preventDefault and the copy would never fire. " +
      "Add ONE chat follow-up chip below the code block: <button data-superwidgets-prompt=\"Explain this code\"> " +
      "(or \"Show me a usage example\" — pick what fits the snippet).",
    html: `<div id="superwidgets-w-code" style="background:#0d1117;color:#e6edf3;border-radius:10px;font-family:ui-monospace;overflow:hidden">
  <div style="background:#161b22;padding:8px 14px;font-size:11px;color:#8b949e;display:flex;justify-content:space-between;align-items:center">
    <span>example.ts</span>
    <button data-role="cp" style="background:transparent;color:#8b949e;border:1px solid #30363d;border-radius:4px;padding:2px 8px;font-size:11px;cursor:pointer">Copy</button>
  </div>
  <pre style="margin:0;padding:14px"><code data-role="code">function f(){}</code></pre>
  <div style="padding:10px 14px;border-top:1px solid #161b22"><button data-superwidgets-prompt="Explain this code" style="background:transparent;color:#8b949e;border:1px solid #30363d;border-radius:999px;padding:4px 12px;font-size:11px;cursor:pointer">Explain this code</button></div>
</div>
<script>(function(){var r=document.getElementById("superwidgets-w-code");if(!r)return;var b=r.querySelector("[data-role=cp]"),c=r.querySelector("[data-role=code]");if(!b||!c)return;b.addEventListener("click",function(){try{navigator.clipboard.writeText(c.textContent||"");b.textContent="Copied";setTimeout(function(){b.textContent="Copy";},1500);}catch(e){}});})();</script>`,
  },
  inline_banner: {
    intent: "inline_banner",
    appliesWhen: "Short status or outcome notice",
    keywords: ["banner", "notice", "success", "warning", "error", "alert", "status"],
    needsInteractivity: false,
    family: "static",
    designNote: "Short status line. Border-accent color denotes severity (red/amber/green). Include an inline \"Learn more →\" <span> with data-superwidgets-prompt for follow-up.",
    html: `<div style="background:#0f1f12;color:#d6f5dc;border-left:4px solid #34d399;border-radius:6px;padding:12px 14px;font-family:ui-sans-serif">
  <div style="font-size:13px">Deployment complete. <span data-superwidgets-prompt="Tell me more about the deployment" style="color:#34d399;border-bottom:1px dashed #34d399;cursor:pointer;margin-left:4px">Learn more →</span></div>
</div>`,
  },
  flowchart: {
    intent: "flowchart",
    appliesWhen: "Process flow with boxes and arrows",
    keywords: ["flowchart", "flow", "diagram", "process flow", "pipeline"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG. Boxes (rect) + arrows (path with marker-end). ≤ 6 nodes. Each node <rect> (or wrapping <g>) gets data-superwidgets-prompt=\"Explain: [node label]\" + style=\"cursor:pointer\".",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 500 200" style="width:100%"><rect data-superwidgets-prompt="Explain: Start" x="20" y="80" width="100" height="40" fill="#1b1f2a" stroke="#EC3B4A" rx="6" style="cursor:pointer"/></svg>
</div>`,
  },
  venn_diagram: {
    intent: "venn_diagram",
    appliesWhen: "Overlap between 2–3 sets",
    keywords: ["venn", "overlap", "intersection", "common", "shared"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG with 2–3 overlapping semi-transparent circles + region labels. Each region's <circle> (or label <text>) gets data-superwidgets-prompt=\"Show items in: [region name]\" + style=\"cursor:pointer\".",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 400 250" style="width:100%"><circle data-superwidgets-prompt="Show items in: Set A" cx="150" cy="125" r="80" fill="#EC3B4A" fill-opacity="0.45" style="cursor:pointer"/><circle data-superwidgets-prompt="Show items in: Set B" cx="250" cy="125" r="80" fill="#7dd3fc" fill-opacity="0.45" style="cursor:pointer"/></svg>
</div>`,
  },
  mind_map: {
    intent: "mind_map",
    appliesWhen: "Central concept with radial branches",
    keywords: ["mind map", "concept map", "brainstorm", "branches", "radial"],
    needsInteractivity: false,
    family: "diagram",
    designNote: "Inline SVG. Central node + 4–6 radial branches, one level deep. Each branch <g> (or branch-end <circle>) gets data-superwidgets-prompt=\"Expand: [branch name]\" + style=\"cursor:pointer\".",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px">
  <svg viewBox="0 0 500 300" style="width:100%"><circle cx="250" cy="150" r="40" fill="#EC3B4A"/><circle data-superwidgets-prompt="Expand: Branch A" cx="100" cy="80" r="20" fill="#1b1f2a" stroke="#EC3B4A" style="cursor:pointer"/></svg>
</div>`,
  },
  sequence_diagram: {
    intent: "sequence_diagram",
    appliesWhen: "Actor-vs-time message flow between 2–5 systems (request/response trace)",
    keywords: ["sequence", "sequence diagram", "trace", "request flow", "interaction", "handshake", "oauth flow", "rpc"],
    needsInteractivity: false,
    family: "diagram",
    designNote:
      "Inline SVG, viewBox 0 0 600 280+. 2–5 vertical lifelines (dashed lines) with actor labels at top, " +
      "horizontal arrows between them for messages — time flows top-to-bottom. Superwidgets red for the primary " +
      "request path, gray for responses. Each message <g> wraps the arrow + label and gets " +
      "data-superwidgets-prompt=\"Explain: [message name]\" + cursor:pointer. Distinct from flowchart (no time axis) and timeline (no actors).",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;font-family:ui-sans-serif">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#888">Sequence</div>
  <h3 style="margin:4px 0 14px;font-size:16px">OAuth handshake</h3>
  <svg viewBox="0 0 600 220" style="width:100%">
    <text x="80" y="18" fill="#fff" text-anchor="middle" font-size="12">Browser</text>
    <text x="300" y="18" fill="#fff" text-anchor="middle" font-size="12">App server</text>
    <text x="520" y="18" fill="#fff" text-anchor="middle" font-size="12">Auth server</text>
    <line x1="80" y1="28" x2="80" y2="210" stroke="#333" stroke-dasharray="3,3"/>
    <line x1="300" y1="28" x2="300" y2="210" stroke="#333" stroke-dasharray="3,3"/>
    <line x1="520" y1="28" x2="520" y2="210" stroke="#333" stroke-dasharray="3,3"/>
    <g data-superwidgets-prompt="Explain: GET /login" style="cursor:pointer"><line x1="80" y1="60" x2="296" y2="60" stroke="#EC3B4A" stroke-width="1.5"/><polygon points="296,57 302,60 296,63" fill="#EC3B4A"/><text x="188" y="55" fill="#fff" text-anchor="middle" font-size="11">GET /login</text></g>
    <g data-superwidgets-prompt="Explain: 302 redirect to auth" style="cursor:pointer"><line x1="300" y1="110" x2="516" y2="110" stroke="#EC3B4A" stroke-width="1.5"/><polygon points="516,107 522,110 516,113" fill="#EC3B4A"/><text x="408" y="105" fill="#fff" text-anchor="middle" font-size="11">redirect →</text></g>
    <g data-superwidgets-prompt="Explain: token response" style="cursor:pointer"><line x1="516" y1="170" x2="84" y2="170" stroke="#888" stroke-width="1.5" stroke-dasharray="4,3"/><polygon points="84,167 78,170 84,173" fill="#888"/><text x="300" y="165" fill="#fff" text-anchor="middle" font-size="11">access_token</text></g>
  </svg>
</div>`,
  },
  tree_diagram: {
    intent: "tree_diagram",
    appliesWhen: "Top-down hierarchy — org chart, file tree, taxonomy, parent-child",
    keywords: ["tree", "hierarchy", "org chart", "org structure", "file tree", "taxonomy", "parent child"],
    needsInteractivity: false,
    family: "diagram",
    designNote:
      "Inline SVG, viewBox 0 0 600 320+. Root at top center, 2–4 children per level, 2–3 levels deep (≤ 10 nodes). " +
      "Each node = rounded <rect> with a <text> label, wrapped in a <g>. Lines connect parents to children. " +
      "Each node <g> gets data-superwidgets-prompt=\"Tell me more about: [node]\" + cursor:pointer. Distinct from mind_map (radial, no hierarchy).",
    html: `<div style="background:#fafafa;color:#1a1a1a;border-radius:14px;padding:20px;font-family:ui-sans-serif;border:1px solid #e5e5e5">
  <h3 style="margin:0 0 14px;font-size:16px">Engineering org</h3>
  <svg viewBox="0 0 600 220" style="width:100%">
    <g data-superwidgets-prompt="Tell me more about: CTO" style="cursor:pointer">
      <rect x="240" y="10" width="120" height="36" fill="#fff" stroke="#EC3B4A" stroke-width="1.5" rx="6"/>
      <text x="300" y="33" text-anchor="middle" font-size="13" font-weight="600" fill="#1a1a1a">CTO</text>
    </g>
    <line x1="300" y1="46" x2="300" y2="80" stroke="#999"/>
    <line x1="150" y1="80" x2="450" y2="80" stroke="#999"/>
    <line x1="150" y1="80" x2="150" y2="100" stroke="#999"/>
    <line x1="300" y1="80" x2="300" y2="100" stroke="#999"/>
    <line x1="450" y1="80" x2="450" y2="100" stroke="#999"/>
    <g data-superwidgets-prompt="Tell me more about: Engineering" style="cursor:pointer">
      <rect x="90" y="100" width="120" height="36" fill="#fff" stroke="#999" rx="6"/>
      <text x="150" y="123" text-anchor="middle" font-size="12" fill="#1a1a1a">Engineering</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about: Product" style="cursor:pointer">
      <rect x="240" y="100" width="120" height="36" fill="#fff" stroke="#999" rx="6"/>
      <text x="300" y="123" text-anchor="middle" font-size="12" fill="#1a1a1a">Product</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about: Design" style="cursor:pointer">
      <rect x="390" y="100" width="120" height="36" fill="#fff" stroke="#999" rx="6"/>
      <text x="450" y="123" text-anchor="middle" font-size="12" fill="#1a1a1a">Design</text>
    </g>
  </svg>
</div>`,
  },
  gantt_chart: {
    intent: "gantt_chart",
    appliesWhen: "Project schedule with overlapping task durations + optional dependencies",
    keywords: ["gantt", "gantt chart", "schedule", "project plan", "timeline bars", "duration", "milestones with bars"],
    needsInteractivity: false,
    family: "diagram",
    designNote:
      "Two-column layout: task names on left (120px), bar area on right. Top row has month/week labels. " +
      "Each task row = label + a horizontal bar positioned by start/end (% of the date range) with rounded corners. " +
      "ONE bar may be Superwidgets red (critical / in-flight); others dark/neutral. Each task row gets " +
      "data-superwidgets-prompt=\"Tell me more about task: [task name]\" + cursor:pointer. Distinct from stepper (no durations), timeline (no overlap), kanban_board (no time).",
    html: `<div style="background:#fdfcf8;color:#1a1a1a;border-radius:14px;padding:20px;font-family:ui-sans-serif">
  <h3 style="margin:0 0 4px;font-size:16px">Migration project</h3>
  <div style="font-size:11px;color:#666;margin-bottom:14px">Mar 1 – Apr 28</div>
  <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:#999;padding:0 0 6px 110px;border-bottom:1px solid #e3dccd"><span>Mar</span><span style="margin-left:auto">Apr</span></div>
  <div data-superwidgets-prompt="Tell me more about task: Schema migration" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0ead8;font-size:12px">
    <div style="width:100px">Schema</div>
    <div style="flex:1;height:14px;background:#f1ecdf;border-radius:3px;position:relative"><div style="position:absolute;left:0;width:30%;height:100%;background:#EC3B4A;border-radius:3px"></div></div>
  </div>
  <div data-superwidgets-prompt="Tell me more about task: Data backfill" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0ead8;font-size:12px">
    <div style="width:100px">Backfill</div>
    <div style="flex:1;height:14px;background:#f1ecdf;border-radius:3px;position:relative"><div style="position:absolute;left:20%;width:50%;height:100%;background:#1a1a1a;border-radius:3px"></div></div>
  </div>
  <div data-superwidgets-prompt="Tell me more about task: Cutover" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 0;font-size:12px">
    <div style="width:100px">Cutover</div>
    <div style="flex:1;height:14px;background:#f1ecdf;border-radius:3px;position:relative"><div style="position:absolute;left:65%;width:15%;height:100%;background:#1a1a1a;border-radius:3px"></div></div>
  </div>
</div>`,
  },
  map: {
    intent: "map",
    appliesWhen: "Spatial — location pins, itinerary, or region highlight",
    keywords: ["map", "location", "cities", "itinerary", "where is", "region", "geographic", "pin", "world map"],
    needsInteractivity: false,
    family: "diagram",
    designNote:
      "Inline SVG with a simplified region outline as <path> + pins as <circle>+<text> at approximate coordinates. " +
      "viewBox sized to region (typical 0 0 600 360). For itineraries: connect pins with a <polyline> stroke-dasharray. " +
      "Each pin <g> gets data-superwidgets-prompt=\"Tell me more about: [city]\" + cursor:pointer. No live geo data — coordinates are model approximations.",
    html: `<div style="background:#fdfcf8;color:#1a1a1a;border-radius:14px;padding:20px;font-family:ui-sans-serif;border:1px solid #e3dccd">
  <h3 style="margin:0 0 4px;font-size:16px">Office locations</h3>
  <div style="font-size:11px;color:#666;margin-bottom:14px">3 cities · North America</div>
  <svg viewBox="0 0 600 320" style="width:100%;background:#f5f1e8;border-radius:8px">
    <path d="M30,140 Q90,80 200,90 Q300,80 400,110 Q500,140 560,180 Q540,260 460,270 Q360,290 250,280 Q140,275 80,250 Q30,220 30,140 Z" fill="#e3dccd" stroke="#bfae8c" stroke-width="1.5"/>
    <g data-superwidgets-prompt="Tell me more about: San Francisco office" style="cursor:pointer">
      <circle cx="120" cy="210" r="7" fill="#EC3B4A"/>
      <text x="134" y="214" font-size="11" fill="#1a1a1a" font-weight="600">San Francisco</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about: Austin office" style="cursor:pointer">
      <circle cx="300" cy="240" r="7" fill="#EC3B4A"/>
      <text x="314" y="244" font-size="11" fill="#1a1a1a" font-weight="600">Austin</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about: New York office" style="cursor:pointer">
      <circle cx="470" cy="170" r="7" fill="#EC3B4A"/>
      <text x="484" y="174" font-size="11" fill="#1a1a1a" font-weight="600">New York</text>
    </g>
  </svg>
</div>`,
  },
  pie_chart: {
    intent: "pie_chart",
    appliesWhen: "Part-to-whole breakdown",
    keywords: ["pie", "pie chart", "donut", "breakdown", "share", "percentage", "split"],
    needsInteractivity: true,
    family: "chart",
    designNote:
      "Inline SVG <path> arcs (compute with sin/cos per slice). ≤ 6 slices. " +
      "Each slice <path> gets data-superwidgets-prompt=\"Show details for: [slice]\" + " +
      "data-tip=\"[slice] · [value or %]\" + style=\"cursor:pointer\". " +
      "INSTANT hover tooltip pattern: wrap everything in a div id=\"superwidgets-w-pie\" with position:relative + " +
      "an absolutely-positioned tooltip <div data-role=\"tip\">, then an IIFE script binds " +
      "mouseenter/mousemove/mouseleave on each [data-tip] element to fill + position + show the tooltip. " +
      "Also include a <title>[slice] — [%]</title> CHILD inside each slice as an accessibility fallback.",
    html: `<div id="superwidgets-w-pie" style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px;position:relative;font-family:ui-sans-serif">
  <svg viewBox="0 0 200 200" style="width:200px">
    <path data-superwidgets-prompt="Show details for: Slice A" data-tip="Slice A · 39%" d="M100,100 L100,10 A90,90 0 0,1 178,145 Z" fill="#EC3B4A" style="cursor:pointer"><title>Slice A — 39%</title></path>
    <path data-superwidgets-prompt="Show details for: Slice B" data-tip="Slice B · 61%" d="M100,100 L178,145 A90,90 0 1,1 100,10 Z" fill="#5a5a5a" style="cursor:pointer"><title>Slice B — 61%</title></path>
  </svg>
  <div data-role="tip" style="position:absolute;display:none;pointer-events:none;background:#fff;color:#0a0a0a;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;box-sizing:border-box;z-index:10;white-space:nowrap"></div>
</div>
<script>(function(){var r=document.getElementById("superwidgets-w-pie");if(!r)return;var t=r.querySelector("[data-role=tip]");if(!t)return;var items=r.querySelectorAll("[data-tip]");items.forEach(function(el){el.addEventListener("mouseenter",function(){t.textContent=el.getAttribute("data-tip")||"";t.style.display="block";});el.addEventListener("mousemove",function(ev){var b=r.getBoundingClientRect();t.style.left=(ev.clientX-b.left+12)+"px";t.style.top=(ev.clientY-b.top+12)+"px";});el.addEventListener("mouseleave",function(){t.style.display="none";});});})();</script>`,
  },
  heatmap: {
    intent: "heatmap",
    appliesWhen: "2D density grid (e.g. days × hours)",
    keywords: ["heatmap", "heat map", "density", "grid", "calendar activity"],
    needsInteractivity: false,
    family: "chart",
    designNote: "HTML table with per-cell inline background color. Use opacity for intensity. Each <td> cell gets data-superwidgets-prompt=\"Show data for [row] at [col]\" + style cursor:pointer.",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:10px;padding:20px">
  <table style="border-collapse:collapse"><tbody><tr><td data-superwidgets-prompt="Show data for Mon at 9am" style="width:24px;height:24px;background:rgba(236,59,74,0.6);cursor:pointer"></td></tr></tbody></table>
</div>`,
  },
  scatter_plot: {
    intent: "scatter_plot",
    appliesWhen: "Two-variable correlation / distribution point cloud",
    keywords: ["scatter", "scatter plot", "correlation", "xy plot", "points", "distribution", "vs"],
    needsInteractivity: false,
    family: "chart",
    designNote:
      "Inline SVG, viewBox 0 0 400 280. X-axis at bottom, Y-axis on left with tick labels and units. " +
      "8–30 small <circle> data points (Superwidgets red). Optional dashed gray trend line. Axis-label caption " +
      "under the plot. Each <circle> point gets data-superwidgets-prompt=\"Show details for: [label]\" + cursor:pointer. " +
      "Distinct from `chart` (bar/line/area only).",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:14px;padding:20px;font-family:ui-sans-serif">
  <h3 style="margin:0 0 4px;font-size:16px">Ad spend vs Revenue</h3>
  <div style="font-size:11px;color:#888;margin-bottom:14px">Q1 campaigns · USD</div>
  <svg viewBox="0 0 400 240" style="width:100%">
    <line x1="40" y1="20" x2="40" y2="200" stroke="#444"/>
    <line x1="40" y1="200" x2="380" y2="200" stroke="#444"/>
    <text x="32" y="28" font-size="9" fill="#888" text-anchor="end">100K</text>
    <text x="32" y="204" font-size="9" fill="#888" text-anchor="end">0</text>
    <text x="40" y="220" font-size="9" fill="#888" text-anchor="middle">0</text>
    <text x="380" y="220" font-size="9" fill="#888" text-anchor="middle">50K</text>
    <line x1="40" y1="180" x2="380" y2="40" stroke="#666" stroke-dasharray="4,3" stroke-width="1"/>
    <circle data-superwidgets-prompt="Show details for: Campaign A ($5K spend → $18K rev)" cx="80" cy="150" r="5" fill="#EC3B4A" style="cursor:pointer"/>
    <circle data-superwidgets-prompt="Show details for: Campaign B ($12K spend → $42K rev)" cx="160" cy="95" r="5" fill="#EC3B4A" style="cursor:pointer"/>
    <circle data-superwidgets-prompt="Show details for: Campaign C ($25K spend → $78K rev)" cx="260" cy="55" r="5" fill="#EC3B4A" style="cursor:pointer"/>
  </svg>
  <div style="font-size:11px;color:#888;margin-top:6px;text-align:center">Spend (USD) → Revenue (USD)</div>
</div>`,
  },
  funnel_chart: {
    intent: "funnel_chart",
    appliesWhen: "Conversion / pipeline drop-off across multiple stages",
    keywords: ["funnel", "funnel chart", "conversion", "pipeline", "drop-off", "retention stages"],
    needsInteractivity: false,
    family: "chart",
    designNote:
      "Inline SVG, viewBox 0 0 480 320. 4–6 horizontal trapezoid bands stacked vertically, each narrower " +
      "than the one above. Each stage labeled with name + count + percent of total. Top stage in Superwidgets red, " +
      "lower stages fading to gray. Each stage <g> (polygon + text) gets data-superwidgets-prompt=\"Tell me more about stage: [stage]\" + cursor:pointer.",
    html: `<div style="background:#0a0a0a;color:#fafafa;border-radius:14px;padding:20px;font-family:ui-sans-serif">
  <h3 style="margin:0 0 4px;font-size:16px">Conversion funnel</h3>
  <div style="font-size:11px;color:#888;margin-bottom:14px">Last 30 days</div>
  <svg viewBox="0 0 480 280" style="width:100%">
    <g data-superwidgets-prompt="Tell me more about stage: Visitors" style="cursor:pointer">
      <polygon points="60,10 420,10 400,70 80,70" fill="#EC3B4A"/>
      <text x="240" y="45" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">Visitors · 10,000</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about stage: Signups" style="cursor:pointer">
      <polygon points="100,84 380,84 350,144 130,144" fill="#a32a35"/>
      <text x="240" y="119" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">Signups · 2,400 (24%)</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about stage: Activated" style="cursor:pointer">
      <polygon points="150,158 330,158 300,218 180,218" fill="#5a5a5a"/>
      <text x="240" y="193" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">Activated · 880 (8.8%)</text>
    </g>
    <g data-superwidgets-prompt="Tell me more about stage: Paying" style="cursor:pointer">
      <polygon points="195,232 285,232 270,272 210,272" fill="#3a3a3a"/>
      <text x="240" y="258" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Paying · 142 (1.4%)</text>
    </g>
  </svg>
</div>`,
  },
  radar_chart: {
    intent: "radar_chart",
    appliesWhen: "Multi-dimensional comparison across ≥3 traits for 1–3 entities",
    keywords: ["radar", "radar chart", "spider chart", "skill profile", "multi-dimensional", "compare across axes"],
    needsInteractivity: false,
    family: "chart",
    designNote:
      "Inline SVG, viewBox 0 0 360 360. 4–6 axes radiating from center, with 2 concentric rings (50% / 100%). " +
      "1–3 entities each as a closed semi-transparent <polygon> connecting their value on each axis. " +
      "Trait labels (<text>) at each axis tip. Each entity polygon gets data-superwidgets-prompt=\"Show details for: [entity]\" + cursor:pointer.",
    html: `<div style="background:#fafafa;color:#1a1a1a;border-radius:14px;padding:20px;font-family:ui-sans-serif;border:1px solid #e5e5e5">
  <h3 style="margin:0 0 14px;font-size:16px">Skill profile</h3>
  <svg viewBox="0 0 360 360" style="width:100%">
    <polygon points="180,30 310,105 310,255 180,330 50,255 50,105" fill="none" stroke="#ccc"/>
    <polygon points="180,105 245,142 245,217 180,255 115,217 115,142" fill="none" stroke="#ddd"/>
    <line x1="180" y1="30" x2="180" y2="180" stroke="#eee"/>
    <line x1="310" y1="105" x2="180" y2="180" stroke="#eee"/>
    <line x1="310" y1="255" x2="180" y2="180" stroke="#eee"/>
    <line x1="180" y1="330" x2="180" y2="180" stroke="#eee"/>
    <line x1="50" y1="255" x2="180" y2="180" stroke="#eee"/>
    <line x1="50" y1="105" x2="180" y2="180" stroke="#eee"/>
    <text x="180" y="20" text-anchor="middle" font-size="11" fill="#1a1a1a">Code</text>
    <text x="330" y="105" text-anchor="middle" font-size="11" fill="#1a1a1a">Design</text>
    <text x="330" y="270" text-anchor="middle" font-size="11" fill="#1a1a1a">Comms</text>
    <text x="180" y="350" text-anchor="middle" font-size="11" fill="#1a1a1a">Lead</text>
    <text x="30" y="270" text-anchor="middle" font-size="11" fill="#1a1a1a">Test</text>
    <text x="30" y="105" text-anchor="middle" font-size="11" fill="#1a1a1a">Ops</text>
    <polygon data-superwidgets-prompt="Show details for: You" points="180,80 270,140 230,230 180,240 130,225 110,140" fill="#EC3B4A" fill-opacity="0.35" stroke="#EC3B4A" stroke-width="1.5" style="cursor:pointer"/>
  </svg>
</div>`,
  },
  kpi_dashboard: {
    intent: "kpi_dashboard",
    appliesWhen: "Grid of metric tiles",
    keywords: ["dashboard", "kpi", "metrics", "tiles", "scorecard", "analytics"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "Metric tile grid: big number + label + delta + optional inline sparkline. Each tile gets data-superwidgets-prompt=\"Drill into: [metric name]\" + cursor:pointer.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
  <div data-superwidgets-prompt="Drill into: MRR" style="background:#16181f;border:1px solid #333;border-radius:8px;padding:14px;cursor:pointer"><div style="font-size:11px;color:#999">MRR</div><div style="font-size:24px;font-weight:700">$42K</div></div>
</div>`,
  },
  profile_card: {
    intent: "profile_card",
    appliesWhen: "Person/entity summary card",
    keywords: ["profile", "contact", "card", "person", "bio", "user info"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "Avatar block + name + role + 2–3 stats + at least ONE primary action button with data-superwidgets-prompt (View profile / Message / Connect / Tell me more).",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:flex;gap:16px;align-items:center">
  <div style="width:60px;height:60px;border-radius:50%;background:#EC3B4A;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">JD</div>
  <div style="flex:1"><div style="font-weight:700">Jane Doe</div></div>
  <button data-superwidgets-prompt="Tell me more about Jane Doe" style="background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer">View profile</button>
</div>`,
  },
  kanban_board: {
    intent: "kanban_board",
    appliesWhen: "Multi-column task board",
    keywords: ["kanban", "board", "tasks", "backlog", "in progress", "done", "columns"],
    needsInteractivity: false,
    family: "dashboard",
    designNote: "2–4 columns × 2–4 cards. Static — no drag-and-drop. Each task card gets data-superwidgets-prompt=\"Show details for: [task title]\" + cursor:pointer.",
    html: `<div style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
  <div><div style="font-size:11px;color:#999">Backlog</div><div data-superwidgets-prompt="Show details for: Task" style="background:#16181f;border:1px solid #333;padding:10px;border-radius:6px;cursor:pointer">Task</div></div>
</div>`,
  },
  calculator: {
    intent: "calculator",
    appliesWhen: "Numeric tool (tip, units, BMI, mortgage). REQUIRES <script>.",
    keywords: ["calculator", "calculate", "compute", "converter", "tip", "estimate", "compute", "tool"],
    needsInteractivity: true,
    family: "interactive",
    designNote:
      "Inputs + live output. Wrap script in IIFE. Scope queries via root id=\"superwidgets-w-...\". Use addEventListener. " +
      "**HARD RULE — NO data-superwidgets-prompt on inputs, sliders, selects, or any element the user manipulates " +
      "to drive the live recompute.** Those are LOCAL controls; the script reads .value from them on " +
      "the \"input\" event. data-superwidgets-prompt would preventDefault and break the live behavior. " +
      "The widget's only chat follow-up is ONE pill below the result: " +
      "<button data-superwidgets-prompt=\"Explain how the [output] is computed\">.",
    html: `<div id="superwidgets-w-tip" style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:22px;font-family:ui-sans-serif">
  <input data-role="bill" type="number" value="50" style="width:100%;background:#16181f;color:#fff;border:1px solid #333;padding:8px">
  <input data-role="tip" type="range" min="0" max="40" value="18" style="width:100%;accent-color:#EC3B4A">
  <div data-role="total" style="font-size:24px;color:#EC3B4A">$59.00</div>
  <button data-superwidgets-prompt="Explain how the tip total is computed" style="margin-top:12px;background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;border-radius:999px;padding:6px 14px;font-size:12px;cursor:pointer">Explain this calculation</button>
</div>
<script>(function(){var r=document.getElementById("superwidgets-w-tip");if(!r)return;var b=r.querySelector("[data-role=bill]"),t=r.querySelector("[data-role=tip]"),o=r.querySelector("[data-role=total]");function f(){o.textContent="$"+(parseFloat(b.value)*(1+parseFloat(t.value)/100)).toFixed(2);}b.addEventListener("input",f);t.addEventListener("input",f);})();</script>`,
  },
  pricing_table: {
    intent: "pricing_table",
    appliesWhen: "Tiered SaaS pricing — Free / Pro / Enterprise plans with per-tier feature comparison",
    keywords: ["pricing", "plans", "tiers", "subscription", "pro plan", "enterprise", "free plan", "billing", "saas pricing"],
    needsInteractivity: false,
    family: "dashboard",
    designNote:
      "3 (most common) or 4 tier cards in a row. Each card: tier name (small uppercase label) + " +
      "price (large, distinctive font) + optional tagline + vertical feature list with ✓ (included) " +
      "or ✗ (excluded) + per-tier CTA button with data-superwidgets-prompt. ONE tier is the recommended " +
      "tier — emphasize with Superwidgets red border (2px) and a 'Recommended' ribbon positioned above the " +
      "card. Other tiers use a 1px neutral border. Distinct from `table` (generic feature matrix) " +
      "because of the canonical pricing-card visual idiom.",
    html: `<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:Georgia,serif">
  <h3 style="margin:0 0 16px;font-size:18px">Choose your plan</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
    <div style="border:1px solid #e3dccd;padding:16px;border-radius:10px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#888">Free</div>
      <div style="font-size:28px;font-weight:700;margin:6px 0">$0<span style="font-size:14px;color:#888;font-weight:400">/mo</span></div>
      <ul style="list-style:none;padding:0;margin:10px 0;font-size:13px;line-height:1.8">
        <li>✓ 1 project</li>
        <li>✓ 100 events/mo</li>
        <li style="color:#aaa">✗ Email support</li>
      </ul>
      <button data-superwidgets-prompt="Sign me up for Free" style="width:100%;background:transparent;color:#1a1a1a;border:1px solid #ccc;padding:8px;border-radius:6px;cursor:pointer">Start free</button>
    </div>
    <div style="border:2px solid #EC3B4A;padding:16px;border-radius:10px;position:relative">
      <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#EC3B4A;color:#fff;padding:3px 10px;border-radius:999px;font-size:11px">Recommended</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#EC3B4A">Pro</div>
      <div style="font-size:28px;font-weight:700;margin:6px 0">$29<span style="font-size:14px;color:#888;font-weight:400">/mo</span></div>
      <ul style="list-style:none;padding:0;margin:10px 0;font-size:13px;line-height:1.8">
        <li>✓ Unlimited projects</li>
        <li>✓ 1M events/mo</li>
        <li>✓ Email + chat support</li>
      </ul>
      <button data-superwidgets-prompt="Sign me up for Pro" style="width:100%;background:#EC3B4A;color:#fff;border:0;padding:8px;border-radius:6px;cursor:pointer">Start Pro</button>
    </div>
    <div style="border:1px solid #e3dccd;padding:16px;border-radius:10px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#888">Enterprise</div>
      <div style="font-size:28px;font-weight:700;margin:6px 0">Custom</div>
      <ul style="list-style:none;padding:0;margin:10px 0;font-size:13px;line-height:1.8">
        <li>✓ SSO + audit logs</li>
        <li>✓ SLA + dedicated CSM</li>
      </ul>
      <button data-superwidgets-prompt="Contact sales" style="width:100%;background:transparent;color:#1a1a1a;border:1px solid #ccc;padding:8px;border-radius:6px;cursor:pointer">Contact sales</button>
    </div>
  </div>
</div>`,
  },
  timeline: {
    intent: "timeline",
    appliesWhen: "Chronological dated events — history, roadmap, or milestone sequence (forward- or backward-looking)",
    keywords: ["timeline", "history", "milestones", "roadmap", "chronological", "year", "events over time", "story of"],
    needsInteractivity: false,
    family: "static",
    designNote:
      "Vertical dated-event list. Layout: date column (left, monospace, right-aligned) + dot marker (middle, with a thin vertical line connecting all dots) + content (right: title + 1-line body). 3–8 events in chronological order. ONE event may be tone:'accent' — highlight with Superwidgets red date + Superwidgets red dot to mark the current / most-recent / key milestone. Each event container gets data-superwidgets-prompt=\"Tell me more about: [event title]\" + cursor:pointer. Distinct from `stepper` (process with todo/doing/done status) — timeline is DATED historical (or future) events with no status concept.",
    html: `<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:Georgia,serif">
  <h3 style="margin:0 0 16px;font-size:18px">Y Combinator — milestones</h3>
  <div style="position:relative;padding-left:120px">
    <div style="position:absolute;left:96px;top:0;bottom:0;width:2px;background:#e3dccd"></div>
    <div data-superwidgets-prompt="Tell me more about: YC founding (2005)" style="position:relative;padding-bottom:18px;cursor:pointer">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#666">2005</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#1a1a1a"></div>
      <div style="font-weight:600;font-size:14px">Founded by Paul Graham & Jessica Livingston</div>
      <div style="font-size:12px;color:#666;margin-top:2px">First batch funded 8 startups in summer 2005.</div>
    </div>
    <div data-superwidgets-prompt="Tell me more about: YC milestone (2024)" style="position:relative;padding-bottom:18px;cursor:pointer">
      <div style="position:absolute;left:-120px;top:2px;width:80px;text-align:right;font-family:ui-monospace,monospace;font-size:12px;color:#EC3B4A;font-weight:700">2024</div>
      <div style="position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:#EC3B4A"></div>
      <div style="font-weight:600;font-size:14px">~5,000 companies funded total</div>
      <div style="font-size:12px;color:#666;margin-top:2px">Combined valuation exceeds $600 billion.</div>
    </div>
  </div>
</div>`,
  },
  quiz: {
    intent: "quiz",
    appliesWhen: "Multiple-choice quiz with scoring. REQUIRES <form> + <script>.",
    keywords: ["quiz", "test", "questions", "score", "multiple choice", "trivia"],
    needsInteractivity: true,
    family: "interactive",
    designNote:
      "Form with radio inputs + script for scoring. Submit handler MUST call e.preventDefault(). " +
      "**Submit button MUST be labeled \"Check Score\" (or \"Check My Score\" / \"See My Score\") — not the " +
      "generic \"Submit\".** Clicking it computes and reveals the score; that's the action, name it. " +
      "After scoring, the score must be VISUALLY OBVIOUS — display in a prominent result panel with " +
      "accent color and large type (24–32px), not a tiny corner note. Consider per-question feedback " +
      "(✓ green for correct, ✗ red for incorrect) shown after submit. " +
      "**HARD RULE — NO data-superwidgets-prompt on the Check Score button OR on any radio / label.** " +
      "Check Score is a LOCAL action — computed by the widget's own script, results stay inside " +
      "the widget. The global click delegator preventDefaults any element with data-superwidgets-prompt, " +
      "which would BLOCK the form submit and prevent the score from ever being computed. Radios are " +
      "SELECTORS (clicking picks an option). The ONLY data-superwidgets-prompt elements in this widget are the " +
      "2 follow-up chips injected by the script AFTER the score is shown: " +
      "\"Ask me 3 more questions on [topic]\" (continuation) + \"Quiz me on [related topic]\" (branch). " +
      "Replace [topic] with the quiz's actual subject.",
    html: `<form id="superwidgets-w-quiz" style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:22px;font-family:ui-sans-serif">
  <fieldset style="border:1px solid #333;border-radius:8px;padding:12px"><legend>Q1</legend>
    <label><input type="radio" name="q1" value="a" data-correct> Right answer</label>
  </fieldset>
  <button type="submit" style="background:#EC3B4A;color:#fff;border:0;padding:10px 18px;border-radius:6px;font-weight:600;cursor:pointer">Check Score</button>
  <output data-role="out"></output>
</form>
<script>(function(){var f=document.getElementById("superwidgets-w-quiz");if(!f)return;var o=f.querySelector("[data-role=out]");f.addEventListener("submit",function(e){e.preventDefault();if(!o)return;o.innerHTML='<div style="font-size:24px;font-weight:700;color:#EC3B4A;margin:14px 0 8px">Score: 1/1</div><button data-superwidgets-prompt="Ask me 3 more questions on HTTP status codes" style="margin:4px 6px 0 0;background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer">More questions</button><button data-superwidgets-prompt="Quiz me on REST vs GraphQL" style="margin:4px 0 0;background:transparent;color:#888;border:1px solid #333;border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer">Related topic</button>';});})();</script>`,
  },
  form: {
    intent: "form",
    appliesWhen: "Collect structured input — signup, contact, settings, configuration",
    keywords: ["form", "signup", "contact form", "registration", "input", "settings page", "collect"],
    needsInteractivity: true,
    family: "interactive",
    designNote:
      "Use <form id=\"superwidgets-w-...\"> wrapper with 3–7 labeled <input>/<select>/<textarea> rows + a primary " +
      "submit <button type=\"submit\" data-superwidgets-prompt=\"Submit the form with the values shown\">. " +
      "IIFE <script> MUST addEventListener('submit', ...) and call e.preventDefault() at the top so the " +
      "page doesn't navigate on Enter-key submit. Optional: the script can read each input's .value, " +
      "construct a follow-up text containing the values, and re-set the submit button's data-superwidgets-prompt " +
      "before letting the next click dispatch. Distinct from calculator (live numeric recompute) and quiz (multi-question scoring).",
    html: `<form id="superwidgets-w-form" style="background:#0f1116;color:#e6e6e6;border-radius:14px;padding:22px;font-family:ui-sans-serif">
  <h3 style="margin:0 0 4px;font-size:16px">Sign up</h3>
  <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">All fields required</div>
  <label style="display:block;margin-bottom:10px">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Name</div>
    <input data-role="name" type="text" value="Jane Doe" style="width:100%;background:#16181f;color:#fff;border:1px solid #333;border-radius:6px;padding:8px;font-size:14px">
  </label>
  <label style="display:block;margin-bottom:10px">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Email</div>
    <input data-role="email" type="email" value="jane@example.com" style="width:100%;background:#16181f;color:#fff;border:1px solid #333;border-radius:6px;padding:8px;font-size:14px">
  </label>
  <label style="display:block;margin-bottom:14px">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Plan</div>
    <select data-role="plan" style="width:100%;background:#16181f;color:#fff;border:1px solid #333;border-radius:6px;padding:8px;font-size:14px"><option>Free</option><option>Pro</option><option>Enterprise</option></select>
  </label>
  <button type="submit" data-superwidgets-prompt="Submit signup form with the values shown" style="background:#EC3B4A;color:#fff;border:0;padding:10px 18px;border-radius:6px;width:100%;cursor:pointer;font-weight:600">Sign up</button>
</form>
<script>(function(){var f=document.getElementById("superwidgets-w-form");if(!f)return;f.addEventListener("submit",function(e){e.preventDefault();});})();</script>`,
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
