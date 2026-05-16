import type { EngineEvent, OutputFormat } from "@/lib/types/engine-widgets";
import { runWidgetParser } from "./widget-parser";
import { getProvider, type ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";
import { SYSTEM_PROMPT_FREEFORM } from "./system-prompt-freeform";
import { FRONTEND_DESIGN_SKILL } from "./frontend-design-skill";
import { REACT_MODE_OVERRIDE } from "./react-mode-override";
import {
  composeSpecialistPrompt,
  isWidgetIntent,
  WIDGET_INTENTS,
  type WidgetIntent,
} from "./skills";
import { ROUTER_PROMPT } from "./router-prompt";
import { computeCost } from "./pricing";

const SKILL_SEPARATOR = "\n\n---\n\n";
const REACT_SEPARATOR = "\n\n---\n\n";

export interface RunEngineOpts {
  providerId: ProviderId;
  useSkill: boolean;
  pipeline: boolean;
  outputFormat: OutputFormat;
}

function withReactOverride(prompt: string, outputFormat: OutputFormat): string {
  if (outputFormat === "react") {
    return prompt + REACT_SEPARATOR + REACT_MODE_OVERRIDE;
  }
  return prompt;
}

export async function* runEngine(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  if (opts.pipeline) {
    yield* runPipelineMode(message, history, opts);
  } else {
    yield* runSingleMode(message, history, opts);
  }
}

async function* runSingleMode(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  const provider = getProvider(opts.providerId);
  const base = opts.useSkill
    ? FRONTEND_DESIGN_SKILL + SKILL_SEPARATOR + SYSTEM_PROMPT_FREEFORM
    : SYSTEM_PROMPT_FREEFORM;
  const systemPrompt = withReactOverride(base, opts.outputFormat);

  const result = provider(systemPrompt, message, history);
  yield* runWidgetParser(result.stream);

  try {
    const usage = await result.usage();
    yield buildUsageEvent(opts.providerId, [usage]);
  } catch {
    /* best-effort */
  }
}

async function* runPipelineMode(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  const provider = getProvider(opts.providerId);

  // === STAGE 1: router (always HTML-mode; it only emits one word) ===
  const routerResult = provider(ROUTER_PROMPT, message, history);
  let routerText = "";
  for await (const chunk of routerResult.stream) {
    routerText += chunk;
  }
  let routerUsage: UsageMetadata | null = null;
  try {
    routerUsage = await routerResult.usage();
  } catch {
    /* best-effort */
  }

  const intent = parseIntent(routerText);

  yield {
    type: "text_delta",
    text: `_Router picked **${intent}**._\n\n`,
  };

  // === STAGE 2: specialist ===
  const baseSpecialist = composeSpecialistPrompt(intent, opts.useSkill);
  const specialistPrompt = withReactOverride(baseSpecialist, opts.outputFormat);
  const specialistResult = provider(specialistPrompt, message, history);
  yield* runWidgetParser(specialistResult.stream);

  let specialistUsage: UsageMetadata | null = null;
  try {
    specialistUsage = await specialistResult.usage();
  } catch {
    /* best-effort */
  }

  const collected = [routerUsage, specialistUsage].filter(
    (u): u is UsageMetadata => u !== null,
  );
  if (collected.length > 0) {
    yield buildUsageEvent(opts.providerId, collected);
  }
}

function buildUsageEvent(
  providerId: ProviderId,
  reports: UsageMetadata[],
): EngineEvent {
  const summed: UsageMetadata = reports.reduce<UsageMetadata>(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      cacheReadTokens: acc.cacheReadTokens + u.cacheReadTokens,
      cacheWriteTokens: acc.cacheWriteTokens + u.cacheWriteTokens,
    }),
    { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
  );
  const totalCost = computeCost(providerId, summed);
  const cacheHitRate =
    summed.inputTokens > 0 ? summed.cacheReadTokens / summed.inputTokens : 0;
  return {
    type: "usage",
    usage: {
      providerId,
      inputTokens: summed.inputTokens,
      outputTokens: summed.outputTokens,
      cacheReadTokens: summed.cacheReadTokens,
      cacheWriteTokens: summed.cacheWriteTokens,
      cacheHitRate,
      totalCost,
    },
  };
}

function parseIntent(raw: string): WidgetIntent {
  const cleaned = raw.trim().toLowerCase().replace(/[`"'.,!?]/g, "");
  if (isWidgetIntent(cleaned)) return cleaned;
  const firstToken = cleaned.split(/\s+/)[0];
  if (isWidgetIntent(firstToken)) return firstToken;
  for (const intent of WIDGET_INTENTS) {
    if (cleaned.includes(intent)) return intent;
  }
  return "chips";
}
