# mini-bap

A self-contained Next.js prototype that demonstrates the **Interactive UI Responses** architecture from [`../INTERACTIVE_UI_RESPONSES_PLAN.md`](../INTERACTIVE_UI_RESPONSES_PLAN.md): the AI's reply is composed of typed UI widgets — chips, decision cards, charts, flowcharts, tables, steppers — instead of plain markdown text.

The chat UX mirrors BAP's Super Chat: streaming bubbles, lucide icons, the BAP red accent (`#EC3B4A`), and a textarea composer at the bottom.

## What it shows

1. The user types in a textarea.
2. The browser POSTs `{ message, history }` to `/api/engine/execute`.
3. The route streams Server-Sent Events back from the **real LLM** (Anthropic Claude), instructed via system prompt to emit `<ui-widget kind="..." id="...">JSON</ui-widget>` directives. A server-side parser strips the directives and translates them into typed `ui:widget_*` SSE events.
4. The frontend's `useChat` hook reduces the SSE event stream into a `ChatMessage` with an interleaved `blocks: (text | widget)[]` array.
5. `OutputSystem` walks the blocks. Text is rendered via `react-markdown`. Widgets are dispatched through a typed **renderer registry** to dedicated React components.
6. Clicking any chip / decision-card CTA / confirm button fires a new turn with the action's payload as the next user message.

## The 12 widgets

| Kind | Renderer | Library |
|---|---|---|
| `chips` | [ChipsWidget](components/output/widgets/ChipsWidget.tsx) | native button |
| `decision_card` | [DecisionCardWidget](components/output/widgets/DecisionCardWidget.tsx) | native |
| `confirm_card` | [ConfirmCardWidget](components/output/widgets/ConfirmCardWidget.tsx) | native |
| `stepper` | [StepperWidget](components/output/widgets/StepperWidget.tsx) | framer-motion |
| `checklist` | [ChecklistWidget](components/output/widgets/ChecklistWidget.tsx) | native |
| `tabs` | [TabsWidget](components/output/widgets/TabsWidget.tsx) | radix tabs |
| `source_cards` | [SourceCardsWidget](components/output/widgets/SourceCardsWidget.tsx) | native |
| `table` | [TableWidget](components/output/widgets/TableWidget.tsx) | `@tanstack/react-table` |
| `chart` | [ChartWidget](components/output/widgets/ChartWidget.tsx) | `recharts` |
| `flowchart` | [FlowchartWidget](components/output/widgets/FlowchartWidget.tsx) | `mermaid` |
| `code_block` | [CodeBlockWidget](components/output/widgets/CodeBlockWidget.tsx) | `react-syntax-highlighter` |
| `inline_banner` | [InlineBannerWidget](components/output/widgets/InlineBannerWidget.tsx) | native |

Any other widget kind falls through to [`FallbackWidget`](components/output/widgets/FallbackWidget.tsx).

## Setup

```bash
npm install
cp .env.local.example .env.local
# then put your key in .env.local
npm run dev
# open http://localhost:3000
```

`ANTHROPIC_API_KEY` is required — the route has no fallback.

### Environment variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | **Required.** |
| `ANTHROPIC_MODEL` | Optional override. Defaults to `claude-sonnet-4-6`. |

## Demo prompts

These are wired into the empty-state chips:

| Prompt | Widgets you should see |
|---|---|
| Compare PostgreSQL vs ClickHouse | text → table → decision_card → chips |
| How does OAuth 2.0 work? | text → flowchart → chips |
| Plan a product launch in 5 steps | text → stepper → chips |
| Show me revenue trend over the last 6 months | text → chart → chips |
| Write a hello world in Python | text → code_block → chips |
| Should I send this email to 200 users? | text → confirm_card. Click Send → inline_banner success |
| Show me a checklist for code review | text → checklist → chips |
| What's the difference between SQL and NoSQL? | text → tabs → chips |
| Tell me about Y Combinator | text → source_cards → chips |

Click any chip — the chip's `prompt` payload becomes the next user turn automatically.

## Architecture in 30 seconds

```
ChatInput  ─► useChat.send()
                │
                └─► fetch POST /api/engine/execute  (SSE)
                          │
                          └─ lib/engine/run-engine.ts
                                     │
                                     ├─ streamFromAnthropic()       (anthropic-client.ts)
                                     └─ runWidgetParser()           (widget-parser.ts)
                                            │
                                            ▼
                          inline_text_delta + ui:widget_start + ui:widget_complete
                                            │
                                            ▼
useChat reducer ─► ChatMessage { blocks: (text | widget)[], widgets: { id → state } }
                                            │
                                            ▼
                          OutputSystem walks blocks ─► InlineTextRenderer / renderWidget()
```

## Key files

- [`app/api/engine/execute/route.ts`](app/api/engine/execute/route.ts) — SSE handler.
- [`lib/types/engine-widgets.ts`](lib/types/engine-widgets.ts) — `WidgetKind` union and per-widget payload types.
- [`lib/engine/system-prompt.ts`](lib/engine/system-prompt.ts) — LLM prompt with widget-directive guide.
- [`lib/engine/widget-parser.ts`](lib/engine/widget-parser.ts) — state-machine parser for `<ui-widget>` directives in the LLM token stream.
- [`lib/hooks/useChat.ts`](lib/hooks/useChat.ts) — chat state + SSE consumer + reducer over `EngineEvent`.
- [`components/output/OutputSystem.tsx`](components/output/OutputSystem.tsx) — walks `message.blocks` and dispatches each block.
- [`components/output/widgets/registry.tsx`](components/output/widgets/registry.tsx) — `WidgetKind → renderer` map.

## Adding a new widget kind

1. Add the kind to `WidgetKind` union and define a `*Payload` interface in [`lib/types/engine-widgets.ts`](lib/types/engine-widgets.ts).
2. Create `components/output/widgets/<Name>Widget.tsx` consuming `RendererProps`.
3. Register it in [`components/output/widgets/registry.tsx`](components/output/widgets/registry.tsx).
4. Add a section to [`lib/engine/system-prompt.ts`](lib/engine/system-prompt.ts) telling the LLM when and how to use it.
That is the full surface. No engine internals to touch.

## Non-goals

- No auth, no persistence, no users — refresh = new chat.
- No artifact panel, no voice, no file uploads.
- No `ui:widget_delta` JSON Patch streaming. Widgets are all-or-nothing.
- No Socket.IO. SSE only.

## License

Prototype — internal use.
