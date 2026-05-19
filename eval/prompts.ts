export interface TestPrompt {
  id: string;
  text: string;
  expectedKind: string;
  requiresInteractivity: boolean;
}

export const PROMPTS: TestPrompt[] = [
  {
    id: "decision",
    text: "Compare PostgreSQL and ClickHouse for an analytics workload, recommend one",
    expectedKind: "decision_card",
    requiresInteractivity: true,
  },
  {
    id: "stepper",
    text: "Walk me through onboarding a new backend engineer in their first two weeks",
    expectedKind: "stepper",
    requiresInteractivity: false,
  },
  {
    id: "chart",
    text: "Show me revenue trend over the last 6 months as a line chart",
    expectedKind: "chart",
    requiresInteractivity: false,
  },
];
