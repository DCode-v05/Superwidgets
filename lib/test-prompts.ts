// Demo prompts grouped by widget intent. `kind` is descriptive, not enforced.
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
    kind: "timeline",
    label: "Timeline",
    prompts: [
      "Show the major milestones of Y Combinator as a timeline",
      "Timeline of the Apollo program — Apollo 1 to Apollo 17",
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
    kind: "pricing_table",
    label: "Pricing table",
    prompts: [
      "Show me a 3-tier SaaS pricing table — Free, Pro, Enterprise",
      "Pricing table for a hosted database product with usage-based tiers",
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
  {
    kind: "form",
    label: "Form (live)",
    prompts: [
      "Build a user signup form with name, email, password, and plan",
      "Show me a 5-field contact form for a SaaS website",
    ],
  },
  {
    kind: "sequence_diagram",
    label: "Sequence diagram",
    prompts: [
      "Show me how browser, app server, and auth server interact during OAuth",
      "Trace the API call flow for placing an order",
    ],
  },
  {
    kind: "tree_diagram",
    label: "Tree diagram",
    prompts: [
      "Show the engineering org structure as a tree",
      "Tree diagram of folder types in a typical Next.js project",
    ],
  },
  {
    kind: "gantt_chart",
    label: "Gantt chart",
    prompts: [
      "Plan a 12-week product launch as a Gantt chart",
      "Gantt of a database migration — schema, backfill, cutover, validation",
    ],
  },
  {
    kind: "scatter_plot",
    label: "Scatter plot",
    prompts: [
      "Plot revenue vs ad spend for our top 20 campaigns",
      "Scatter plot: hours studied vs exam score for a class of 25",
    ],
  },
  {
    kind: "funnel_chart",
    label: "Funnel chart",
    prompts: [
      "Funnel: signups → activated → paying → renewed",
      "Show the e-commerce conversion funnel for last month",
    ],
  },
  {
    kind: "radar_chart",
    label: "Radar chart",
    prompts: [
      "Compare myself vs a senior engineer on 5 skills as a radar chart",
      "Radar: Slack vs Teams vs Discord on usability, search, integrations, voice, mobile",
    ],
  },
  {
    kind: "map",
    label: "Map",
    prompts: [
      "Show me a map of 6 office locations across the US",
      "Itinerary map: NYC → London → Paris → Berlin",
    ],
  },
];
