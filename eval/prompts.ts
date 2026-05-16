export interface TestPrompt {
  id: string;
  text: string;
  expectedKind: string;
  /** Which interactivity check applies. */
  requiresInteractivity: boolean;
}

/**
 * Three prompts chosen to stress different model capabilities:
 * 1. decision — reasoning + tabular structure + recommendation
 * 2. stepper — sequential hierarchy + design polish
 * 3. chart — inline SVG math (hardest test; cheap models break here)
 */
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
