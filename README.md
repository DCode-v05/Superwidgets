# Superwidgets

A chat app where the model answers each message with one interactive HTML widget (table, chart, flowchart, calculator, form) instead of prose.

I built it at September AI as one of their agentic-UI prototypes. Skillet is the sibling project: same idea, but the model returns typed JSON and React components do the rendering. Here the model writes the HTML itself, so the work is in validating and sanitising it.

## How it works

1. The browser POSTs `{ message, history, providerId, useSkill }` to `/api/engine/execute`.
2. The route runs `runEngine` (`lib/engine/run-engine.ts`), an async generator capped at 8 iterations, and streams Server-Sent Events back: text deltas, tool calls, tool results, the final widget and a usage summary.
3. The model has two tools. `build_widget(intent)` is a cheap pre-flight call that returns the design note and script-safety reminders for that widget type. `submit_widget(intent, html, prose?)` validates the HTML and, if it passes, renders it and ends the loop (the tool is terminal). If it fails, the issues go back to the model and it resubmits.
4. The client sanitises the HTML with DOMPurify (`components/output/HtmlBubble.tsx`) and injects it. A click handler picks up any element with `data-superwidgets-prompt` and sends that value as the next user message. `data-superwidgets-confirm` shows a confirm dialog first.

Every widget sits between `<!--superwidgets-widget:start-->` and `<!--superwidgets-widget:end-->` so the engine can extract the inner HTML.

### Widget catalog

30 intents:

- Static: `chips`, `decision_card`, `confirm_card`, `stepper`, `checklist`, `timeline`, `table`, `chart`, `source_cards`, `code_block`, `inline_banner`
- Inline SVG diagrams: `flowchart`, `venn_diagram`, `mind_map`, `sequence_diagram`, `tree_diagram`, `gantt_chart`, `map`
- Inline SVG charts: `pie_chart`, `heatmap`, `scatter_plot`, `funnel_chart`, `radar_chart`
- Dashboards: `kpi_dashboard`, `profile_card`, `kanban_board`, `pricing_table`
- Interactive, with a `<script>` and sometimes a `<form>`: `calculator`, `quiz`, `form`

### Validation

`lib/engine/tools/validate.ts` checks that a widget:

- has exactly one widget block in the sentinels
- uses no `iframe`, `style`, `object` or `embed` tags, no inline `on*=` handlers, no `<script src>` and no `<form action/method>`
- sets `background` and `color` inline on the root element
- is under 20 KB and has balanced tags
- has at least one click target (`data-superwidgets-prompt`, or an external link for `source_cards`)
- has scripts without `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `eval`, `new Function` or `document.write`, and form handlers that call `e.preventDefault()`

It also flags a common model mistake in interactive widgets: writing `.textContent` to an `<input>` or `.value` to a display element, by tracking each `data-role` binding.

### Providers and cost

Anthropic, Google and OpenAI adapters in `lib/engine/providers/` implement one `AgentTurnInvoker` interface. `lib/engine/pricing.ts` has per-million-token rates:

| Provider ID | Model | Input | Output | Cached input |
|---|---|---|---|---|
| `sonnet` | claude-sonnet-4-6 | 3.00 | 15.00 | 0.30 |
| `haiku` | claude-haiku-4-5 | 1.00 | 5.00 | 0.10 |
| `gemini-3` | gemini-3-flash-preview | 0.50 | 3.00 | 0.05 |
| `gemini-3.1` | gemini-3.1-flash-lite-preview | 0.25 | 1.50 | 0.025 |
| `gpt-5.4-mini` | gpt-5.4-mini | 0.75 | 4.50 | 0.075 |
| `gpt-5.4` | gpt-5.4 | 2.50 | 15.00 | 0.25 |
| `gpt-5.5` | gpt-5.5 | 5.00 | 30.00 | 0.50 |

The UI shows tokens, cache-hit rate and dollar cost per turn. A `useSkill` toggle prepends an extra front-end design preamble to the system prompt.

### Eval harness

`npm run eval` runs every model with the design skill on and off (14 combinations), 2 trials per prompt. Each render is scored on structural checks and counts as a pass at 80%. Combinations are ranked by cost per successful render. Rendered widgets are written to `eval/outputs/` for visual review, along with a timestamped JSON results file. I haven't recorded numbers in this repo because they depend on your keys and current pricing.

## Stack

TypeScript, Next.js 15 (App Router), React 19, Tailwind CSS 3, DOMPurify, `@anthropic-ai/sdk`, `@google/generative-ai`, `openai`, `react-markdown`, `react-syntax-highlighter`, `tsx` for the eval runner.

## Setup

Node 20.12+ (the eval script uses `process.loadEnvFile`).

```bash
git clone https://github.com/DCode-v05/Superwidgets.git
cd Superwidgets
npm install
cp .env.local.example .env.local
```

Put a key for each provider you want in `.env.local`: `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`.

```bash
npm run dev      # http://localhost:3000
npm run build && npm run start
npm run eval
```

Try prompts like "Compare PostgreSQL vs ClickHouse" or "Plan a product launch in 5 steps". A single widget or the whole chat can be downloaded as a standalone HTML file.

## Project structure

```
app/                    chat page and the SSE endpoint (api/engine/execute)
components/chat/        shell, input, message list, mode selector, cost readout, prompt library
components/output/      OutputSystem, HtmlBubble (DOMPurify), AgentTrace, InlineTextRenderer
lib/engine/             run-engine, system prompt, providers/, tools/, pricing, design-skill preamble
lib/hooks/useChat.ts    SSE consumer and chat state
lib/types/              EngineEvent and ChatMessage types
eval/                   run.ts sweep and prompts.ts
```

## Contact

Denistan B: [portfolio](https://www.denistan.me), [LinkedIn](https://www.linkedin.com/in/denistanb), denistanb05@gmail.com
