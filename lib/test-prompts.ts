/**
 * Demo prompts grouped by widget intent — two prompts per kind so the
 * PromptLibrary drawer has 22 × 2 = 44 one-click samples.
 *
 * Consumed by [components/chat/PromptLibrary.tsx]. The legacy
 * PROMPT_CATEGORIES export below preserves the older grouped-by-category
 * shape used by EmptyState before it was simplified.
 */

export interface PromptGroup {
  kind: string;
  label: string;
  prompts: string[];
}

export const TEST_PROMPTS: PromptGroup[] = [
  // Conversational & decision
  {
    kind: "chips",
    label: "Conversational",
    prompts: [
      "Hello — what can you do?",
      "What should I ask you about?",
    ],
  },
  {
    kind: "decision_card",
    label: "Decision",
    prompts: [
      "Should I use REST or GraphQL for my new API?",
      "Help me choose between TypeScript and Python for a new microservice",
    ],
  },
  {
    kind: "confirm_card",
    label: "Confirm",
    prompts: [
      "Send a cold email to 200 prospects from my list",
      "Delete all branches older than 6 months from the repo",
    ],
  },
  // Plans & lists
  {
    kind: "stepper",
    label: "Stepper",
    prompts: [
      "Plan a product launch in 5 steps",
      "Walk me through onboarding a new backend engineer",
    ],
  },
  {
    kind: "checklist",
    label: "Checklist",
    prompts: [
      "Give me a code review checklist for a Next.js PR",
      "What should I check before going live with a new feature?",
    ],
  },
  {
    kind: "timeline",
    label: "Timeline",
    prompts: [
      "Show me the history of Y Combinator as a timeline",
      "Give me a 2026 product roadmap timeline",
    ],
  },
  // Data
  {
    kind: "table",
    label: "Table",
    prompts: [
      "Compare AWS Lambda, Vercel Functions, and Cloudflare Workers in a table",
      "Show me a feature matrix for popular React state libraries",
    ],
  },
  {
    kind: "chart",
    label: "Chart",
    prompts: [
      "Show me revenue trend over the last 6 months",
      "Visualize quarterly user growth as a bar chart",
    ],
  },
  {
    kind: "pie_chart",
    label: "Pie chart",
    prompts: [
      "Pie chart of typical SaaS startup expenses",
      "Show market share of top 4 cloud providers as a pie chart",
    ],
  },
  {
    kind: "heatmap",
    label: "Heatmap",
    prompts: [
      "Heatmap of website traffic by day × hour",
      "Visualize incident frequency by team × severity as a heatmap",
    ],
  },
  {
    kind: "source_cards",
    label: "Sources",
    prompts: [
      "Tell me about Y Combinator with sources",
      "Find me 3 reputable articles about prompt caching",
    ],
  },
  // Diagrams
  {
    kind: "flowchart",
    label: "Flowchart",
    prompts: [
      "Draw a flowchart for handling a refund request",
      "Trace the OAuth 2.0 authorization-code flow",
    ],
  },
  {
    kind: "venn_diagram",
    label: "Venn diagram",
    prompts: [
      "Venn diagram: data engineer vs data scientist vs analytics engineer",
      "Show what UX, product, and engineering have in common as a Venn",
    ],
  },
  {
    kind: "mind_map",
    label: "Mind map",
    prompts: [
      "Mind map of skills for a senior backend engineer",
      "Brainstorm a launch campaign as a mind map",
    ],
  },
  // Dashboards
  {
    kind: "kpi_dashboard",
    label: "KPI dashboard",
    prompts: [
      "SaaS KPI dashboard: MRR, churn, ARPU, NPS",
      "Show me ops KPIs for Q1 — uptime, p99 latency, error rate",
    ],
  },
  {
    kind: "profile_card",
    label: "Profile card",
    prompts: [
      "Profile card for a fictional staff engineer",
      "Profile card for the head of growth at a Series B SaaS",
    ],
  },
  {
    kind: "kanban_board",
    label: "Kanban board",
    prompts: [
      "Kanban board for a 3-person team shipping a feature",
      "Show me a sprint board with 3 tasks in progress and 2 blocked",
    ],
  },
  {
    kind: "pricing_table",
    label: "Pricing table",
    prompts: [
      "Compare your Free, Pro, and Enterprise plans",
      "Show me a pricing table for a developer-tools subscription",
    ],
  },
  // Interactive
  {
    kind: "calculator",
    label: "Calculator",
    prompts: [
      "Tip calculator with bill, people, tip slider",
      "Build a quick mortgage calculator with principal, rate, term",
    ],
  },
  {
    kind: "quiz",
    label: "Quiz",
    prompts: [
      "3-question quiz about HTTP status codes",
      "Quiz me on SQL JOIN types",
    ],
  },
  // Code & status
  {
    kind: "code_block",
    label: "Code block",
    prompts: [
      "Write a Python function that fetches a URL with retries",
      "Show me a SQL query to find duplicate email addresses",
    ],
  },
  {
    kind: "inline_banner",
    label: "Inline banner",
    prompts: [
      "Confirm that my deploy to production went through successfully",
      "Warn me about the deprecation of an old API version",
    ],
  },
];
