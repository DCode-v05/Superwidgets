import type { EngineEvent } from "@/lib/types/engine-widgets";
import { runWidgetParser } from "./widget-parser";
import { getProvider, type ProviderId } from "./providers";
import { SYSTEM_PROMPT_FREEFORM } from "./system-prompt-freeform";
import { FRONTEND_DESIGN_SKILL } from "./frontend-design-skill";

const SKILL_SEPARATOR = "\n\n---\n\n";

interface RunEngineOpts {
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
  const tokens = provider(systemPrompt, message, history);
  yield* runWidgetParser(tokens);
}
