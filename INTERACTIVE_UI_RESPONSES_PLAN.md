# Interactive UI Responses — Implementation Plan

> **Scope**: Replace plain-text AI responses in **Super Chat** with rich, interactive UI widgets the AI can compose into its reply.
> **Audience**: Engineers working across `bap-engine` (Python/FastAPI), `bap-backend` (NestJS), and `bap-web/bap-frontend` (Next.js).
> **Outcome**: When the user sends a message, the system replies with a composed surface of typed UI widgets — flowcharts, chips, cards, charts, steppers — instead of a paragraph of markdown.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goal & Scope](#2-goal--scope)
3. [Current State Baseline](#3-current-state-baseline)
4. [Design Principles](#4-design-principles)
5. [Architecture](#5-architecture)
6. [New Engine Event Types](#6-new-engine-event-types)
7. [UI Response Type Catalog](#7-ui-response-type-catalog)
   - 7.1 [Choice & Input](#71-choice--input)
   - 7.2 [Structured Content](#72-structured-content)
   - 7.3 [Data & Metrics](#73-data--metrics)
   - 7.4 [Diagrams & Visualizations](#74-diagrams--visualizations)
   - 7.5 [Workspace-style](#75-workspace-style)
   - 7.6 [Media & Rich](#76-media--rich)
   - 7.7 [Status & Feedback](#77-status--feedback)
   - 7.8 [Conversational / Playful](#78-conversational--playful)
8. [Engine-Side: When to Emit Which UI](#8-engine-side-when-to-emit-which-ui)
9. [Frontend File Changes](#9-frontend-file-changes)
10. [Phased Rollout](#10-phased-rollout)
11. [Testing Strategy](#11-testing-strategy)
12. [Open Questions & Decisions](#12-open-questions--decisions)
13. [Glossary](#13-glossary)

---

## 1. Executive Summary

Today, when a user sends a message in `/super-chat`, the engine streams markdown text back via `inline_text_delta` events. The frontend renders this with `streamdown` + `react-markdown` + syntax-highlighted code blocks. The result *feels* like a wall of text: paragraphs, occasional bullet lists, occasional code fences.

This plan upgrades the response surface to a **composable system of interactive widgets**. The AI's reply becomes a *layout* of typed UI blocks — chips, decision cards, flowcharts, comparison tables, steppers, kanban boards, calendar pickers, mindmaps, etc. — each rendered by a dedicated React component.

Two complementary tracks:

- **Track A (frontend-only, ships fast)**: detect content patterns in the existing markdown stream and render them as widgets without engine changes. Tables become sortable grids, ` ```mermaid` fences become diagrams, `[1]` citations become popovers, etc.
- **Track B (engine + frontend)**: introduce new typed engine events (`ui:chips`, `ui:decision_card`, `ui:flowchart`, `ui:kanban`, …) so the LLM can *explicitly* choose a widget type and emit a structured payload the frontend renders directly. This is more powerful, less ambiguous, and unlocks widgets that can't be expressed in markdown.

The frontend builds a **Renderer Registry** keyed by event type. Adding a new UI type is one event-name + one React component.

---

## 2. Goal & Scope

### In scope

- Super Chat AI response rendering — the assistant bubble area.
- `useEngineStream` + `OutputSystem` render path.
- `streamdown` / `react-markdown` pipeline extensions for Track A.
- New engine event types and corresponding `september-engine` LLM prompts for Track B.
- 60+ UI widget types organized in 8 categories.

### Out of scope (separate efforts)

- `/messages` (human-to-human chat) — covered by a separate plan.
- The user *input* composer (text box, voice mode, attachments) — not changed here.
- Legacy SSE inline-render path (`USE_OUTPUT_SYSTEM = false` branch) — will be deleted as part of Phase 1.
- Engine internals beyond the public event-emission contract (the `september-engine` package is sealed; we modify only the prompt + emission layer in `bap-engine`).

### Success criteria

- Any new UI widget type can be added in **≤200 LoC** (one event type entry + one renderer component).
- The LLM can compose a reply mixing markdown prose with up to **5 distinct widget types** in a single turn.
- 80% of typical "research / compare / plan" prompts surface at least one non-prose widget.
- Zero regressions in streaming UX — text deltas still feel immediate; widgets that need full payload appear after stream-complete or once their payload is whole.

---

## 3. Current State Baseline

### Render path

```
user types -> SuperChatContext.sendMessage()
   -> engineSocketService.emit('ie:execute', {...})
   -> bap-backend /engine (Socket.IO /engine namespace)
   -> bap-engine /execute (SSE)
   -> stream of typed events back through the chain
   -> useEngineStream reduces to EngineStreamState
   -> OutputSystem dispatches each event to a renderer
   -> components in components/output/ + components/super-chat/
```

### Today's 16 typed engine events (from `useEngineStream`)

| Event | Renderer | Plain-text? |
|---|---|---|
| `inline_text_delta` | `InlineTextRenderer` (streamdown) | YES — this is the "wall of text" |
| `thinking_delta` / `thinking_complete` | `ThinkingBlock` collapsible | already structured |
| `tool_activity` | `ToolActivityIndicator` | already structured |
| `craft_created` | `ArtifactCard` + auto-open `ArtifactPanel` | already structured |
| `awareness` | inline banner | already structured |
| `hitl_prompt` | `HitlPromptComponent` modal + `HitlInlineCard` | already structured |
| `mission_progress` | `MissionProgressPanel` | already structured |
| `execution_complete` | `ExecutionSummaryFooter` + `ResponseActions` | already structured |
| `struggling` | warning pill | already structured |
| `slot_picker` | `SlotPicker` (radio options) | already structured |
| `slot_routing` | route hint pill | already structured |
| `asset_required` | `AssetRequiredPrompt` | already structured |
| `thread_started` / `thread_ended` | thread boundary markers | structured |
| `error` | error UI | structured |

The takeaway: the **non-text events are already structured widgets**. The pain point is that `inline_text_delta` carries 70–90% of the actual answer content as plain markdown. That's the surface we're upgrading.

### Existing rendering libraries (already in `package.json`)

- `streamdown` — streaming markdown
- `react-markdown` + `remark-gfm` + `rehype-sanitize` — final-pass markdown
- `react-syntax-highlighter` — code blocks
- `cytoscape` + `cytoscape-react-wrapper` — network graphs (used elsewhere)
- `three` / `ogl` — 3D + voice orb
- `framer-motion` — animations
- `gsap` — heavier animation
- `unicode-emoji-json` — emoji picker

We'll add: `mermaid`, `recharts` (or `@visx/visx`), `react-katex` / `katex`, `@tanstack/react-table`, `react-diff-view`, `dnd-kit` (kanban), `react-day-picker`, `react-json-view-lite`.

---

## 4. Design Principles

1. **Composable, not monolithic.** A response is a *list* of widget blocks (mixing prose + widgets), not one giant blob. The LLM picks block types like building blocks.
2. **Streaming-first.** Widgets that can stream (charts, tables, lists) progressively populate. Widgets that need a complete payload (a decision card) wait for `widget_complete`.
3. **Typed contract.** Each widget is identified by `kind` + a structured `payload`. No string-parsing in the renderer.
4. **Graceful degradation.** If a widget renderer is missing on the client (older deploy, plugin not loaded), the engine attaches a `fallback_markdown` string the frontend renders instead.
5. **Frontend-detect when possible.** Common markdown patterns (tables, code, math, mermaid fences, citations) get rendered as widgets without engine changes. Track A.
6. **Engine-emit when ambiguity hurts.** Complex widgets (kanban, calendar, decision card) must come from the engine — markdown is too lossy.
7. **Action chips are first-class.** Every widget can carry trailing `actions: [{label, payload}]`. Clicking sends `payload` back as the user's next turn (or as an HITL response).
8. **One renderer = one file.** Each widget renderer lives at `components/output/widgets/<Kind>.tsx`. Registration in `components/output/widgets/registry.ts`.
9. **Dark-mode + a11y native.** Every widget respects Tailwind `.dark`, has keyboard nav, and exposes ARIA roles.
10. **No emojis baked into widget chrome.** Decorative emojis live in text content, not in widget UI.

---

## 5. Architecture

### 5.1 Engine → Frontend Contract

The engine emits a new family of events under the `ui:*` namespace. Each carries a discriminated-union payload.

```ts
// Frontend: lib/types/engine-widgets.ts (new file)

export type WidgetKind =
  // Choice & Input
  | 'chips' | 'quick_reply' | 'decision_card' | 'confirm_card'
  | 'inline_form' | 'slider' | 'toggle_group' | 'date_picker'
  | 'multi_select_chips' | 'poll' | 'rating'
  // Structured Content
  | 'stepper' | 'checklist' | 'accordion' | 'tabs'
  | 'cards_grid' | 'source_cards' | 'link_unfurl' | 'footnote'
  | 'code_block' | 'diff' | 'math' | 'tree_view'
  // Data & Metrics
  | 'table' | 'chart' | 'sparkline' | 'kpi_tiles'
  | 'heatmap' | 'gauge' | 'comparison_matrix' | 'pricing_table'
  // Diagrams
  | 'flowchart' | 'sequence_diagram' | 'state_diagram'
  | 'mindmap' | 'timeline' | 'gantt' | 'org_chart'
  | 'network_graph' | 'er_diagram' | 'journey_map' | 'architecture_diagram'
  // Workspace
  | 'kanban' | 'calendar' | 'pipeline' | 'spreadsheet'
  | 'outline' | 'whiteboard'
  // Media
  | 'image_gallery' | 'image_annotated' | 'video_player'
  | 'audio_waveform' | 'map' | 'model_3d' | 'color_swatches' | 'avatar_stack'
  // Status & Feedback
  | 'progress' | 'status_badge' | 'inline_banner' | 'memory_pill' | 'tool_chip'
  // Conversational
  | 'quiz' | 'wizard' | 'branching_dialogue' | 'reveal' | 'sticky_notes';

export interface WidgetEnvelope<K extends WidgetKind = WidgetKind, P = unknown> {
  widget_id: string;        // unique per turn, used for streaming updates
  kind: K;
  payload: P;
  actions?: WidgetAction[]; // trailing chips/buttons
  meta?: {
    title?: string;
    description?: string;
    collapsible?: boolean;
    collapsed_default?: boolean;
    span?: 'full' | 'half' | 'third';   // layout hint
  };
  fallback_markdown?: string;
}

export interface WidgetAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  payload: {
    // What the click sends back
    kind: 'prompt' | 'hitl_response' | 'navigate' | 'noop';
    value: string | Record<string, unknown>;
  };
  icon?: string;       // lucide-react icon name
  confirm?: boolean;
}

// Three engine events drive a widget's lifecycle:
// 1. ui:widget_start  — { widget_id, kind, meta }
// 2. ui:widget_delta  — { widget_id, patch }      // partial payload updates (JSON Patch RFC 6902)
// 3. ui:widget_complete — { widget_id, payload, actions }
```

### 5.2 Event-Type Registry (Frontend)

`useEngineStream` is extended to maintain a `widgets: Map<widget_id, WidgetState>`. New cases in the reducer:

```ts
// lib/hooks/useEngineStream.ts (extended)
case 'ui:widget_start':
  draft.widgets.set(e.widget_id, { kind: e.kind, payload: {}, status: 'streaming', meta: e.meta });
  draft.blockOrder.push({ type: 'widget', widget_id: e.widget_id });
  break;
case 'ui:widget_delta':
  applyJsonPatch(draft.widgets.get(e.widget_id).payload, e.patch);
  break;
case 'ui:widget_complete':
  const w = draft.widgets.get(e.widget_id);
  w.payload = e.payload;
  w.actions = e.actions;
  w.status = 'complete';
  break;
```

`blockOrder` is the **composition** — an ordered list of `text | widget | thinking | tool_activity | …` blocks. `OutputSystem` walks `blockOrder` top-to-bottom and renders each.

### 5.3 Renderer Registry

```ts
// components/output/widgets/registry.ts (new file)
import type { WidgetKind } from '@/lib/types/engine-widgets';

type RendererProps<P> = {
  widget_id: string;
  payload: P;
  actions?: WidgetAction[];
  meta?: WidgetEnvelope['meta'];
  status: 'streaming' | 'complete';
  onAction: (action: WidgetAction) => void;
};

export const widgetRegistry: Record<WidgetKind, React.FC<RendererProps<any>>> = {
  chips: ChipsWidget,
  decision_card: DecisionCardWidget,
  flowchart: FlowchartWidget,
  // … one entry per kind
};

export function renderWidget(state: WidgetState, onAction: (a: WidgetAction) => void) {
  const Renderer = widgetRegistry[state.kind] ?? FallbackWidget;
  return <Renderer {...state} onAction={onAction} />;
}
```

`FallbackWidget` renders `meta.title` + `fallback_markdown` (or a "this widget isn't supported in your version" message). This makes deploys safe even when the engine emits a kind the client doesn't know.

### 5.4 Markdown Auto-Detect Layer (Track A)

The existing markdown pipeline gets *post-render* transformers and *fence* handlers:

```ts
// components/ui/response.tsx (existing — extended)
const remarkPlugins = [remarkGfm, remarkMath, remarkMermaidDetect, remarkCitationDetect];
const rehypePlugins = [rehypeKatex, rehypeSanitize];

const components = {
  code: CodeBlockWithActions,    // adds Run/Copy/Diff buttons
  table: InteractiveTable,       // upgrades to @tanstack/react-table
  a: LinkUnfurl,                 // turns URLs into unfurl cards
  pre: ({ children }) => detectMermaid(children) ? <Mermaid {...} /> : <pre>{children}</pre>,
};
```

This Track A layer detects: tables, citations `[1]`/`[^1]`, URLs, ` ```mermaid `, ` ```chart `, math `$…$`, code fences, checkbox lists `[ ]`. Each becomes a widget without any engine change.

### 5.5 Streaming Semantics

Three classes of widgets:

| Class | Examples | How it streams |
|---|---|---|
| **Stream-friendly** | text, table rows, list items, chart datapoints, mindmap branches | renderer accepts partial payload; UI populates progressively via `ui:widget_delta` |
| **All-or-nothing** | decision_card, confirm_card, inline_form | renderer waits for `ui:widget_complete`; shows a skeleton placeholder during `streaming` |
| **Lazy-asset** | image_gallery, video_player, model_3d, map | renderer shows placeholder + caption from `meta.title` immediately, fetches asset URL when payload completes |

`useEngineStream` exposes `state.widgets.get(id).status` so each renderer chooses behavior.

### 5.6 Composition (multiple widgets in one reply)

The LLM's plan for one turn might be:

```
1. brief prose intro            (inline_text_delta)
2. a 3-step plan                (ui:stepper)
3. a comparison of 2 tools      (ui:comparison_matrix)
4. follow-up suggestion chips   (ui:chips)
```

The engine emits these in order. `blockOrder` preserves the interleaving. The user sees a layered response: text → stepper → matrix → chips.

A widget can also have **nested actions** that send new prompts back. Clicking a comparison-matrix row's "Tell me more" chip starts a new turn with the row's payload.

---

## 6. New Engine Event Types

Defined in `bap-engine` and emitted via the existing SSE stream. The backend's `engineSocketService` translator forwards them onto the `/engine` Socket.IO namespace as-is.

### 6.1 Lifecycle events

| Event | Payload | Purpose |
|---|---|---|
| `ui:widget_start` | `{ widget_id, kind, meta? }` | Reserve a slot in `blockOrder`; UI shows skeleton |
| `ui:widget_delta` | `{ widget_id, patch: JsonPatch }` | Apply a partial update (streaming class only) |
| `ui:widget_complete` | `{ widget_id, payload, actions? }` | Final payload; widget transitions to interactive |
| `ui:widget_error` | `{ widget_id, error }` | Renderer shows error state with retry chip |

### 6.2 Action callback events (user → engine)

When the user clicks a widget action:

```ts
// Frontend dispatches via existing engineSocketService.emit:
emit('ui:action', {
  widget_id: 'wgt_abc',
  action_id: 'act_confirm',
  payload: { /* from the action */ }
});
```

The engine handles this in its action-router. For `kind: 'prompt'`, the engine treats the value as a new user turn. For `kind: 'hitl_response'`, it routes via existing HITL path. `noop` is purely visual / local.

### 6.3 Backwards compatibility

- Existing 16 events stay untouched.
- Older clients ignore `ui:*` events (no `widgetRegistry`, no `blockOrder.widget`). They still get the `fallback_markdown` injected into the `inline_text_delta` stream by the engine.
- Engine feature flag `EMIT_UI_WIDGETS=true|false` per org/user — staged rollout.

---

## 7. UI Response Type Catalog

Each subsection: **Purpose**, **Triggers**, **Event(s)**, **Payload**, **Renderer**, **Library**, **Streaming**, **Effort (S/M/L)**, **Example**.

---

### 7.1 Choice & Input

#### 7.1.1 Chips (suggestion / follow-up)

- **Purpose**: A row of clickable chips at the end of a reply that send a follow-up prompt on click.
- **Triggers**: End of nearly every reply; "What else would you like to know?" intents.
- **Event**: `ui:widget_complete` with `kind: 'chips'`.
- **Payload**: `{ chips: [{ id, label, prompt: string, icon?: string }] }`.
- **Renderer**: `components/output/widgets/ChipsWidget.tsx`. Horizontal flex-wrap row; each chip clickable; on click emits `ui:action`.
- **Library**: native (shadcn `Button` + Tailwind).
- **Streaming**: all-or-nothing (small payload).
- **Effort**: **S** (~150 LoC).
- **Example payload**:

```json
{
  "widget_id": "wgt_chips_01",
  "kind": "chips",
  "payload": {
    "chips": [
      { "id": "c1", "label": "Tell me more", "prompt": "Tell me more about X" },
      { "id": "c2", "label": "Show me code", "prompt": "Show me code for X" },
      { "id": "c3", "label": "Compare with Y", "prompt": "Compare X with Y" }
    ]
  }
}
```

#### 7.1.2 Quick-Reply Buttons

- **Purpose**: Yes/no or small single-choice cluster; tighter than chips.
- **Triggers**: AI asks a binary or 3-way clarification.
- **Event**: `ui:widget_complete` with `kind: 'quick_reply'`.
- **Payload**: `{ question?: string, options: [{ id, label, value }] }`.
- **Renderer**: `QuickReplyWidget.tsx`. Vertical or horizontal button cluster.
- **Library**: shadcn `Button`.
- **Streaming**: all-or-nothing.
- **Effort**: **S**.

#### 7.1.3 Decision Card

- **Purpose**: Rich multi-option picker with title + body + metadata + CTA per option.
- **Triggers**: "Should I use A or B?", "Pick a plan", "Choose a template".
- **Event**: `ui:widget_complete` with `kind: 'decision_card'`.
- **Payload**:

```ts
{
  question: string;
  options: Array<{
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    pros?: string[];
    cons?: string[];
    badges?: Array<{ label: string; tone: 'good' | 'warn' | 'info' }>;
    cta_label: string;
    score?: number;       // 0..100 for sort/recommend
    recommended?: boolean;
  }>;
  layout?: 'cards' | 'stacked';
}
```

- **Renderer**: `DecisionCardWidget.tsx`. Cards grid; highlight `recommended`; click CTA emits action.
- **Library**: shadcn `Card`, `Badge`, `Button`.
- **Streaming**: all-or-nothing (cards land together) — option array can use `widget_delta` for slow LLM outputs.
- **Effort**: **M** (~300 LoC).
- **Example**:

```json
{
  "kind": "decision_card",
  "payload": {
    "question": "Which database for your usage logs?",
    "options": [
      {
        "id": "pg", "title": "PostgreSQL", "recommended": true,
        "pros": ["Strong consistency", "RLS already in stack"],
        "cons": ["Higher write cost than TSDB"],
        "cta_label": "Use PostgreSQL"
      },
      {
        "id": "clickhouse", "title": "ClickHouse",
        "pros": ["10x faster aggregations"],
        "cons": ["Operational overhead", "No transactions"],
        "cta_label": "Use ClickHouse"
      }
    ]
  }
}
```

#### 7.1.4 Confirm Card

- **Purpose**: Gate destructive or expensive AI actions ("I'll send 200 emails — confirm?").
- **Triggers**: Engine detects an action with side effects.
- **Event**: `ui:widget_complete` with `kind: 'confirm_card'`.
- **Payload**: `{ title, summary, details?: string[], danger?: boolean, confirm_label, cancel_label, payload_on_confirm }`.
- **Renderer**: `ConfirmCardWidget.tsx`. Red border if `danger`; checklist of side effects; primary + ghost button.
- **Library**: shadcn `Card`, `AlertDialog`.
- **Streaming**: all-or-nothing.
- **Effort**: **S–M**.

#### 7.1.5 Inline Form

- **Purpose**: AI needs structured inputs to proceed ("Fill in to schedule the call").
- **Triggers**: HITL prompts that benefit from typed fields.
- **Event**: `ui:widget_complete` with `kind: 'inline_form'`.
- **Payload**:

```ts
{
  fields: Array<{
    id: string;
    type: 'text' | 'number' | 'email' | 'url' | 'textarea' | 'select' | 'multiselect' | 'date' | 'time' | 'datetime' | 'toggle' | 'slider' | 'rating';
    label: string;
    placeholder?: string;
    default?: unknown;
    required?: boolean;
    options?: Array<{ id: string; label: string; value: unknown }>;   // select/multiselect
    min?: number; max?: number; step?: number;                        // number/slider
    validation?: { pattern?: string; message?: string };
  }>;
  submit_label: string;
}
```

- **Renderer**: `InlineFormWidget.tsx`. `react-hook-form` driven; submits all values as an action.
- **Library**: `react-hook-form`, shadcn form primitives.
- **Streaming**: all-or-nothing.
- **Effort**: **M–L**.

#### 7.1.6 Slider

- **Purpose**: Tune a numeric parameter ("How aggressive should I be? 0–10").
- **Triggers**: Engine offers a tunable knob mid-flow.
- **Event**: `ui:widget_complete` with `kind: 'slider'`.
- **Payload**: `{ label, min, max, step, default, ticks?: number[], unit?: string, payload_template }`.
- **Renderer**: `SliderWidget.tsx`. shadcn `Slider`. Submit button or auto-debounced.
- **Library**: shadcn `Slider`.
- **Streaming**: all-or-nothing.
- **Effort**: **S**.

#### 7.1.7 Toggle Group / Segmented Control

- **Purpose**: Switch between modes (Summary vs Details vs Code).
- **Triggers**: AI offers multiple views of the same content.
- **Event**: `ui:widget_complete` with `kind: 'toggle_group'`. Often paired with `kind: 'tabs'` if mode controls visible content.
- **Payload**: `{ label, options: [{ id, label }], default_id }`.
- **Renderer**: `ToggleGroupWidget.tsx`. shadcn `ToggleGroup`.
- **Library**: shadcn.
- **Streaming**: all-or-nothing.
- **Effort**: **S**.

#### 7.1.8 Date / Time Picker

- **Purpose**: Schedule, deadline, reminder selection.
- **Triggers**: AI proposes scheduling.
- **Event**: `ui:widget_complete` with `kind: 'date_picker'`.
- **Payload**: `{ mode: 'date' | 'time' | 'datetime' | 'range', default?: ISOString, min?: ISOString, max?: ISOString, suggested?: ISOString[] }`.
- **Renderer**: `DatePickerWidget.tsx`. `react-day-picker` calendar; suggested-time chips above.
- **Library**: `react-day-picker`, `date-fns`.
- **Streaming**: all-or-nothing.
- **Effort**: **M**.

#### 7.1.9 Multi-Select Chips / Tag Cloud

- **Purpose**: Pick multiple tags / labels to filter or scope.
- **Triggers**: AI offers facets to narrow ("Pick categories you care about").
- **Event**: `ui:widget_complete` with `kind: 'multi_select_chips'`.
- **Payload**: `{ chips: [{ id, label, value, group?: string }], min_select?: number, max_select?: number, submit_label }`.
- **Renderer**: `MultiSelectChipsWidget.tsx`. Toggleable chips with visual selected state.
- **Library**: shadcn `Toggle`, `Badge`.
- **Streaming**: all-or-nothing.
- **Effort**: **S**.

#### 7.1.10 Poll

- **Purpose**: Let user vote between AI-suggested options; tally visible.
- **Triggers**: AI suggests options that benefit from a vote (especially in shared chats).
- **Event**: `ui:widget_complete` with `kind: 'poll'`.
- **Payload**: `{ question, options: [{ id, label, count?: number }], multi?: boolean, ends_at?: ISOString }`.
- **Renderer**: `PollWidget.tsx`. Bar per option; click to vote; counts animate.
- **Library**: shadcn `Progress`, `Button`.
- **Streaming**: counts can stream via `widget_delta`.
- **Effort**: **M**.

#### 7.1.11 Star Rating / NPS

- **Purpose**: Capture sentiment / opinion mid-flow.
- **Triggers**: After a recommendation, AI asks "How does this feel?".
- **Event**: `ui:widget_complete` with `kind: 'rating'`.
- **Payload**: `{ label, scale: 5 | 7 | 10, mode: 'stars' | 'thumbs' | 'numeric' }`.
- **Renderer**: `RatingWidget.tsx`. Star row or thumb pair or 0–10 grid.
- **Library**: lucide-react icons.
- **Streaming**: all-or-nothing.
- **Effort**: **S**.

---

### 7.2 Structured Content

#### 7.2.1 Stepper

- **Purpose**: Numbered process / plan with progress, expand-per-step.
- **Triggers**: "How do I…", "Step-by-step", "Set up …".
- **Event**: `ui:widget_complete` (or progressive via `widget_delta` per step).
- **Payload**: `{ orientation: 'vertical' | 'horizontal', steps: [{ id, title, description?, status: 'pending' | 'active' | 'done' | 'error', eta?: string, body_markdown?: string, actions?: WidgetAction[] }] }`.
- **Renderer**: `StepperWidget.tsx`. Numbered nodes connected by line; active step expanded; done steps show checkmark.
- **Library**: native + `framer-motion`.
- **Streaming**: yes — steps stream in.
- **Effort**: **M**.

#### 7.2.2 Checklist / Interactive Todos

- **Purpose**: Items the user ticks off; can be sent back as "done".
- **Triggers**: "Things to verify…", "Tasks to do…".
- **Event**: `ui:widget_complete` with `kind: 'checklist'`.
- **Payload**: `{ title?, items: [{ id, label, description?, checked?: boolean, action?: WidgetAction }] }`.
- **Renderer**: `ChecklistWidget.tsx`. Checkbox per item; ticking emits action with item id; option "save to tasks".
- **Library**: shadcn `Checkbox`.
- **Streaming**: yes — items stream in.
- **Effort**: **S–M**.

#### 7.2.3 Accordion / FAQ

- **Purpose**: Collapsible Q&A or section-by-section content.
- **Triggers**: Long answer with distinct sub-topics.
- **Event**: `ui:widget_complete` with `kind: 'accordion'`.
- **Payload**: `{ items: [{ id, header, body_markdown, default_open?: boolean }] }`.
- **Renderer**: `AccordionWidget.tsx`. shadcn `Accordion`; markdown body inside.
- **Library**: shadcn `Accordion`.
- **Streaming**: yes.
- **Effort**: **S**.

#### 7.2.4 Tabs

- **Purpose**: Same answer in multiple views (Summary | Details | Sources | Code).
- **Triggers**: Long answer that benefits from view switching; LLM can emit multiple representations.
- **Event**: `ui:widget_complete` with `kind: 'tabs'`.
- **Payload**: `{ tabs: [{ id, label, icon?, body: Block[] }] }` where `Block` is any other widget envelope or a `{ kind: 'markdown', text }` block.
- **Renderer**: `TabsWidget.tsx`. shadcn `Tabs`; each tab renders nested blocks via `renderWidget` recursively.
- **Library**: shadcn `Tabs`.
- **Streaming**: yes — tabs stream in.
- **Effort**: **M**.

#### 7.2.5 Cards Grid

- **Purpose**: Recommendations, search results, options.
- **Triggers**: "Find me options", "Show me 5 alternatives".
- **Event**: `ui:widget_complete` with `kind: 'cards_grid'`.
- **Payload**: `{ columns?: 1 | 2 | 3 | 4, cards: [{ id, image_url?, title, subtitle?, body?, footer?, actions?: WidgetAction[] }] }`.
- **Renderer**: `CardsGridWidget.tsx`. Responsive grid via Tailwind.
- **Library**: shadcn `Card`.
- **Streaming**: yes — cards stream in.
- **Effort**: **M**.

#### 7.2.6 Source Cards

- **Purpose**: Citation list with favicon + title + snippet (e.g., for web_search results).
- **Triggers**: Engine ran `web_search` or `web_fetch`; reply cites sources.
- **Event**: emit `ui:widget_complete` with `kind: 'source_cards'`.
- **Payload**: `{ sources: [{ id, url, title, snippet?, favicon_url?, published_at?: ISOString }] }`.
- **Renderer**: `SourceCardsWidget.tsx`. Horizontal scroll rail or stacked list; clickable to open URL or fetch full snippet.
- **Library**: native.
- **Streaming**: yes.
- **Effort**: **S–M**.

#### 7.2.7 Link Unfurl

- **Purpose**: Rich preview of one URL inline (OG metadata).
- **Triggers**: Markdown contains a URL; or engine emits explicitly.
- **Event**: `ui:widget_complete` with `kind: 'link_unfurl'` OR auto-detected in Track A.
- **Payload**: `{ url, title, description?, image_url?, site_name?, favicon_url? }`.
- **Renderer**: `LinkUnfurlWidget.tsx`. Compact card with thumb + title + description.
- **Library**: backend OG-metadata fetcher endpoint (`GET /api/utility/og?url=…`).
- **Streaming**: all-or-nothing.
- **Effort**: **M** (needs backend endpoint).

#### 7.2.8 Footnote Popover

- **Purpose**: `[1]` markers in prose that open a citation preview on hover/click.
- **Triggers**: Markdown contains `[^1]`, `[1]`, or explicit footnote markers.
- **Event**: Track A — frontend-only. Optionally `ui:widget_complete` with `kind: 'footnote'`.
- **Payload**: `{ footnotes: [{ id, marker, body_markdown }] }`.
- **Renderer**: Inline `<sup>` wrapped in shadcn `HoverCard`.
- **Library**: shadcn `HoverCard`.
- **Streaming**: derived from source_cards.
- **Effort**: **S**.

#### 7.2.9 Code Block With Actions

- **Purpose**: Code fences become a card with Copy / Run / Diff / Open-in-craft.
- **Triggers**: Any ` ``` ` fence with a language.
- **Event**: Track A.
- **Payload**: Inferred from markdown fence.
- **Renderer**: Wrap existing `react-syntax-highlighter` in a card with action row.
- **Library**: existing.
- **Streaming**: yes.
- **Effort**: **S**.

#### 7.2.10 Diff View

- **Purpose**: Show before/after for a code change or doc edit.
- **Triggers**: Engine modifies a craft / file; or user asks "what changed".
- **Event**: `ui:widget_complete` with `kind: 'diff'`.
- **Payload**: `{ before, after, language?: string, view?: 'unified' | 'split' }`.
- **Renderer**: `DiffWidget.tsx`. `react-diff-view`.
- **Library**: `react-diff-view`.
- **Streaming**: all-or-nothing.
- **Effort**: **M**.

#### 7.2.11 Math (KaTeX)

- **Purpose**: Inline `$…$` or block `$$…$$` equations rendered properly.
- **Triggers**: Markdown contains math delimiters.
- **Event**: Track A — frontend-only via `remark-math` + `rehype-katex`.
- **Library**: `katex`, `remark-math`, `rehype-katex`.
- **Streaming**: yes (re-renders when delta stabilizes).
- **Effort**: **S**.

#### 7.2.12 Tree View

- **Purpose**: Collapsible hierarchy (file tree, JSON, taxonomy, outline).
- **Triggers**: "Show me the file structure", "Outline this doc", JSON output.
- **Event**: `ui:widget_complete` with `kind: 'tree_view'`.
- **Payload**: `{ root: TreeNode }` where `TreeNode = { id, label, icon?, badge?, children?: TreeNode[] }`.
- **Renderer**: `TreeViewWidget.tsx`. Recursive component with expand/collapse, search filter.
- **Library**: native or `react-arborist`.
- **Streaming**: yes — nodes stream in.
- **Effort**: **M**.

---

### 7.3 Data & Metrics

#### 7.3.1 Interactive Table

- **Purpose**: Tabular data with sort, filter, search, pagination, export.
- **Triggers**: Tabular markdown or engine emits structured rows.
- **Event**: `ui:widget_complete` with `kind: 'table'` (or Track A on markdown table).
- **Payload**: `{ columns: [{ id, header, type: 'string'|'number'|'date'|'badge'|'link' }], rows: Record<string, unknown>[], default_sort?: { column, dir }, page_size?: number }`.
- **Renderer**: `TableWidget.tsx`. `@tanstack/react-table` with column sort/filter, virtualized rows.
- **Library**: `@tanstack/react-table`, `@tanstack/react-virtual`.
- **Streaming**: yes — rows stream in.
- **Effort**: **M–L**.

#### 7.3.2 Charts (Bar / Line / Pie / Area / Scatter)

- **Purpose**: Visualize trends, distributions, composition.
- **Triggers**: "Show trend", "Compare metrics", any numeric series.
- **Event**: `ui:widget_complete` with `kind: 'chart'`.
- **Payload**:

```ts
{
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  data: Array<Record<string, number | string>>;
  x_key: string;
  y_keys: string[];
  options?: {
    stacked?: boolean;
    smooth?: boolean;
    legend?: boolean;
    grid?: boolean;
    colors?: string[];
    annotations?: Array<{ x: unknown; label: string }>;
  };
}
```

- **Renderer**: `ChartWidget.tsx`. Recharts; theme-aware colors.
- **Library**: `recharts`.
- **Streaming**: data array can stream via `widget_delta`.
- **Effort**: **M**.

#### 7.3.3 Sparkline

- **Purpose**: Inline tiny chart next to a number.
- **Triggers**: KPI mentioned with trend; embedded in tables/text.
- **Event**: Often inline within `kpi_tiles` or `table`. Standalone via `kind: 'sparkline'`.
- **Payload**: `{ data: number[], color?, height? }`.
- **Renderer**: `SparklineWidget.tsx`. `recharts` `<LineChart>` micro-mode.
- **Library**: `recharts`.
- **Streaming**: no — small payload.
- **Effort**: **S**.

#### 7.3.4 KPI Tiles / Scorecards

- **Purpose**: Big numbers + delta + sparkline in tile form.
- **Triggers**: "Key metrics", dashboards, status.
- **Event**: `ui:widget_complete` with `kind: 'kpi_tiles'`.
- **Payload**: `{ tiles: [{ label, value, unit?, delta?: { value, direction: 'up'|'down'|'flat' }, sparkline?: number[], tone?: 'good'|'warn'|'bad' }] }`.
- **Renderer**: `KpiTilesWidget.tsx`. Grid of cards; color tone reflects sentiment.
- **Library**: shadcn `Card` + sparkline.
- **Streaming**: yes.
- **Effort**: **S–M**.

#### 7.3.5 Heatmap

- **Purpose**: Density grid (e.g., GitHub contribution graph, schedule density).
- **Triggers**: "When did X happen by day", "frequency over time".
- **Event**: `ui:widget_complete` with `kind: 'heatmap'`.
- **Payload**: `{ rows: string[], cols: string[], cells: Array<{ row, col, value, label? }>, color_scale?: 'green' | 'blue' | 'red' }`.
- **Renderer**: `HeatmapWidget.tsx`. SVG grid; tooltip on hover.
- **Library**: `@visx/heatmap` or hand-rolled SVG.
- **Streaming**: yes.
- **Effort**: **M**.

#### 7.3.6 Gauge / Dial

- **Purpose**: Single value vs target / scale.
- **Triggers**: "How close to target", "completion %".
- **Event**: `ui:widget_complete` with `kind: 'gauge'`.
- **Payload**: `{ value, min, max, target?, label, segments?: Array<{ to: number; color: string }> }`.
- **Renderer**: `GaugeWidget.tsx`. Half-circle SVG.
- **Library**: native SVG.
- **Streaming**: no.
- **Effort**: **S**.

#### 7.3.7 Comparison Matrix

- **Purpose**: Feature grid: items as columns, attributes as rows, ✓/✗/value at intersections.
- **Triggers**: "Compare A vs B vs C".
- **Event**: `ui:widget_complete` with `kind: 'comparison_matrix'`.
- **Payload**: `{ items: [{ id, name, badges?: string[] }], features: [{ id, label, group?: string }], cells: Record<itemId, Record<featureId, { value: string|boolean|number; note?: string }>> }`.
- **Renderer**: `ComparisonMatrixWidget.tsx`. Sticky-header table; visual ✓/✗; click cell for note.
- **Library**: shadcn `Table`.
- **Streaming**: yes.
- **Effort**: **M**.

#### 7.3.8 Pricing Table

- **Purpose**: Tiered plans, feature-gated comparison, CTA per tier.
- **Triggers**: "Compare plans", reference to billing.
- **Event**: `ui:widget_complete` with `kind: 'pricing_table'`.
- **Payload**: `{ tiers: [{ id, name, price: { amount, currency, period }, highlights: string[], features: Array<{ label, included: boolean }>, cta: WidgetAction, recommended?: boolean }] }`.
- **Renderer**: `PricingTableWidget.tsx`. Cards row; highlight recommended.
- **Library**: shadcn `Card`.
- **Streaming**: no.
- **Effort**: **M**.

---

### 7.4 Diagrams & Visualizations

Most of these route through **Mermaid**, which already supports the entire family of node-edge diagrams with a simple text DSL. The engine emits the Mermaid DSL string; the frontend renders it.

#### 7.4.1 Flowchart

- **Purpose**: Process flow with decision diamonds.
- **Triggers**: "How does X work", "Walk me through the logic".
- **Event**: `ui:widget_complete` with `kind: 'flowchart'` carrying a Mermaid DSL string. Alternative payload: structured nodes+edges if engine emits AST.
- **Payload**: `{ source: string, format: 'mermaid' | 'graph' }` — if `graph`: `{ nodes: [{id, label, shape?, color?}], edges: [{from, to, label?}] }`.
- **Renderer**: `FlowchartWidget.tsx`. Mermaid renders SVG; pan/zoom; export.
- **Library**: `mermaid`.
- **Streaming**: no (Mermaid needs full DSL).
- **Effort**: **M**.

#### 7.4.2 Sequence Diagram

- **Purpose**: Time-ordered interactions between actors (user, system, service).
- **Triggers**: "How do A and B communicate", "Trace this flow".
- **Event**: `ui:widget_complete` with `kind: 'sequence_diagram'`.
- **Payload**: `{ source: string }` (Mermaid sequenceDiagram syntax).
- **Renderer**: same `FlowchartWidget.tsx` with type detection, OR dedicated `SequenceDiagramWidget.tsx`.
- **Library**: `mermaid`.
- **Effort**: **S** (once flowchart is done).

#### 7.4.3 State Diagram

- **Purpose**: State machines, lifecycles.
- **Triggers**: "What are the states", "Lifecycle".
- **Event**: `ui:widget_complete` with `kind: 'state_diagram'`.
- **Payload**: Mermaid stateDiagram-v2 source.
- **Renderer**: same Mermaid path.
- **Effort**: **S**.

#### 7.4.4 Mindmap

- **Purpose**: Branching topic exploration.
- **Triggers**: "Brainstorm ideas", "Explore the space".
- **Event**: `ui:widget_complete` with `kind: 'mindmap'`.
- **Payload**: Mermaid mindmap syntax OR structured `{ root: TreeNode }`.
- **Renderer**: `MindmapWidget.tsx`. Mermaid mindmap OR `react-mindmap` for richer interactivity (drag, expand).
- **Library**: `mermaid` (v10+) or `react-flow` for custom.
- **Effort**: **M**.

#### 7.4.5 Timeline

- **Purpose**: Chronological events.
- **Triggers**: "History of X", "When did Y happen", project schedule.
- **Event**: `ui:widget_complete` with `kind: 'timeline'`.
- **Payload**: `{ events: [{ id, date: ISOString, title, body?, icon?, tone? }] }`.
- **Renderer**: `TimelineWidget.tsx`. Vertical or horizontal axis; clickable events.
- **Library**: native.
- **Streaming**: yes.
- **Effort**: **M**.

#### 7.4.6 Gantt Chart

- **Purpose**: Project plan with task durations and dependencies.
- **Triggers**: "Plan launch", "Schedule".
- **Event**: `ui:widget_complete` with `kind: 'gantt'`.
- **Payload**: Mermaid gantt syntax OR `{ tasks: [{ id, name, start, end, deps?: string[], assignee?: string, status }] }`.
- **Renderer**: `GanttWidget.tsx`. Mermaid gantt OR `frappe-gantt-react`.
- **Library**: `mermaid` or `frappe-gantt-react`.
- **Effort**: **M**.

#### 7.4.7 Org Chart / Tree Diagram

- **Purpose**: Hierarchies (team org, file tree, taxonomy).
- **Triggers**: "Org structure", "File tree".
- **Event**: `ui:widget_complete` with `kind: 'org_chart'`.
- **Payload**: `{ root: TreeNode }`.
- **Renderer**: `OrgChartWidget.tsx`. `react-flow` for free-form positioning OR Mermaid.
- **Library**: `react-flow` or `mermaid`.
- **Effort**: **M**.

#### 7.4.8 Network Graph

- **Purpose**: Relationships between entities (knowledge graph, dependencies).
- **Triggers**: "Map relationships", "Show connections".
- **Event**: `ui:widget_complete` with `kind: 'network_graph'`.
- **Payload**: `{ nodes: [{id, label, group?, size?}], edges: [{source, target, weight?, label?}] }`.
- **Renderer**: `NetworkGraphWidget.tsx`. Use existing `cytoscape` (already in repo).
- **Library**: `cytoscape`.
- **Streaming**: yes.
- **Effort**: **M**.

#### 7.4.9 ER Diagram

- **Purpose**: Database schemas / data models.
- **Triggers**: "Show me the schema", "How are tables related".
- **Event**: `ui:widget_complete` with `kind: 'er_diagram'`.
- **Payload**: Mermaid erDiagram syntax OR structured.
- **Renderer**: Mermaid path.
- **Effort**: **S**.

#### 7.4.10 Journey Map

- **Purpose**: User flow with emotion / touchpoints per step.
- **Triggers**: "Customer journey", "UX flow".
- **Event**: `ui:widget_complete` with `kind: 'journey_map'`.
- **Payload**: Mermaid journey syntax OR `{ stages: [{ name, steps: [{ label, sentiment: 'good'|'neutral'|'bad', actor }] }] }`.
- **Renderer**: Mermaid OR custom horizontal lanes.
- **Effort**: **M**.

#### 7.4.11 Architecture Diagram

- **Purpose**: Boxes-and-arrows system view.
- **Triggers**: "Show me the architecture", "How do components fit".
- **Event**: `ui:widget_complete` with `kind: 'architecture_diagram'`.
- **Payload**: Mermaid C4 syntax OR `react-flow` nodes+edges.
- **Renderer**: `react-flow` for richer interactions; Mermaid C4 for simpler cases.
- **Library**: `react-flow` (`@xyflow/react`).
- **Effort**: **M–L**.

---

### 7.5 Workspace-style

These are the most "alive" widgets — the user is operating *on* them, not just reading.

#### 7.5.1 Kanban Board

- **Purpose**: Todo / Doing / Done columns with cards.
- **Triggers**: "Organize tasks", "Project board".
- **Event**: `ui:widget_complete` with `kind: 'kanban'`.
- **Payload**: `{ columns: [{ id, title, cards: [{ id, title, body?, badges?, assignee? }] }] }`.
- **Renderer**: `KanbanWidget.tsx`. `dnd-kit` for drag-drop; column reorder.
- **Library**: `@dnd-kit/core`, `@dnd-kit/sortable`.
- **Streaming**: cards stream in.
- **Effort**: **L**.

#### 7.5.2 Calendar Grid

- **Purpose**: Weekly / monthly schedule view (not just a date picker).
- **Triggers**: "Show my week", "Plan calendar".
- **Event**: `ui:widget_complete` with `kind: 'calendar'`.
- **Payload**: `{ view: 'week' | 'month', start: ISOString, events: [{ id, title, start, end, color?, tag? }] }`.
- **Renderer**: `CalendarWidget.tsx`. Grid layout; click event for detail.
- **Library**: `@schedule-x/react` or custom Tailwind grid.
- **Effort**: **L**.

#### 7.5.3 Pipeline View

- **Purpose**: Stages with cards (CRM-style funnel).
- **Triggers**: "Show pipeline", "Where are we in the process".
- **Event**: `ui:widget_complete` with `kind: 'pipeline'`.
- **Payload**: `{ stages: [{ id, title, count?, value_sum?, cards: [...] }] }`.
- **Renderer**: `PipelineWidget.tsx`. Horizontal stages; cards stack within.
- **Library**: native + `framer-motion`.
- **Effort**: **M–L**.

#### 7.5.4 Spreadsheet-lite

- **Purpose**: Editable cells the user can tweak; AI recomputes on edit.
- **Triggers**: "Run scenarios", "What-if analysis".
- **Event**: `ui:widget_complete` with `kind: 'spreadsheet'`.
- **Payload**: `{ rows: number, cols: [{ id, header, type, editable?, formula? }], data: Record<string, unknown>[] }`.
- **Renderer**: `SpreadsheetWidget.tsx`. `react-data-grid` or Glide Data Grid.
- **Library**: `react-data-grid` or `@glideapps/glide-data-grid`.
- **Effort**: **L**.

#### 7.5.5 Outline / Document View

- **Purpose**: Hierarchical headings + side rail nav for long answers.
- **Triggers**: Long structured answer; engine emits explicit outline.
- **Event**: `ui:widget_complete` with `kind: 'outline'`.
- **Payload**: `{ sections: [{ id, level, heading, body_markdown, children? }] }`.
- **Renderer**: `OutlineWidget.tsx`. Sticky TOC rail on left; content on right; scroll-spy active highlight.
- **Library**: native + `framer-motion`.
- **Effort**: **M**.

#### 7.5.6 Whiteboard / Sticky Notes Cluster

- **Purpose**: Free-form ideation layout — sticky notes with optional clustering.
- **Triggers**: "Brainstorm", "Cluster these ideas".
- **Event**: `ui:widget_complete` with `kind: 'sticky_notes'` (or `kind: 'whiteboard'` for free-form positions).
- **Payload**: `{ notes: [{ id, text, color?: string, x?, y?, cluster?: string }], clusters?: [{ id, label }] }`.
- **Renderer**: `StickyNotesWidget.tsx`. Tailwind grid OR `react-flow` for positioned mode.
- **Library**: `react-flow` for whiteboard mode; native for cluster mode.
- **Effort**: **M–L**.

---

### 7.6 Media & Rich

#### 7.6.1 Image Gallery / Carousel

- **Purpose**: Swipeable / pageable images.
- **Triggers**: Engine returned generated or referenced images.
- **Event**: `ui:widget_complete` with `kind: 'image_gallery'`.
- **Payload**: `{ images: [{ id, url, alt, caption?, source? }], layout?: 'carousel' | 'grid' }`.
- **Renderer**: `ImageGalleryWidget.tsx`. `embla-carousel-react` or grid.
- **Library**: `embla-carousel-react`.
- **Effort**: **M**.

#### 7.6.2 Image Annotation Hotspots

- **Purpose**: Clickable regions on an image with labels/callouts.
- **Triggers**: "Annotate this image", "Show me what to click".
- **Event**: `ui:widget_complete` with `kind: 'image_annotated'`.
- **Payload**: `{ image_url, hotspots: [{ id, x, y, w, h, label, body? }] }`.
- **Renderer**: `ImageAnnotatedWidget.tsx`. SVG overlay over the img.
- **Library**: native SVG.
- **Effort**: **M**.

#### 7.6.3 Video Player (with chapters)

- **Purpose**: Embedded video with chapter markers.
- **Triggers**: Engine surfaces a video; tutorial mode.
- **Event**: `ui:widget_complete` with `kind: 'video_player'`.
- **Payload**: `{ url, poster?, chapters?: [{ start_s, label }], captions_url? }`.
- **Renderer**: `VideoPlayerWidget.tsx`. `react-player` or native `<video>` with custom chapter rail.
- **Library**: `react-player`.
- **Effort**: **M**.

#### 7.6.4 Audio Waveform / Player

- **Purpose**: TTS playback with waveform scrub.
- **Triggers**: AI generated audio response; per-message voice playback.
- **Event**: `ui:widget_complete` with `kind: 'audio_waveform'`.
- **Payload**: `{ url, duration_s, waveform?: number[] }`.
- **Renderer**: `AudioWaveformWidget.tsx`. Existing `live-waveform` primitive + `wavesurfer.js` for scrub.
- **Library**: `wavesurfer.js`.
- **Effort**: **M**.

#### 7.6.5 Map

- **Purpose**: Location pins, routes, geofences.
- **Triggers**: "Where is X", "Route from A to B".
- **Event**: `ui:widget_complete` with `kind: 'map'`.
- **Payload**: `{ center: { lat, lng }, zoom, markers: [{ id, lat, lng, label, color? }], routes?: [{ path: [{lat,lng}], color? }] }`.
- **Renderer**: `MapWidget.tsx`. `react-leaflet` (open) or Mapbox.
- **Library**: `react-leaflet` + `leaflet`.
- **Effort**: **M–L** (tile server key/config).

#### 7.6.6 3D Model Viewer

- **Purpose**: Spatial / 3D objects (you already have Three.js + OGL).
- **Triggers**: "Show me a 3D…", architectural / product viz.
- **Event**: `ui:widget_complete` with `kind: 'model_3d'`.
- **Payload**: `{ model_url, format: 'gltf'|'glb'|'obj', auto_rotate?: boolean, environment?: 'studio'|'city' }`.
- **Renderer**: `Model3DWidget.tsx`. `@react-three/fiber` + `@react-three/drei` `<OrbitControls>`.
- **Library**: `@react-three/fiber`, `@react-three/drei`.
- **Effort**: **M**.

#### 7.6.7 Color Swatches

- **Purpose**: Palette suggestions.
- **Triggers**: "Suggest a color scheme", brand work.
- **Event**: `ui:widget_complete` with `kind: 'color_swatches'`.
- **Payload**: `{ palette: [{ name, hex, contrast_pairs?: { against: hex, ratio: number }[] }] }`.
- **Renderer**: `ColorSwatchesWidget.tsx`. Grid of color tiles; click to copy hex.
- **Library**: native.
- **Effort**: **S**.

#### 7.6.8 Avatar Stack

- **Purpose**: Show people involved in the answer (team members, mentioned users).
- **Triggers**: Mentions of users; team-scoped answers.
- **Event**: `ui:widget_complete` with `kind: 'avatar_stack'`.
- **Payload**: `{ users: [{ id, name, avatar_url?, role? }], max_visible?: number }`.
- **Renderer**: `AvatarStackWidget.tsx`. Overlapping avatars; hover for name.
- **Library**: shadcn `Avatar`.
- **Effort**: **S**.

---

### 7.7 Status & Feedback

These often appear **inline within a streaming response**, not as standalone replies.

#### 7.7.1 Progress Bar / Radial Progress

- **Purpose**: Completion percent.
- **Triggers**: Long-running tool calls.
- **Event**: `ui:widget_delta` for live progress; or paired with `mission_progress`.
- **Payload**: `{ value: 0..100, label?, eta_s? }`.
- **Renderer**: `ProgressWidget.tsx`. shadcn `Progress`.
- **Library**: shadcn.
- **Effort**: **S**.

#### 7.7.2 Status Badges / Pills

- **Purpose**: Colored state tags inline.
- **Triggers**: Any state attribute in payloads.
- **Event**: typically rendered *within* other widgets via a `badge` field.
- **Payload**: `{ label, tone: 'good'|'warn'|'bad'|'info'|'neutral' }`.
- **Renderer**: `StatusBadge.tsx`. shadcn `Badge`.
- **Library**: shadcn.
- **Effort**: **S**.

#### 7.7.3 Inline Banner / Toast

- **Purpose**: Alert inside the response (info, warn, error, success).
- **Triggers**: Important caveats, success confirmations.
- **Event**: `ui:widget_complete` with `kind: 'inline_banner'`.
- **Payload**: `{ tone, title, body?, dismissible?: boolean, actions?: WidgetAction[] }`.
- **Renderer**: `InlineBannerWidget.tsx`. shadcn `Alert`.
- **Library**: shadcn.
- **Effort**: **S**.

#### 7.7.4 "Saved to memory" Pill

- **Purpose**: Provenance chip showing the engine wrote to `ie-memory`.
- **Triggers**: When `ie-memory` write occurs mid-reply.
- **Event**: `ui:widget_complete` with `kind: 'memory_pill'`.
- **Payload**: `{ memory_id, summary, type: 'fact' | 'preference' | 'task' }`.
- **Renderer**: `MemoryPillWidget.tsx`. Small pill with icon; click opens memory detail modal.
- **Library**: shadcn `Badge`.
- **Effort**: **S**.

#### 7.7.5 Tool-Activity Chip (inline)

- **Purpose**: "searched: 'X'" / "fetched: example.com" appearing *in line* with the prose, not in a side panel.
- **Triggers**: Existing `tool_activity` events, but rendered inline at the position they happened.
- **Event**: existing `tool_activity` enhanced with `inline: true`.
- **Payload**: `{ tool, input_summary, status, duration_ms? }`.
- **Renderer**: `ToolChipInline.tsx`. Small clickable chip with icon + truncated label.
- **Library**: shadcn `Badge`.
- **Effort**: **S**.

---

### 7.8 Conversational / Playful

#### 7.8.1 Quiz Card

- **Purpose**: Multi-step Q&A — knowledge check, troubleshooting wizard.
- **Triggers**: "Test me", "Help me figure out…".
- **Event**: `ui:widget_complete` with `kind: 'quiz'`.
- **Payload**: `{ questions: [{ id, prompt, options: [{ id, label, correct?: boolean }], explanation? }] }`.
- **Renderer**: `QuizWidget.tsx`. One question at a time; progress bar; reveal answer + explanation.
- **Library**: native.
- **Effort**: **M**.

#### 7.8.2 Wizard

- **Purpose**: Multi-step guided flow (not a quiz — a setup or configuration sequence).
- **Triggers**: "Set up X", "Walk me through configuring Y".
- **Event**: `ui:widget_complete` with `kind: 'wizard'`.
- **Payload**: `{ steps: [{ id, title, body_markdown?, form?: InlineFormPayload, next_label? }], finish_action: WidgetAction }`.
- **Renderer**: `WizardWidget.tsx`. Step indicator + body + per-step form + Next/Back. Submits collected state at finish.
- **Library**: native + `react-hook-form`.
- **Effort**: **L**.

#### 7.8.3 Branching Dialogue

- **Purpose**: Choose-your-own-adventure clarification ("What did you mean by X? [a] [b] [c]").
- **Triggers**: Ambiguous user input; engine wants to disambiguate before acting.
- **Event**: `ui:widget_complete` with `kind: 'branching_dialogue'`.
- **Payload**: `{ question, branches: [{ id, label, follow_up_prompt }] }`.
- **Renderer**: `BranchingDialogueWidget.tsx`. Tree-like buttons; clicking a branch sends `follow_up_prompt` as new user turn.
- **Library**: shadcn `Button`.
- **Effort**: **S**.

#### 7.8.4 Reveal / Spoiler

- **Purpose**: Hidden content (answer reveal, sensitive content gate).
- **Triggers**: Quiz answers, "are you sure you want to see", spoiler-style explanations.
- **Event**: `ui:widget_complete` with `kind: 'reveal'`.
- **Payload**: `{ label, hidden_body_markdown }`.
- **Renderer**: `RevealWidget.tsx`. Click to reveal; smooth animation.
- **Library**: shadcn `Collapsible`.
- **Effort**: **S**.

#### 7.8.5 Sticky Notes Cluster

- See [7.5.6 Whiteboard](#756-whiteboard--sticky-notes-cluster) — same widget, sticky-cluster variant.

---

## 8. Engine-Side: When to Emit Which UI

The `september-engine` LLM needs to know **when to produce a widget vs prose**. Three levers:

### 8.1 System-prompt extension

Add a "UI Composition Guide" section to the system prompt:

> When responding, prefer interactive UI widgets over prose for the following intents:
>
> - **Comparison / decision** → emit `decision_card` or `comparison_matrix`.
> - **Multi-step process** → emit `stepper` or `wizard`.
> - **Numeric trend** → emit `chart` (line/bar/area).
> - **Tabular data > 3 columns** → emit `table`.
> - **Schedule / date** → emit `date_picker` or `calendar`.
> - **Hierarchy / structure** → emit `tree_view` or `org_chart`.
> - **System flow** → emit `flowchart` or `sequence_diagram`.
> - **Brainstorm** → emit `mindmap` or `sticky_notes`.
> - **End-of-reply follow-ups** → always emit `chips` with 2–4 suggestions.
>
> Emit widgets via the `<ui-widget>` directive:
>
> ```
> <ui-widget kind="decision_card" id="wgt_1">
> { "question": "...", "options": [...] }
> </ui-widget>
> ```
>
> The `<ui-widget>` directive is stripped from the user-visible text and replaced with the rendered widget.

### 8.2 Widget-emission layer in `bap-engine`

The engine's text-streamer parses `<ui-widget>` directives in the LLM output stream and translates them to `ui:widget_*` SSE events. The directive's body is the JSON payload. Stripping happens before `inline_text_delta` is emitted.

```python
# bap-engine/orchestrator/widget_parser.py (new)
def parse_stream(token_stream):
    state = WidgetParserState()
    for token in token_stream:
        if state.in_widget:
            state.buffer += token
            if state.detect_end():
                yield WidgetCompleteEvent(state.flush())
                continue
        elif state.detect_start(token):
            yield WidgetStartEvent(state.start_meta())
            continue
        else:
            yield InlineTextDeltaEvent(token)
```

### 8.3 Heuristic auto-promotion

For cases where the LLM emits raw markdown but a widget would be better, the engine runs a **post-emission heuristic** that promotes:

- ` ```mermaid ` fence → `flowchart` / `sequence_diagram` / etc. (detected by first DSL line).
- Markdown table with >3 columns → `table`.
- Markdown list with `[ ]` checkboxes → `checklist`.
- 3 consecutive `### ` headings → `tabs` if siblings, `outline` if nested.

This catches cases where the LLM "forgot" to emit a directive.

### 8.4 Org/User policy

Whether widgets are emitted at all is gated by:

- `EMIT_UI_WIDGETS` env flag in `bap-engine/config/engine.yaml`.
- Per-org override in `bap-backend` via the existing capability flags system.
- Per-user preference in `users.preferences` (`prefer_text_only?: boolean`).

---

## 9. Frontend File Changes

### 9.1 New files

```
bap-web/bap-frontend/
├── lib/
│   ├── types/
│   │   └── engine-widgets.ts                       (new) WidgetKind, WidgetEnvelope, all payload types
│   └── hooks/
│       └── useEngineStream.ts                      (modified) handle ui:widget_* events, build blockOrder
├── components/
│   └── output/
│       ├── OutputSystem.tsx                        (modified) walk blockOrder, dispatch widgets
│       └── widgets/
│           ├── registry.ts                         (new) WidgetKind → renderer map
│           ├── FallbackWidget.tsx                  (new) safe fallback
│           ├── _shared/
│           │   ├── WidgetCard.tsx                  (new) common chrome (title, collapse, actions row)
│           │   ├── ActionRow.tsx                   (new) renders WidgetAction[]
│           │   └── WidgetSkeleton.tsx              (new) streaming placeholder
│           ├── ChipsWidget.tsx                     (new)
│           ├── QuickReplyWidget.tsx                (new)
│           ├── DecisionCardWidget.tsx              (new)
│           ├── ConfirmCardWidget.tsx               (new)
│           ├── InlineFormWidget.tsx                (new)
│           ├── SliderWidget.tsx                    (new)
│           ├── ToggleGroupWidget.tsx               (new)
│           ├── DatePickerWidget.tsx                (new)
│           ├── MultiSelectChipsWidget.tsx          (new)
│           ├── PollWidget.tsx                      (new)
│           ├── RatingWidget.tsx                    (new)
│           ├── StepperWidget.tsx                   (new)
│           ├── ChecklistWidget.tsx                 (new)
│           ├── AccordionWidget.tsx                 (new)
│           ├── TabsWidget.tsx                      (new)
│           ├── CardsGridWidget.tsx                 (new)
│           ├── SourceCardsWidget.tsx               (new)
│           ├── LinkUnfurlWidget.tsx                (new)
│           ├── FootnotePopover.tsx                 (new)
│           ├── CodeBlockWithActions.tsx            (new) replaces existing code block
│           ├── DiffWidget.tsx                      (new)
│           ├── MathWidget.tsx                      (new) thin wrapper around KaTeX
│           ├── TreeViewWidget.tsx                  (new)
│           ├── TableWidget.tsx                     (new)
│           ├── ChartWidget.tsx                     (new)
│           ├── SparklineWidget.tsx                 (new)
│           ├── KpiTilesWidget.tsx                  (new)
│           ├── HeatmapWidget.tsx                   (new)
│           ├── GaugeWidget.tsx                     (new)
│           ├── ComparisonMatrixWidget.tsx          (new)
│           ├── PricingTableWidget.tsx              (new)
│           ├── FlowchartWidget.tsx                 (new) mermaid host
│           ├── SequenceDiagramWidget.tsx           (new) optional — can route via flowchart
│           ├── StateDiagramWidget.tsx              (new) optional — same
│           ├── MindmapWidget.tsx                   (new)
│           ├── TimelineWidget.tsx                  (new)
│           ├── GanttWidget.tsx                     (new)
│           ├── OrgChartWidget.tsx                  (new)
│           ├── NetworkGraphWidget.tsx              (new) cytoscape
│           ├── ErDiagramWidget.tsx                 (new)
│           ├── JourneyMapWidget.tsx                (new)
│           ├── ArchitectureDiagramWidget.tsx       (new) react-flow
│           ├── KanbanWidget.tsx                    (new)
│           ├── CalendarWidget.tsx                  (new)
│           ├── PipelineWidget.tsx                  (new)
│           ├── SpreadsheetWidget.tsx               (new)
│           ├── OutlineWidget.tsx                   (new)
│           ├── StickyNotesWidget.tsx               (new)
│           ├── ImageGalleryWidget.tsx              (new)
│           ├── ImageAnnotatedWidget.tsx            (new)
│           ├── VideoPlayerWidget.tsx               (new)
│           ├── AudioWaveformWidget.tsx             (new)
│           ├── MapWidget.tsx                       (new)
│           ├── Model3DWidget.tsx                   (new)
│           ├── ColorSwatchesWidget.tsx             (new)
│           ├── AvatarStackWidget.tsx               (new)
│           ├── ProgressWidget.tsx                  (new)
│           ├── StatusBadge.tsx                     (new)
│           ├── InlineBannerWidget.tsx              (new)
│           ├── MemoryPillWidget.tsx                (new)
│           ├── ToolChipInline.tsx                  (new)
│           ├── QuizWidget.tsx                      (new)
│           ├── WizardWidget.tsx                    (new)
│           ├── BranchingDialogueWidget.tsx         (new)
│           └── RevealWidget.tsx                    (new)
└── components/
    └── ui/
        └── response.tsx                             (modified) extend remark/rehype plugins for Track A
```

### 9.2 Modified files

| File | Change |
|---|---|
| `lib/hooks/useEngineStream.ts` | Add `widgets`, `blockOrder` to reducer; handle `ui:widget_*` events; expose `onAction` callback |
| `lib/services/engine-socket.service.ts` | Subscribe to `ui:*` events |
| `components/output/OutputSystem.tsx` | Walk `blockOrder` instead of rendering text + side panels separately |
| `components/ui/response.tsx` | Add `remarkMath`, `rehypeKatex`, `remarkMermaidFence`, custom `code`/`table`/`a` handlers |
| `lib/api/intelligence-engine.ts` | Add `dispatchWidgetAction(widget_id, action)` posting to backend |
| `lib/types/super-chat.ts` | Reference new widget types |

### 9.3 Backend changes

`bap-backend/src/engine/`:
- New REST endpoint `POST /api/engine/widget-action` proxies to engine `/rpc { subsystem: 'widgets', op: 'action' }`.
- `EngineGateway` (Socket.IO `/engine`) forwards `ui:widget_*` events as-is to clients.

`bap-backend/src/utility/` (new):
- `GET /api/utility/og?url=…` — fetches OG metadata for link unfurls (cached in Redis, 24h TTL).

### 9.4 Engine changes (`bap-engine`)

- `orchestrator/widget_parser.py` (new) — parses `<ui-widget>` directives in LLM output stream.
- `config/engine.yaml` — add `widgets:` section with `enabled`, `kinds_enabled`, `policy`.
- System prompt template extended with the "UI Composition Guide" section (§8.1).

---

## 10. Phased Rollout

Five phases, each independently shippable.

### Phase 1 — Foundations + Track A quick wins (1 sprint)

**Goal**: ship visible interactivity *without* engine changes.

- Add Mermaid fence rendering ⇒ flowchart, sequence, state, ER diagrams "for free".
- Add KaTeX math.
- Upgrade markdown tables → `@tanstack/react-table`.
- Add link-unfurl with backend `/api/utility/og`.
- Add footnote popovers from `[^1]` markers.
- Add code-block action row (Run / Copy / Diff / Open-in-craft).
- Implement the **Renderer Registry** foundation + `FallbackWidget` + `WidgetCard` shared chrome (used by Phase 2+).
- Delete the legacy SSE inline-render path (`USE_OUTPUT_SYSTEM = false` branch).

**Deliverable**: Existing engine output looks 2–3× richer. Foundation ready for new widget types.

### Phase 2 — Core Choice & Structured widgets (1–2 sprints)

**Goal**: turn most replies into something the user can click.

Add engine event types and renderers for:

- `chips` (suggestion chips — emitted at end of nearly every reply)
- `quick_reply` and `branching_dialogue`
- `decision_card`
- `confirm_card`
- `stepper`
- `checklist`
- `accordion`
- `tabs`
- `cards_grid`
- `source_cards` (paired with citations)

Update `september-engine` system prompt to use these.
Add `EMIT_UI_WIDGETS` feature flag.

**Deliverable**: Most replies end with chips. Comparison / decision / planning prompts produce widgets. Click chips → fires next turn.

### Phase 3 — Data & Diagrams (1–2 sprints)

**Goal**: numeric and visual answers.

Add:

- `chart` (bar/line/pie/area/scatter) — Recharts.
- `kpi_tiles` + `sparkline`.
- `comparison_matrix`.
- `flowchart` + `sequence_diagram` + `state_diagram` + `er_diagram` + `mindmap` + `journey_map` — Mermaid-based.
- `timeline`.
- `network_graph` — Cytoscape (already in repo).
- `tree_view`.
- `pricing_table`.

**Deliverable**: "Show me a chart of…", "How does X work?", "Compare A vs B" produce native visuals.

### Phase 4 — Workspace widgets (2 sprints)

**Goal**: the AI's response becomes a workspace the user operates on.

Add:

- `kanban` with `dnd-kit`.
- `calendar`.
- `pipeline`.
- `inline_form` with `react-hook-form`.
- `slider`, `toggle_group`, `date_picker`, `multi_select_chips`, `poll`, `rating`.
- `outline` with sticky TOC rail.
- `wizard`.
- `spreadsheet` (heavier — split if needed).

**Deliverable**: Multi-step tasks become wizards. Project plans become kanban. Schedules become calendars.

### Phase 5 — Media & rich (1–2 sprints)

**Goal**: rich media in responses.

Add:

- `image_gallery`, `image_annotated`.
- `video_player`, `audio_waveform`.
- `map` (Leaflet).
- `model_3d` (`@react-three/fiber`).
- `color_swatches`, `avatar_stack`.
- `gantt`, `org_chart`, `architecture_diagram` (`react-flow`).
- `whiteboard` / `sticky_notes`.
- `quiz`, `reveal`, `heatmap`, `gauge`.

**Deliverable**: All catalog types covered. Full UI composition vocabulary available to the LLM.

### Order-of-operations decision matrix

| Want to ship first? | Pick |
|---|---|
| Visible improvement, zero engine work | Phase 1 only |
| "Click to continue" feel everywhere | Phases 1 + 2 |
| Visual answers (charts, diagrams) | Phases 1 + 3 |
| AI-driven workspaces | Phases 1 + 2 + 4 |
| Full vocabulary | Phases 1 → 5 |

---

## 11. Testing Strategy

### 11.1 Unit tests

- Per renderer component (Jest + React Testing Library).
- Test rendering with `streaming` vs `complete` status.
- Test action dispatch — `onAction` called with the right payload.
- Test fallback rendering when `payload` is malformed.
- Snapshot tests against representative payloads.

### 11.2 Integration tests

- Mock engine event stream → assert `blockOrder` is correct.
- Mock `widget_delta` JSON-Patch sequence → assert payload converges correctly.
- Mock missing renderer in registry → assert `FallbackWidget` renders with `fallback_markdown`.

### 11.3 Visual regression

- Storybook (if not present, add it) per widget kind with 3–5 payload variants each.
- Chromatic / Percy snapshots gated in CI.

### 11.4 E2E (Playwright)

- One scenario per phase: send a known prompt → assert a specific widget kind appears → click an action → assert next turn fires.
- Voice mode unaffected (no regression).

### 11.5 Engine emission tests

- LLM prompt regression: a fixed set of canonical prompts → assert the engine emits the right widget kind 90%+ of the time. Use `pytest` snapshot of the LLM response in `bap-engine/tests/`.

### 11.6 Telemetry

- Each widget render fires `telemetry.track('widget_rendered', { kind, widget_id })`.
- Each action click fires `telemetry.track('widget_action', { kind, widget_id, action_id })`.
- Existing `audit` module records widget actions for compliance.

---

## 12. Open Questions & Decisions

| # | Question | Default proposal |
|---|---|---|
| Q1 | Use Mermaid for all diagram kinds, or `react-flow` for some? | Mermaid for read-only diagrams (flow/seq/state/er/journey/mindmap). `react-flow` for editable / pannable diagrams (architecture, org_chart). Network graph: keep Cytoscape (already in repo). |
| Q2 | How does the LLM signal a widget vs prose? | `<ui-widget kind="..." id="..."> JSON </ui-widget>` directive, parsed and stripped by `bap-engine`. |
| Q3 | Can multiple widgets share a `widget_id` across turns (state continuity)? | No — `widget_id` is unique per turn. For cross-turn state (e.g., a kanban the user updates over multiple turns), store state in `ie-memory` and re-emit the widget with the persisted payload. |
| Q4 | Should action payloads be allowed to call arbitrary tools? | No. Action payloads route through one of three sinks: new user-turn (`prompt`), HITL response (`hitl_response`), or local navigation (`navigate`). Tool-call gating stays in the engine. |
| Q5 | Per-org/user widget enable list? | Yes — capability flags in `bap-backend` mirror engine config. Defaults: all kinds on for PRO+, basic kinds (chips, decision_card, stepper, chart, flowchart, table, source_cards) on FREE. |
| Q6 | How do widgets behave inside `ArtifactPanel` (sidebar)? | Same renderers. The artifact panel uses a flag `compact: true` passed to widgets so they render in a tighter layout. |
| Q7 | Streaming JSON Patch — what library? | `fast-json-patch` (already small + battle-tested). Engine emits patches; frontend applies via Immer or direct mutation in the reducer. |
| Q8 | Token cost of widget JSON in LLM output? | A `decision_card` with 3 options ≈ 200–400 tokens; cost mitigated by (a) using widgets only when prose would be longer, (b) compressing the directive syntax. Tracked in `telemetry`. |
| Q9 | Editing widgets the AI created (user fixes a kanban card the AI got wrong)? | Out of scope for v1. Edits send a new user turn ("change card X to Y") and the AI re-emits an updated widget. |
| Q10 | How are widgets persisted in chat history? | Stored as part of the assistant message in `messages` table — new column `blocks JSONB` (or separate `widget_emissions` table) carrying the full `WidgetEnvelope` array. On chat reload, frontend reconstructs `blockOrder` from this column. |
| Q11 | Accessibility — screen reader behavior for diagrams? | Every widget exposes `meta.title` + `meta.description` as ARIA label. Diagrams additionally serialize a textual summary as `aria-describedby` content (Mermaid can emit this). |
| Q12 | Dark-mode color tokens for charts? | Define a `widgetTheme` in `lib/theme/widget-theme.ts` driven by Tailwind CSS vars; all renderers consume it. |
| Q13 | What happens if `fallback_markdown` is missing AND renderer is unknown? | Render a small "Widget kind 'X' not supported in this client version" banner with a link to refresh. |
| Q14 | Layout: full-width vs constrained widgets in chat? | Default `span: 'full'` of the message bubble. Wide widgets (kanban, gantt, network_graph, spreadsheet) can request `expand_to_artifact_panel: true` to render in the side panel instead of inline. |
| Q15 | Should widgets count toward the engine quota / billing? | Treat widget JSON as part of the assistant message token cost — already metered. No separate budget. |

---

## 13. Glossary

- **Widget**: a typed UI block the engine emits as part of an AI reply. Identified by `kind` and a JSON `payload`.
- **Widget Envelope**: the wire format wrapping `kind` + `payload` + `actions` + `meta` + `fallback_markdown`.
- **Renderer**: a React component registered against a `WidgetKind` that draws the widget.
- **Renderer Registry**: a map from `WidgetKind` to renderer component, used by `OutputSystem`.
- **Block**: an entry in the ordered list of things the assistant said. Types: `text`, `widget`, `thinking`, `tool_activity`. Walked by `OutputSystem`.
- **Block Order**: the ordered list of `Block`s for one assistant turn — preserves interleaving of prose and widgets.
- **Track A**: frontend-only changes that detect content in existing markdown and render as widgets. No engine work.
- **Track B**: engine-emitted typed events for widgets. Engine work + frontend renderers.
- **`ui:widget_start` / `_delta` / `_complete`**: lifecycle events for a single widget.
- **`ui:action`**: client-to-engine event when the user clicks a widget action.
- **Action**: a button/chip inside a widget that, when clicked, sends a payload back (`prompt` / `hitl_response` / `navigate`).
- **Stream-friendly widget**: a widget whose payload can update incrementally during streaming (table rows, mindmap branches, chart points).
- **All-or-nothing widget**: a widget that requires the full payload to render meaningfully (decision_card, confirm_card, inline_form).
- **Lazy-asset widget**: a widget whose render is cheap but whose asset (image/video/3D) loads after.
- **Composition**: the interleaving of prose, widgets, thinking, and tool activity within one assistant turn.
- **Fallback**: the safety net when a renderer is missing or payload is malformed — renders `meta.title` + `fallback_markdown`.

---

## Appendix A — Library Install List

```bash
# Phase 1
pnpm add mermaid katex remark-math rehype-katex @tanstack/react-table @tanstack/react-virtual react-diff-view
# Phase 2
pnpm add react-hook-form date-fns react-day-picker
# Phase 3
pnpm add recharts
# Phase 4
pnpm add @dnd-kit/core @dnd-kit/sortable @schedule-x/react
# Phase 5
pnpm add react-leaflet leaflet @react-three/fiber @react-three/drei react-player wavesurfer.js embla-carousel-react @xyflow/react react-arborist fast-json-patch
```

## Appendix B — Sample LLM Output (with widget directives)

```
The two databases you're considering are very different. Here's a comparison.

<ui-widget kind="comparison_matrix" id="wgt_cmp_01">
{
  "items": [
    { "id": "pg", "name": "PostgreSQL" },
    { "id": "ch", "name": "ClickHouse" }
  ],
  "features": [
    { "id": "writes", "label": "Write throughput" },
    { "id": "agg", "label": "Aggregation speed" },
    { "id": "tx", "label": "Transactions" },
    { "id": "ops", "label": "Operational ease" }
  ],
  "cells": {
    "pg": {
      "writes": { "value": "High" },
      "agg":    { "value": "Moderate" },
      "tx":     { "value": true },
      "ops":    { "value": "Easy" }
    },
    "ch": {
      "writes": { "value": "Very high (append-only)" },
      "agg":    { "value": "Excellent (10x)" },
      "tx":     { "value": false },
      "ops":    { "value": "Harder" }
    }
  }
}
</ui-widget>

Given your stack already uses PostgreSQL with RLS, my recommendation:

<ui-widget kind="decision_card" id="wgt_dec_01">
{
  "question": "Which to pick?",
  "options": [
    {
      "id": "pg",
      "title": "Stay on PostgreSQL",
      "recommended": true,
      "pros": ["Reuses RLS tenancy", "Single ops surface"],
      "cons": ["Aggregation cost rises past ~50M rows"],
      "cta_label": "Stay on PG"
    },
    {
      "id": "ch",
      "title": "Move to ClickHouse",
      "pros": ["10x agg speed at scale"],
      "cons": ["No transactions", "Second ops surface"],
      "cta_label": "Move to ClickHouse"
    }
  ]
}
</ui-widget>

<ui-widget kind="chips" id="wgt_chips_01">
{
  "chips": [
    { "id": "c1", "label": "Show me a migration plan", "prompt": "Show a migration plan from PG to ClickHouse" },
    { "id": "c2", "label": "Estimate cost at 50M rows", "prompt": "Estimate cost per month at 50M rows for both" },
    { "id": "c3", "label": "What about TimescaleDB?", "prompt": "Compare PostgreSQL with TimescaleDB" }
  ]
}
</ui-widget>
```

What the user sees: a paragraph → a comparison matrix → a paragraph → a decision card → follow-up chips. All from one LLM turn.

## Appendix C — Reference Map

- Engine event stream consumer: `bap-web/bap-frontend/lib/hooks/useEngineStream.ts`
- Output dispatcher: `bap-web/bap-frontend/components/output/OutputSystem.tsx`
- Markdown pipeline: `bap-web/bap-frontend/components/ui/response.tsx`
- Super Chat composer: `bap-web/bap-frontend/components/super-chat/SuperChatContent.tsx`
- Engine module (backend proxy): `bap-backend/src/engine/`
- Engine event socket: `bap-backend/src/gateway/engine.gateway.ts` (or the `/engine` namespace gateway)
- Engine wrapper: `bap-engine/orchestrator/`
- Engine prompt config: `bap-engine/config/engine.yaml`

---

**End of plan.** Next step: pick a phase, scope the per-widget tickets, and start with Phase 1 (Track A quick wins) for fast visible impact.
