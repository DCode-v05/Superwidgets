# Mini-BAP

A self-contained Next.js prototype where every assistant reply is a self-contained, interactive **HTML, React, or typed-widget** response instead of a wall of text. The user types → the engine streams a short prose intro + one widget (a decision card, table, chart, code block, banner, etc.) → clicking any chip / CTA fires the next turn automatically.

> Built to compare how **different models**, **prompt skills**, **output formats**, and **single-LLM vs router-specialist pipelines** trade off on widget quality, latency, and cost — with **token usage shown on every reply** so the trade-offs are measurable.

---

## What the prototype is actually showing

This is an experiment grid, not a one-shot demo. Four orthogonal axes you can toggle from the UI before each turn:

| Axis | Toggle | Values |
|---|---|---|
| **Model** | Dropdown in the footer | Sonnet 4.6, Haiku 4.5, Gemini 2.5 Flash, Gemini 2.0 Flash Lite, GPT-4o Mini, GPT-4o, GPT-5 |
| **Frontend Design Skill** | "Skill" pill | ON / OFF — prepends a design-philosophy doc to the system prompt |
| **Output format** | HTML / React / **Typed** segmented pill | Three render paths — see "Output formats" below |
| **Routing strategy** | "Pipeline" pill | OFF = one LLM call per turn / ON = **router agent → specialist agent** (2 LLM calls) |

Every assistant reply shows the token-usage footer: input / output / cache hit % / USD cost / which model · format · skill · routing produced it.

### Output formats

| Format | What the model emits | How the frontend renders it | Files |
|---|---|---|---|
| **HTML** | Raw HTML inside `<!--bap-widget:start--> … <!--bap-widget:end-->` sentinels | DOMPurify-sanitized, dropped into a chat bubble via `dangerouslySetInnerHTML` | [HtmlBubble.tsx](components/output/HtmlBubble.tsx) |
| **React** | A complete React TSX functional component as source text | `sucrase` transpiles + `react-live` evaluates and renders | [ReactLiveBubble.tsx](components/output/ReactLiveBubble.tsx) |
| **Typed** ⭐ | One or more `<ui-widget kind="…" id="…">{…JSON…}</ui-widget>` directives | Parser extracts kind + payload → **renderer registry** dispatches each to a dedicated React component | [registry.tsx](components/output/widgets/registry.tsx) + 10 widgets |

**The typed path is the architecture this README originally promised.** Each widget kind has its own typed payload schema and its own React renderer. Adding a new kind = one new file in `components/output/widgets/` + one line in the registry. No string parsing in the renderer, no `dangerouslySetInnerHTML`, full prop typing.

---

## The 10 widget intents

The model picks ONE intent per turn from this catalog:

| # | Intent | When the model picks it | Visual form |
|---|---|---|---|
| 1 | `chips` | Pure conversational, no clear visual fit | Row of `data-bap-prompt` buttons |
| 2 | `decision_card` | User must pick between 2–4 options with tradeoffs | Side-by-side cards with pros/cons + CTA per option |
| 3 | `confirm_card` | Destructive / irreversible action ("delete", "send to 200 users") | Confirmation panel with `data-bap-confirm` proceed button |
| 4 | `stepper` | Multi-step plan or process ("plan a launch in 5 steps") | Vertical timeline with numbered steps |
| 5 | `checklist` | List of items to tick off ("code review checklist") | Items with checkbox-style entries |
| 6 | `source_cards` | Citations / research with external links | Card grid with title, snippet, external `href` — the **only** widget where `href` is allowed |
| 7 | `table` | Tabular comparison or feature matrix | HTML `<table>` with header + structured rows |
| 8 | `chart` | Numeric trend over time | Inline SVG (`400×220` viewBox), bar/line/area only |
| 9 | `code_block` | Code snippet | `<pre><code>` block with hand-colored syntax spans |
| 10 | `inline_banner` | Status / outcome notice (success / warn / info / error) | Colored banner with title + body |

Each intent lives in its own specialist-prompt file at [`lib/engine/skills/<intent>.ts`](lib/engine/skills/). Adding an 11th intent = create one new skill file + register it in [`lib/engine/skills/index.ts`](lib/engine/skills/index.ts) + add a line to [`lib/engine/router-prompt.ts`](lib/engine/router-prompt.ts).

### The typed widget registry

In `Typed` mode the same 10 intents are rendered by **dedicated React components**, one per kind:

| Kind | Renderer | Notes |
|---|---|---|
| `chips` | [ChipsWidget](components/output/widgets/ChipsWidget.tsx) | Native button row |
| `decision_card` | [DecisionCardWidget](components/output/widgets/DecisionCardWidget.tsx) | Side-by-side options with pros/cons + CTA |
| `confirm_card` | [ConfirmCardWidget](components/output/widgets/ConfirmCardWidget.tsx) | Danger / neutral tone, `data-bap-confirm` on proceed |
| `stepper` | [StepperWidget](components/output/widgets/StepperWidget.tsx) | Vertical numbered timeline with status icons |
| `checklist` | [ChecklistWidget](components/output/widgets/ChecklistWidget.tsx) | Click-to-toggle items with local state |
| `source_cards` | [SourceCardsWidget](components/output/widgets/SourceCardsWidget.tsx) | Citations with enforced `target="_blank" rel="noopener noreferrer"` |
| `table` | [TableWidget](components/output/widgets/TableWidget.tsx) | Sortable structure + per-cell highlight via `payload.highlight` |
| `chart` | [ChartWidget](components/output/widgets/ChartWidget.tsx) | Pure-SVG bar/line/area — geometry computed in the renderer from typed data |
| `code_block` | [CodeBlockWidget](components/output/widgets/CodeBlockWidget.tsx) | `react-syntax-highlighter` (Prism `oneDark`) + Copy button |
| `inline_banner` | [InlineBannerWidget](components/output/widgets/InlineBannerWidget.tsx) | 4-tone palette with matching icon, border, tinted bg |
| _(unknown kind)_ | [FallbackWidget](components/output/widgets/FallbackWidget.tsx) | Shows the raw payload JSON for debugging |

Widget payload types live in [`lib/types/widgets-typed.ts`](lib/types/widgets-typed.ts). The model is taught the per-kind payload shape via [`lib/engine/system-prompt-typed.ts`](lib/engine/system-prompt-typed.ts). The wire format is parsed by [`lib/engine/widget-parser-typed.ts`](lib/engine/widget-parser-typed.ts) into a stream of `typed_widget` events; the frontend's [`useChat`](lib/hooks/useChat.ts) reducer collects them into `message.typedWidgets`, which [`TypedBubble`](components/output/TypedBubble.tsx) walks and dispatches via [`renderTypedWidget`](components/output/widgets/registry.tsx). One bad widget can't blow up the bubble — there's a per-widget error boundary that falls back to `FallbackWidget`.

**Why typed mode is cheaper than HTML on the same prompt**: the JSON payload is roughly **half the size** of the equivalent HTML markup (no inline styles, no decorative wrapper divs, no SVG attribute strings). Empirically Haiku produces the same chart in 303 output tokens (typed, $0.004) vs 1,579 (HTML, $0.011) — a 2.7× cost reduction.

---

## The agent builder (router → specialist pipeline)

When **Pipeline = ON**, every turn fires **two** LLM calls:

```
user message
   │
   ▼
┌────────────────────┐
│  WIDGET ROUTER     │  system prompt = lib/engine/router-prompt.ts
│  (1st LLM call)    │  job: read the message, output exactly ONE intent word
└─────────┬──────────┘
          │  "chart"  (one lowercase token)
          ▼
┌────────────────────┐
│  WIDGET SPECIALIST │  system prompt = base contract + skills/<intent>.ts
│  (2nd LLM call)    │  job: render the chosen widget's HTML / React
└─────────┬──────────┘
          ▼
       streamed reply  ──►  user sees "_Router picked **chart**._" + the widget
```

The router is a tiny classifier agent — its only job is to pick one of 10 intents. The specialist is a focused-prompt agent that only knows how to build *one* widget kind well. Same code can run both as `Pipeline = OFF` (one general agent handles everything in a single call — cheaper, less reliable on widget choice) or `Pipeline = ON` (router + specialist — more tokens, sharper widget selection).

This is the "agent builder" pattern — the prototype isn't building agents at runtime, it's *composing* them via:
- A shared **base contract** ([`lib/engine/skills/base.ts`](lib/engine/skills/base.ts)) — sanitizer rules, sentinel grammar, contrast non-negotiable, interactivity convention.
- An optional **design skill** ([`lib/engine/frontend-design-skill.md`](lib/engine/frontend-design-skill.md)) — toggled by the Skill pill.
- A **router prompt** that knows the catalog ([`lib/engine/router-prompt.ts`](lib/engine/router-prompt.ts)).
- 10 **specialist prompts**, each a self-contained skill with its own example HTML and aesthetic guidance.
- An optional **React override** ([`lib/engine/react-mode-override.ts`](lib/engine/react-mode-override.ts)) — toggled by the HTML/React pill, rewrites the output format from raw HTML to JSX TSX.

[`lib/engine/run-engine.ts`](lib/engine/run-engine.ts) is the orchestrator that picks which prompts to compose per turn.

---

## Setup

```bash
npm install
cp .env.local.example .env.local   # then paste your real keys
npm run dev
# open http://localhost:3000
```

### Environment variables ([`.env.local`](.env.local))

| Variable | Required for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sonnet 4.6, Haiku 4.5 | Uses the beta prompt-caching endpoint (SDK 0.32.x) for cache hit metrics |
| `OPENAI_API_KEY` | GPT-4o Mini, GPT-4o, GPT-5 | GPT-5 runs with `reasoning_effort: "low"` |
| `GOOGLE_API_KEY` | Gemini 2.5 Flash, Gemini 2.0 Flash Lite | Free-tier quotas apply; project spend cap blocks calls if exceeded |
| `GROQ_API_KEY` | — | Reserved for a future Llama provider. Not consumed by any current provider — safe to leave set or unset |

**⚠️ Note on Google**: if your Google project has hit its monthly spend cap, all Gemini calls return `429 RESOURCE_EXHAUSTED` regardless of which Gemini model you pick. Manage at <https://ai.studio/spend>. Anthropic and OpenAI keys are independent and unaffected.

---

## Demo prompts (wired into the empty-state)

These live in [`lib/test-prompts.ts`](lib/test-prompts.ts) (Empty State component renders them as one-click chips):

| Prompt | Expected intent |
|---|---|
| Hello — what can you do? | `chips` |
| Should I use REST or GraphQL for my new API? | `decision_card` |
| Send a cold email to 200 prospects from my list | `confirm_card` |
| Plan a product launch in 5 steps | `stepper` |
| Give me a code review checklist for a Next.js PR | `checklist` |
| Tell me about Y Combinator with sources | `source_cards` |
| Compare AWS Lambda, Vercel Functions, and Cloudflare Workers in a table | `table` |
| Show me revenue trend over the last 6 months | `chart` |
| Write a Python function that fetches a URL with retries | `code_block` |
| Confirm that my deploy went through successfully | `inline_banner` |

Click any chip in the AI's reply — its `data-bap-prompt` payload becomes the next user turn automatically. Buttons with `data-bap-confirm` trigger a `window.confirm()` first.

---

## Architecture in 30 seconds

```
ChatInput ─► useChat.send({ providerId, useSkill, pipeline, outputFormat })
                │
                └─► POST /api/engine/execute  (SSE)
                          │
                          └─ lib/engine/run-engine.ts
                                     │
                                     ├─ if pipeline: ROUTER_PROMPT  → provider().stream
                                     │              → parse intent  → composeSpecialistPrompt()
                                     │              → provider().stream → runWidgetParser()
                                     │
                                     └─ else: composed single-prompt → provider().stream
                                                                     → runWidgetParser()
                                            │
                                            ▼
                          text_delta + widget_html + usage events
                                            │
                                            ▼
                  useChat reducer ─► ChatMessage { text, widgetHtml, usage,
                                                   outputFormat, useSkill, pipeline }
                                            │
                                            ▼
                  OutputSystem ─► InlineTextRenderer (text)
                                + HtmlBubble       (outputFormat=html, DOMPurify-sanitized)
                                  OR
                                  ReactLiveBubble  (outputFormat=react, sucrase + react-live)
                                            │
                                            ▼
                                ChatMessage.UsageFooter
                                  (tokens · cache% · USD · model · format · skill · routing)
```

Output flows as Server-Sent Events. Three event types matter: `text_delta` (prose chunks), `widget_html` (the one widget block, emitted whole), `usage` (one event at end of turn with input/output/cached token counts + computed USD cost).

---

## Mode matrix — what each combination teaches you

| Combination | What you're testing |
|---|---|
| Anthropic + Skill OFF + HTML + Single | Cheapest baseline; does Sonnet/Haiku produce good widgets without design coaching? |
| OpenAI/Google + Skill ON + HTML + Single | Do smaller / non-Anthropic models *need* the design skill to produce passable widgets? |
| Any model + HTML + **Pipeline** | Does explicit router picking improve widget choice over single-LLM intent guessing? Worth the 2× token cost? |
| Any model + **React** + Single | Can the model produce JSX-valid TSX (not just HTML strings) without compile errors? |
| Premium (GPT-5, Sonnet 4.6) + Skill ON + React + Pipeline | Most "complete" run — and most expensive. Useful to anchor "as good as it gets" vs cheaper combos. |

The token-usage footer makes all of these directly comparable — eyeball the widget quality, glance at the USD figure and the cache-hit %.

---

## Adding a new widget intent

For **HTML / React modes** (model emits markup directly):

1. Add the intent name to the `WidgetIntent` union and `WIDGET_INTENTS` array in [`lib/engine/skills/index.ts`](lib/engine/skills/index.ts).
2. Create [`lib/engine/skills/<name>.ts`](lib/engine/skills/) — one `export const SKILL = "..."` string with a worked example HTML block.
3. Register it in the `SKILLS` map in [`lib/engine/skills/index.ts`](lib/engine/skills/index.ts).
4. Add a one-line entry to [`lib/engine/router-prompt.ts`](lib/engine/router-prompt.ts) under "Valid intents" and "When to pick each".
5. Optionally add test prompts in [`lib/test-prompts.ts`](lib/test-prompts.ts).
6. No frontend code needed — HTML is sanitized by [`HtmlBubble.tsx`](components/output/HtmlBubble.tsx); React TSX by [`ReactLiveBubble.tsx`](components/output/ReactLiveBubble.tsx).

For **Typed mode** (model emits structured JSON):

1. Add the kind to the `WidgetKind` union and the per-kind payload interface in [`lib/types/widgets-typed.ts`](lib/types/widgets-typed.ts).
2. Add a per-kind schema + worked example to [`lib/engine/system-prompt-typed.ts`](lib/engine/system-prompt-typed.ts) so the model knows the payload shape.
3. Create [`components/output/widgets/<Name>Widget.tsx`](components/output/widgets/) — a React component taking `{ payload, actions? }`. Use [`shared.tsx`](components/output/widgets/shared.tsx) for `WidgetShell`, `WidgetHeader`, `ActionChips`.
4. Register the renderer in the `REGISTRY` map in [`components/output/widgets/registry.tsx`](components/output/widgets/registry.tsx).
5. No parser changes — the typed-widget parser handles any kind in the union.

If a new HTML widget needs tags outside the sanitizer allowlist, extend [`HtmlBubble.tsx`](components/output/HtmlBubble.tsx)'s `SANITIZE_CONFIG`. Don't remove existing entries.

---

## Cost calculator

The "Calculator" link in the header opens a model-comparison modal — punch in expected input/output tokens + cache hit %, see USD/call across all 7 models with the cheapest highlighted. Pricing data lives in [`lib/engine/pricing.ts`](lib/engine/pricing.ts) and is matched 1:1 with the model registry.

---

## Key files

- [`app/api/engine/execute/route.ts`](app/api/engine/execute/route.ts) — SSE handler.
- [`lib/engine/run-engine.ts`](lib/engine/run-engine.ts) — orchestrator: single-call vs pipeline.
- [`lib/engine/providers/`](lib/engine/providers/) — Anthropic / Google / OpenAI invokers, each exposing `{ stream, usage() }`.
- [`lib/engine/skills/`](lib/engine/skills/) — base contract + 10 specialist prompts.
- [`lib/engine/router-prompt.ts`](lib/engine/router-prompt.ts) — the router agent prompt.
- [`lib/engine/system-prompt-freeform.ts`](lib/engine/system-prompt-freeform.ts) — the single-call prompt (covers all 10 intents in one).
- [`lib/engine/react-mode-override.ts`](lib/engine/react-mode-override.ts) — appended when `outputFormat=react`.
- [`lib/engine/widget-parser.ts`](lib/engine/widget-parser.ts) — state-machine that splits the LLM stream into text + widget events.
- [`lib/engine/pricing.ts`](lib/engine/pricing.ts) — per-model pricing table + `computeCost` / `estimateCost`.
- [`lib/hooks/useChat.ts`](lib/hooks/useChat.ts) — client SSE consumer + reducer over engine events.
- [`components/output/OutputSystem.tsx`](components/output/OutputSystem.tsx) — switches between HtmlBubble and ReactLiveBubble per message.
- [`components/output/HtmlBubble.tsx`](components/output/HtmlBubble.tsx) — DOMPurify-sanitized HTML render.
- [`components/output/ReactLiveBubble.tsx`](components/output/ReactLiveBubble.tsx) — `sucrase` + `react-live` for safe TSX evaluation.
- [`components/chat/ModeSelector.tsx`](components/chat/ModeSelector.tsx) — model / skill / format / pipeline UI.
- [`components/chat/CostCalculator.tsx`](components/chat/CostCalculator.tsx) — cost-comparison modal.
- [`components/chat/ChatMessage.tsx`](components/chat/ChatMessage.tsx) — assistant bubble + UsageFooter + download/copy actions.

---

## Non-goals

- No auth, no persistence, no users — refresh = new chat.
- No artifact panel, no voice, no file uploads.
- No streaming widget deltas. Widgets are emitted whole (one `widget_html` event per turn).
- No Socket.IO. SSE only.

---

## License

Prototype — internal use.
