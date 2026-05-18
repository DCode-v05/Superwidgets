/**
 * Demo prompts for the Empty State — one prompt per intent, grouped by
 * category. 22 widgets total = 10 original + 10 teammate + 2 unique-to-me.
 *
 * Used by [components/chat/EmptyState.tsx] for one-click demos of each
 * widget kind. Shape changed in v3 to group by category with headings.
 */

export interface PromptItem {
  kind: string;
  label: string;
  prompt: string;
}

export interface PromptCategory {
  /** Section heading. */
  category: string;
  /** Optional one-line description shown under the heading. */
  hint?: string;
  items: PromptItem[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    category: "Conversational",
    hint: "Open-ended — agent falls back here when nothing else fits.",
    items: [
      { kind: "chips", label: "Chips", prompt: "Hello — what can you do?" },
    ],
  },
  {
    category: "Decision & confirmation",
    hint: "Pick-one or destructive-action gates.",
    items: [
      { kind: "decision_card", label: "Decision card", prompt: "Should I use REST or GraphQL for my new API?" },
      { kind: "confirm_card", label: "Confirm card", prompt: "Send a cold email to 200 prospects from my list" },
    ],
  },
  {
    category: "Plans & lists",
    hint: "Sequence, checklist, or dated history.",
    items: [
      { kind: "stepper", label: "Stepper", prompt: "Plan a product launch in 5 steps" },
      { kind: "checklist", label: "Checklist", prompt: "Give me a code review checklist for a Next.js PR" },
      { kind: "timeline", label: "Timeline", prompt: "Show me the history of Y Combinator as a timeline" },
    ],
  },
  {
    category: "Data",
    hint: "Tabular, trend, breakdown, density, citations.",
    items: [
      { kind: "table", label: "Table", prompt: "Compare AWS Lambda, Vercel Functions, and Cloudflare Workers in a table" },
      { kind: "chart", label: "Chart", prompt: "Show me revenue trend over the last 6 months" },
      { kind: "pie_chart", label: "Pie chart", prompt: "Pie chart of typical SaaS startup expenses" },
      { kind: "heatmap", label: "Heatmap", prompt: "Heatmap of website traffic by day × hour" },
      { kind: "source_cards", label: "Source cards", prompt: "Tell me about Y Combinator with 3 sources" },
    ],
  },
  {
    category: "Diagrams",
    hint: "Flows, overlaps, brainstorms.",
    items: [
      { kind: "flowchart", label: "Flowchart", prompt: "Draw a flowchart for handling a refund request" },
      { kind: "venn_diagram", label: "Venn diagram", prompt: "Venn diagram: data engineer vs data scientist vs analytics engineer" },
      { kind: "mind_map", label: "Mind map", prompt: "Mind map of skills for a senior backend engineer" },
    ],
  },
  {
    category: "Dashboards",
    hint: "Snapshots, people, boards, pricing.",
    items: [
      { kind: "kpi_dashboard", label: "KPI dashboard", prompt: "SaaS KPI dashboard: MRR, churn, ARPU, NPS" },
      { kind: "profile_card", label: "Profile card", prompt: "Profile card for a fictional staff engineer" },
      { kind: "kanban_board", label: "Kanban board", prompt: "Kanban board for a 3-person team shipping a feature" },
      { kind: "pricing_table", label: "Pricing table", prompt: "Compare your Free, Pro, and Enterprise plans" },
    ],
  },
  {
    category: "Interactive",
    hint: "Live recompute + scored quizzes.",
    items: [
      { kind: "calculator", label: "Calculator", prompt: "Tip calculator with bill, people, tip slider" },
      { kind: "quiz", label: "Quiz", prompt: "3-question quiz about HTTP status codes" },
    ],
  },
  {
    category: "Code & status",
    hint: "Snippets and one-line notices.",
    items: [
      { kind: "code_block", label: "Code block", prompt: "Write a Python function that fetches a URL with retries" },
      { kind: "inline_banner", label: "Inline banner", prompt: "Confirm that my deploy to production went through successfully" },
    ],
  },
];

/** Flat list — used by tests, eval, and any legacy import. */
export const TEST_PROMPTS = PROMPT_CATEGORIES.flatMap((c) => c.items);
