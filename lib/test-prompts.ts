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
];
