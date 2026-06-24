# Superwidgets

**A chat app where the model answers with a typed, interactive UI widget instead of a wall of text.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) ![Anthropic](https://img.shields.io/badge/Anthropic-D97757?style=flat&logo=anthropic&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)

## Overview

Most chat answers come back as markdown prose. That's a lossy interface for anything structured — a comparison, a plan, a set of metrics, a calculation. The user ends up re-parsing the paragraph into a mental table.

Superwidgets is a self-contained Next.js prototype that takes a different route: for each reply, the model builds a **single interactive HTML widget** — a comparison table, a decision card, an SVG chart, a flowchart, a live calculator, a multi-step form — and the app renders it inline. The model behaves like a UI-developer subagent that picks the right widget from a catalog, writes the HTML/SVG/JS to a house style, and wires it so that clicking any element (a table row, a chip, a chart bar) sends the next message and continues the conversation.

The interesting part is doing that safely and cheaply. Model-authored HTML is arbitrary, so every widget is validated and sanitized on the server before it touches the DOM. Token cost matters, so the app tracks per-turn input/output tokens, prompt-cache hit rate, and dollar cost live, and ships an evaluation harness that ranks every model against a fixed prompt set by cost-per-successful-render. It runs on three providers — Anthropic, Google Gemini, and OpenAI — behind one streaming interface.

I built this as one of the agentic-UI prototypes during my work at September AI, exploring how an LLM can drive a real UI rather than just emit text. It's a sibling to Skillet, which takes the same idea in a typed-React-renderer direction.

## Key Features

- **Widgets instead of prose** — the model returns one typed, interactive widget per turn from a catalog of 30 intents, sized and styled to a single house design language.
- **Click-to-continue interaction** — any element carrying a `data-superwidgets-prompt` attribute becomes a conversation hook; clicking it sends that payload as the next user message. A `data-superwidgets-confirm` flag pops a confirm dialog first for anything destructive.
- **Two-phase agentic tool loop** — a `build_widget` pre-flight call returns the design note for the chosen intent (cheap, ~10 output tokens), then `submit_widget` validates and renders. Invalid output loops back with concrete fix-it issues until it passes or hits the iteration cap.
- **Multi-provider engine** — Anthropic (Sonnet, Haiku), Google (Gemini Flash variants), and OpenAI (GPT-5.4 / 5.5 family) all sit behind one streaming `AgentTurnInvoker` contract, so the loop is provider-agnostic.
- **Server-side safety** — a structural + script validator runs before render, and DOMPurify sanitizes with an explicit attribute allowlist. Widgets are purely client-side: no network calls, no inline `on*` handlers, scripts scoped to an IIFE.
- **Live cost telemetry** — token usage, prompt-cache hit rate, and total USD cost are computed per turn from a per-model pricing table and shown in the UI.
- **Optional design skill** — a toggle prepends an extra front-end design preamble to the system prompt; the eval harness measures whether it's worth the extra input tokens.
- **Streaming throughout** — the API route streams Server-Sent Events (text deltas, tool calls, tool results, the final widget, usage) so the UI shows the agent's trace as it works.
- **Export** — download a single widget or the entire chat as a standalone HTML file.
- **Evaluation harness** — `npm run eval` sweeps every model × skill combination across the prompt set, scores each render structurally, and prints a ranking by cost-per-successful-render plus the top recommendations, writing every rendered widget to disk for visual review.

## How It Works

### Request flow

1. The user types in the composer.
2. The browser POSTs `{ message, history, providerId, useSkill }` to `/api/engine/execute`.
3. The route runs the agentic loop (`runEngine`, capped at 8 iterations) against the selected provider and streams the result back as Server-Sent Events.
4. The model gets two tools and a system prompt that frames it as a UI-dev subagent.
5. The finished widget HTML is sanitized with DOMPurify and injected into the DOM; an optional one-sentence prose preamble is streamed above it.
6. A global click delegator listens for `data-superwidgets-prompt` on any element and feeds its payload back in as the next message.

### The agentic loop

The engine (`lib/engine/run-engine.ts`) is an async generator. Each iteration invokes the provider, streams text deltas and tool calls back out as events, executes any tool calls, and appends the results to the running message list. The model is given exactly two tools:

- **`build_widget(intent)`** — Phase 1, pre-flight. Returns the design note plus skill-specific reminders (script-safety rules, special attributes) for the chosen widget intent. It's HTML-free and costs roughly 10 output tokens, so the design context is fresh when the model composes its HTML.
- **`submit_widget(intent, html, prose?)`** — Phase 2. Validates intent, HTML structure, and script safety in one pass. Valid output renders and ends the loop (the tool is marked terminal). Invalid output returns `{ valid: false, issues }`, and the agent loops back with corrected HTML.

```
build_widget(intent)  →  compose HTML  →  submit_widget(intent, html, prose?)
                                                 │
                                                 ├── valid?   render & exit (terminal)
                                                 └── invalid? fix HTML, submit again
```

The loop also accumulates token usage across iterations and emits a final usage event with computed cost and cache-hit rate. If the model never submits a valid widget within 8 iterations, or hits `max_tokens` first, the engine emits a clear error event instead.

### Widget catalog (30 intents)

Every widget is a self-contained block bounded by `<!--superwidgets-widget:start-->` / `<!--superwidgets-widget:end-->` sentinel comments, so the engine can extract exactly the inner HTML to render.

- **Static:** `chips`, `decision_card`, `confirm_card`, `stepper`, `checklist`, `timeline`, `table`, `chart`, `source_cards`, `code_block`, `inline_banner`
- **Diagrams (inline SVG):** `flowchart`, `venn_diagram`, `mind_map`, `sequence_diagram`, `tree_diagram`, `gantt_chart`, `map`
- **Charts (inline SVG):** `pie_chart`, `heatmap`, `scatter_plot`, `funnel_chart`, `radar_chart`
- **Dashboards:** `kpi_dashboard`, `profile_card`, `kanban_board`, `pricing_table`
- **Interactive (`<script>` ± `<form>`):** `calculator`, `quiz`, `form`

### Multi-provider engine

A single `AgentTurnInvoker` interface abstracts every model behind one streaming contract, so the loop never needs to know which provider it's talking to. The registry (`lib/engine/providers/index.ts`) maps a provider ID to a concrete invoker:

| Provider ID | Model | Input $/MTok | Output $/MTok | Cached input $/MTok |
|---|---|---|---|---|
| `sonnet` | claude-sonnet-4-6 | 3.00 | 15.00 | 0.30 |
| `haiku` | claude-haiku-4-5 | 1.00 | 5.00 | 0.10 |
| `gemini-3` | gemini-3-flash-preview | 0.50 | 3.00 | 0.05 |
| `gemini-3.1` | gemini-3.1-flash-lite-preview | 0.25 | 1.50 | 0.025 |
| `gpt-5.4-mini` | gpt-5.4-mini | 0.75 | 4.50 | 0.075 |
| `gpt-5.4` | gpt-5.4 | 2.50 | 15.00 | 0.25 |
| `gpt-5.5` | gpt-5.5 | 5.00 | 30.00 | 0.50 |

`pricing.ts` computes per-turn cost from these rates and the summed usage, and the cache-hit rate is just cached input tokens over total input tokens.

### Safety and validation

The validator (`lib/engine/tools/validate.ts`) mirrors the DOMPurify rules so the agent can self-check before rendering. In one pass it enforces:

- Exactly one widget block, correctly wrapped in the start/end sentinels.
- No forbidden tags (`iframe`, `style`, `object`, `embed`), no inline `on*=` handlers, no `<script src>`, no `<form action/method>`.
- A contrast rule — the root element must set both `background` and `color` inline.
- A size cap (20 KB per widget) and a balanced-tag check that ignores `<script>` bodies and void/SVG-leaf elements.
- At least one click target (`data-superwidgets-prompt`, or an external link for `source_cards`).
- Script safety — no `fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon`, no `eval` / `new Function` / `document.write`, and a forced `e.preventDefault()` on form submit handlers.

It also catches the most common LLM bug for interactive widgets: writing `.textContent` to an `<input>` (whose value renders from `.value`) or `.value` to a display element. It tracks each `data-role` binding and flags the mismatch with a specific message. Then `HtmlBubble.tsx` runs DOMPurify with an explicit attribute allowlist and de-collides the model-emitted `superwidgets-w-*` element IDs per instance so multiple widgets in one chat don't clash.

### Optional design skill

A `useSkill` toggle prepends a `FRONTEND_DESIGN_SKILL` preamble to the system prompt, adding a layer of house-style design guidance. Whether it improves output enough to justify the extra input tokens is exactly what the eval harness is for.

## Results / Highlights

The evaluation harness (`eval/run.ts`) is the headline measurement tool. It runs every `(model × skill on/off)` combination — 14 combos across the 7 providers — against the prompt set, with 2 trials each. For each render it scores structure (content present, root has background and color, required interactivity, inline SVG where expected, no forbidden tags, no event handlers, balanced tags), counts a pass at 80% of checks, and ranks combos by cost-per-successful-render. It prints an average cost / pass% / success% / latency / cache% table and a top-5 recommendation list, and writes every rendered widget to `eval/outputs/*.html` for visual review along with a timestamped raw JSON results file. Actual numbers depend on your API keys and live model pricing, so run the sweep to get figures for your setup.

## Tech Stack

- **Language:** TypeScript 5.7
- **Frameworks / libraries:** Next.js 15 (App Router), React 19, Tailwind CSS 3.4 (PostCSS + Autoprefixer), lucide-react, react-markdown + remark-gfm, react-syntax-highlighter
- **LLM / agent:** `@anthropic-ai/sdk`, `@google/generative-ai`, `openai`; custom two-tool agentic loop over Server-Sent Events
- **Safety:** DOMPurify with an attribute allowlist plus a custom structural/script validator
- **Tooling:** tsx (eval runner), Node.js runtime

## Getting Started

### Prerequisites

- Node.js 20.12+ (the eval runner uses `process.loadEnvFile`)
- An API key for at least one provider (Anthropic, Google Gemini, or OpenAI)

### Installation

```bash
git clone https://github.com/DCode-v05/Superwidgets.git
cd Superwidgets
npm install
```

### Configure API keys

```bash
cp .env.local.example .env.local
```

Add a key for at least the provider(s) you intend to use:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-genai-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

### Running

```bash
npm run dev          # dev server at http://localhost:3000
# or
npm run build && npm run start   # production build
```

## Usage

- **Chat** — type a request like *"Compare PostgreSQL vs ClickHouse"*, *"Plan a product launch in 5 steps"*, or *"Show revenue trend over 6 months"*, and the model replies with the widget that fits.
- **Interact** — click any chip, table row, decision-card CTA, chart bar, or SVG node. Its `data-superwidgets-prompt` payload becomes your next message and drives the conversation forward.
- **Switch models** — use the mode selector to pick any provider, toggle the design skill on or off, and watch the live cost / cache-hit readout update per turn.
- **Export** — download a single widget or the whole chat as a standalone HTML file.
- **Benchmark** — run `npm run eval` to sweep all model × skill combos and rank them by cost-per-successful-render.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the project |
| `npm run eval` | Cost-efficiency sweep across providers and skills |

## Project Structure

```
Superwidgets/
├── app/
│   ├── api/engine/execute/route.ts    # SSE endpoint — streams EngineEvents
│   ├── globals.css                    # Tailwind layers + widget bubble animation
│   ├── layout.tsx                     # Root layout & metadata
│   └── page.tsx                       # Mounts the chat shell
├── components/
│   ├── chat/                          # ChatShell, ChatInput, message list, mode/cost/prompt UI
│   ├── output/                        # OutputSystem, HtmlBubble (DOMPurify), AgentTrace, InlineTextRenderer
│   └── ui/button.tsx                  # Shared UI primitive
├── lib/
│   ├── engine/
│   │   ├── run-engine.ts              # Agentic loop (≤ 8 iterations), SSE event generator
│   │   ├── system-prompt-freeform.ts  # UI-dev subagent system prompt
│   │   ├── frontend-design-skill.*    # Optional design-skill preamble
│   │   ├── pricing.ts                 # Per-provider $/MTok + cost computation
│   │   ├── providers/                 # anthropic | google | openai invokers + registry
│   │   └── tools/                     # build_widget / submit_widget · schemas · executors · validate · widget-library
│   ├── hooks/useChat.ts               # SSE consumer + reducer over EngineEvent
│   ├── types/engine-widgets.ts        # EngineEvent / ChatMessage definitions
│   ├── download-page.ts               # Export the chat as standalone HTML
│   └── download-widget.ts             # Export a single widget
├── eval/
│   ├── run.ts                         # `npm run eval` cost-efficiency sweep
│   └── prompts.ts                     # Test prompt set
├── .env.local.example                 # API-key template
├── next.config.ts · tailwind.config.ts · tsconfig.json · postcss.config.mjs
├── package.json
└── README.md
```

---

## Contact

**Portfolio:** [Denistan](https://www.denistan.me)<br>
**LinkedIn:** [Denistan](https://www.linkedin.com/in/denistanb)<br>
**GitHub:** [DCode-v05](https://github.com/DCode-v05)<br>
**LeetCode:** [Denistan_B](https://leetcode.com/u/Denistan_B)<br>
**Email:** [denistanb05@gmail.com](mailto:denistanb05@gmail.com)

Made with ❤️ by **Denistan B**
