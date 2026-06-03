# Superwidgets

## Project Description
Superwidgets is a self-contained Next.js prototype that reimagines what an AI chat reply can be. Instead of answering in plain markdown text, the model returns a **typed, interactive UI widget** — a comparison table, a decision card, an SVG chart, a flowchart, a live calculator, a multi-step form, and more. The LLM acts as a *UI-dev subagent* that designs and builds one self-contained HTML widget per turn through a small agentic tool loop. Every widget is validated and sanitized on the server, rendered on the client, and made clickable so that interacting with it fires the next conversation turn. The app is **multi-provider** (Anthropic, Google Gemini, OpenAI), tracks token cost and prompt-cache efficiency in real time, and ships with an evaluation harness that ranks model/skill combinations by cost-per-successful-render.

---

## Project Details

### Problem Statement
Plain-text chat replies are a lossy interface for structured answers. Comparisons, plans, metrics, hierarchies, and calculations all flatten into prose the user must re-parse. Superwidgets explores an alternative: let the model emit a **purpose-built, interactive UI component** for each answer — chosen from a catalog, designed to a house style, and wired so that clicking any element continues the conversation. The challenge is doing this safely (arbitrary model-authored HTML/SVG/JS), cheaply (token cost matters), and consistently (the same intent should produce a coherent, on-brand widget across very different models).

### How It Works
1. The user types a message in the composer.
2. The browser POSTs `{ message, history, providerId, useSkill }` to `/api/engine/execute`.
3. The route runs an **agentic loop** (`runEngine`, ≤ 8 iterations) against the selected provider, streaming the result back as **Server-Sent Events**.
4. The model is given **two tools** and a system prompt that turns it into a UI-dev subagent:
   - `build_widget(intent)` — *Phase 1, pre-flight.* Returns the design note + safety reminders for the chosen widget intent. Cheap (~10 output tokens).
   - `submit_widget(intent, html, prose?)` — *Phase 2.* Validates intent + HTML structure + script safety in one pass. Valid → renders and ends the loop. Invalid → returns issues, and the agent loops back with corrected HTML.
5. The finished widget HTML is sanitized with **DOMPurify** and injected into the DOM; an optional one-sentence prose preamble is streamed above it.
6. A global click delegator watches for `data-superwidgets-prompt` on any element (button, table row, SVG node, etc.). Clicking it sends that payload as the user's next message — `data-superwidgets-confirm` first shows a confirm dialog for destructive actions.

### The Agentic Loop
```
build_widget(intent)  →  compose HTML  →  submit_widget(intent, html, prose?)
                                                 │
                                                 ├── valid?   render & exit (terminal)
                                                 └── invalid? fix HTML, submit again
```

### Widget Catalog (30 intents)
Each widget is a self-contained block bounded by `<!--superwidgets-widget:start-->` / `<!--superwidgets-widget:end-->` sentinels.

- **Static:** `chips`, `decision_card`, `confirm_card`, `stepper`, `checklist`, `timeline`, `table`, `chart`, `source_cards`, `code_block`, `inline_banner`
- **Diagrams (inline SVG):** `flowchart`, `venn_diagram`, `mind_map`, `sequence_diagram`, `tree_diagram`, `gantt_chart`, `map`
- **Charts (inline SVG):** `pie_chart`, `heatmap`, `scatter_plot`, `funnel_chart`, `radar_chart`
- **Dashboards:** `kpi_dashboard`, `profile_card`, `kanban_board`, `pricing_table`
- **Interactive (`<script>` ± `<form>`):** `calculator`, `quiz`, `form`

### Multi-Provider Engine
A single `AgentTurnInvoker` interface abstracts every model behind one streaming contract, so the loop is provider-agnostic.

| Provider ID | Model | Input $/MTok | Output $/MTok | Cached input $/MTok |
|---|---|---|---|---|
| `sonnet` | claude-sonnet-4-6 | 3.00 | 15.00 | 0.30 |
| `haiku` | claude-haiku-4-5 | 1.00 | 5.00 | 0.10 |
| `gemini-3` | gemini-3-flash-preview | 0.50 | 3.00 | 0.05 |
| `gemini-3.1` | gemini-3.1-flash-lite-preview | 0.25 | 1.50 | 0.025 |
| `gpt-5.4-mini` | gpt-5.4-mini | 0.75 | 4.50 | 0.075 |
| `gpt-5.4` | gpt-5.4 | 2.50 | 15.00 | 0.25 |
| `gpt-5.5` | gpt-5.5 | 5.00 | 30.00 | 0.50 |

Token usage, prompt-cache hit rate, and total cost are computed per turn (`pricing.ts`) and surfaced live in the UI.

### Safety & Validation
- **Structural + script validation** (`tools/validate.ts`) runs before any widget renders — checks the output contract, click-target requirements, and forbids network/event-handler/forbidden-tag patterns.
- **DOMPurify sanitization** with an explicit attribute allowlist (`components/output/HtmlBubble.tsx`) before injection; model-emitted `superwidgets-w-*` IDs are de-collided per instance.
- Widgets are **purely client-side** — no network code, no inline `on*` handlers, scripts wrapped in IIFEs scoped to a root id.

### Design Skill (optional)
A `useSkill` toggle prepends a `FRONTEND_DESIGN_SKILL` preamble to the system prompt, giving the model an extra layer of house-style design guidance. The eval harness measures whether this improves quality enough to justify the extra input tokens.

### Evaluation Harness
`npm run eval` sweeps **every (model × skill on/off) combination** against a fixed prompt set, scores each rendered widget structurally (content present, root styling, required interactivity, balanced tags, no forbidden tags), and prints a ranking by **cost-per-successful-render** plus the top recommendations. Every rendered widget is also written to `eval/outputs/*.html` for visual review.

---

## Tech Stack
- TypeScript 5.7
- Next.js 15 (App Router) + React 19
- Tailwind CSS 3.4 + PostCSS / Autoprefixer
- `@anthropic-ai/sdk`, `@google/generative-ai`, `openai`
- DOMPurify (HTML sanitization)
- lucide-react (icons), react-markdown + remark-gfm, react-syntax-highlighter
- Server-Sent Events (streaming), Node.js runtime
- tsx (eval runner)

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/DCode-v05/Superwidgets.git
cd Superwidgets
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API keys
```bash
cp .env.local.example .env.local
```
Then add a key for at least the provider(s) you intend to use:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-genai-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Run the development server
```bash
npm run dev
# open http://localhost:3000
```

### 5. Production build
```bash
npm run build
npm run start
```

---

## Usage
- **Chat:** Type a request (e.g. *"Compare PostgreSQL vs ClickHouse"*, *"Plan a product launch in 5 steps"*, *"Show revenue trend over 6 months"*) and the model replies with the most fitting interactive widget.
- **Interact:** Click any chip, table row, decision-card CTA, chart bar, or SVG node — the element's `data-superwidgets-prompt` payload becomes your next message, driving the conversation forward.
- **Switch models:** Use the mode selector to pick any provider, toggle the design skill on/off, and watch the live cost / cache-hit readout update per turn.
- **Export:** Download a single widget or the whole chat as a standalone HTML file.
- **Benchmark:** Run `npm run eval` to sweep all model × skill combos and rank them by cost-per-successful-render. (Requires Node 20.12+ for `process.loadEnvFile`.)

### Available scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the project |
| `npm run eval` | Cost-efficiency sweep across providers/skills |

---

## Project Structure
```
Superwidgets/
│
├── app/
│   ├── api/engine/execute/route.ts    # SSE endpoint — streams EngineEvents
│   ├── globals.css                    # Tailwind layers + widget bubble animation
│   ├── layout.tsx                     # Root layout & metadata
│   └── page.tsx                       # Mounts the chat shell
│
├── components/
│   ├── chat/                          # ChatShell, ChatInput, message list, mode/cost/prompt UI, empty state
│   ├── output/                        # OutputSystem, HtmlBubble (DOMPurify), AgentTrace, InlineTextRenderer
│   └── ui/button.tsx                  # Shared UI primitive
│
├── lib/
│   ├── engine/
│   │   ├── run-engine.ts              # Agentic loop (≤ 8 iterations)
│   │   ├── system-prompt-freeform.ts  # UI-dev subagent system prompt
│   │   ├── frontend-design-skill.*    # Optional design-skill preamble
│   │   ├── pricing.ts                 # Per-provider $/MTok + cost computation
│   │   ├── providers/                 # anthropic | google | openai invokers + registry
│   │   └── tools/                     # build_widget / submit_widget · schemas · executors · validate · widget-library (30 intents)
│   ├── hooks/useChat.ts               # SSE consumer + reducer over EngineEvent
│   ├── types/engine-widgets.ts        # EngineEvent / ChatMessage type definitions
│   ├── download-page.ts               # Export the chat as standalone HTML
│   ├── download-widget.ts             # Export a single widget
│   └── utils.ts
│
├── eval/
│   ├── run.ts                         # `npm run eval` cost-efficiency sweep
│   └── prompts.ts                     # Test prompt set
│
├── .env.local.example                 # API-key template
├── next.config.ts · tailwind.config.ts · tsconfig.json · postcss.config.mjs
├── package.json
└── README.md                          # Project documentation
```

---

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request describing your changes.

---

## Contact
- **GitHub:** [DCode-v05](https://github.com/DCode-v05)
- **Email:** denistanb05@gmail.com
