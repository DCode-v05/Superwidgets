/**
 * Test prompts grouped by widget intent.
 * Two prompts per widget kind — the model picks the widget based on the prompt
 * (the `kind` field here is descriptive, not enforced anywhere).
 *
 * Used by [components/chat/EmptyState.tsx] for one-click testing of each
 * widget kind across the three modes (Anthropic / Gemini + Skill / Llama + Skill).
 */

export interface PromptGroup {
  kind: string;
  label: string;
  prompts: string[];
}

export const TEST_PROMPTS: PromptGroup[] = [
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
  {
    kind: "stepper",
    label: "Plan / Steps",
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
    kind: "source_cards",
    label: "Sources",
    prompts: [
      "Tell me about Y Combinator with sources",
      "Find me 3 reputable articles about prompt caching",
    ],
  },
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
    kind: "code_block",
    label: "Code",
    prompts: [
      "Write a Python function that fetches a URL with retries",
      "Show me a SQL query to find duplicate email addresses",
    ],
  },
  {
    kind: "inline_banner",
    label: "Banner",
    prompts: [
      "Confirm that my deploy went through successfully",
      "Warn me about the deprecation of an old API version",
    ],
  },
  {
    kind: "flowchart",
    label: "Flowchart",
    prompts: [
      "Draw a flowchart for handling a customer refund request",
      "Show the CI/CD pipeline flow for a typical PR merge",
    ],
  },
  {
    kind: "venn_diagram",
    label: "Venn diagram",
    prompts: [
      "Venn diagram: data engineer vs data scientist vs analytics engineer",
      "Show overlap between React, Vue, and Svelte feature sets",
    ],
  },
  {
    kind: "mind_map",
    label: "Mind map",
    prompts: [
      "Mind map of skills needed to become a senior backend engineer",
      "Map out the components of a modern observability stack",
    ],
  },
  {
    kind: "pie_chart",
    label: "Pie chart",
    prompts: [
      "Show a pie chart of typical SaaS startup expenses by category",
      "Pie chart of browser market share in 2026",
    ],
  },
  {
    kind: "heatmap",
    label: "Heatmap",
    prompts: [
      "Heatmap of website traffic by day of week and hour of day",
      "Show GitHub-style commit activity heatmap for a contributor",
    ],
  },
  {
    kind: "kpi_dashboard",
    label: "KPI dashboard",
    prompts: [
      "Build a SaaS KPI dashboard: MRR, churn, ARPU, NPS",
      "Show a marketing dashboard with traffic, signups, CAC, and LTV",
    ],
  },
  {
    kind: "profile_card",
    label: "Profile card",
    prompts: [
      "Profile card for a fictional staff engineer at a fintech",
      "Make a contact card for a freelance designer",
    ],
  },
  {
    kind: "kanban_board",
    label: "Kanban board",
    prompts: [
      "Show a kanban board for a 3-person team shipping a new feature",
      "Kanban for a Q3 product roadmap with backlog/in-progress/shipped columns",
    ],
  },
  {
    kind: "calculator",
    label: "Calculator (live)",
    prompts: [
      "Build me a tip calculator with bill, people, and tip slider",
      "Make a unit converter for kilometers and miles",
    ],
  },
  {
    kind: "quiz",
    label: "Quiz (live)",
    prompts: [
      "Make a 3-question quiz about HTTP status codes",
      "Quick quiz on basic React hooks — 4 questions, multiple choice",
    ],
  },
];
