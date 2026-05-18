import type { EngineEvent } from "@/lib/types/engine-widgets";
import { runWidgetParser } from "./widget-parser";
import { getProvider, type ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";
import { SYSTEM_PROMPT_FREEFORM } from "./system-prompt-freeform";
import { FRONTEND_DESIGN_SKILL } from "./frontend-design-skill";
import { computeCost } from "./pricing";

const SKILL_SEPARATOR = "\n\n---\n\n";

export interface RunEngineOpts {
  providerId: ProviderId;
  useSkill: boolean;
}

export async function* runEngine(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  const provider = getProvider(opts.providerId);
  const systemPrompt = opts.useSkill
    ? FRONTEND_DESIGN_SKILL + SKILL_SEPARATOR + SYSTEM_PROMPT_FREEFORM
    : SYSTEM_PROMPT_FREEFORM;

  const result = provider(systemPrompt, message, history);
  yield* runWidgetParser(result.stream);

  try {
    const usage = await result.usage();
    yield buildUsageEvent(opts.providerId, usage);
  } catch {
    /* best-effort */
  }
}

function buildUsageEvent(
  providerId: ProviderId,
  usage: UsageMetadata,
): EngineEvent {
  const totalCost = computeCost(providerId, usage);
  const cacheHitRate =
    usage.inputTokens > 0 ? usage.cacheReadTokens / usage.inputTokens : 0;
  return {
    type: "usage",
    usage: {
      providerId,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      cacheHitRate,
      totalCost,
    },
  };
}
