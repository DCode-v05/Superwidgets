import type { EngineEvent, OutputFormat } from "@/lib/types/engine-widgets";
import { runWidgetParser } from "./widget-parser";
import { getProvider, type ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";
import { SYSTEM_PROMPT_FREEFORM } from "./system-prompt-freeform";
import { FRONTEND_DESIGN_SKILL } from "./frontend-design-skill";
import { composeSpecialistPrompt } from "./skills";
import { computeCost } from "./pricing";
import { runAgent } from "./agent-runner";
import {
  logTurnStart,
  logRouterDecision,
  logSpecialistStart,
  logEvent,
  logUsage,
  logTurnEnd,
  logError,
} from "./logger";

const SKILL_SEPARATOR = "\n\n---\n\n";

export interface RunEngineOpts {
  providerId: ProviderId;
  useSkill: boolean;
  pipeline: boolean;
  outputFormat: OutputFormat;
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
  const systemPrompt = opts.useSkill
    ? FRONTEND_DESIGN_SKILL + SKILL_SEPARATOR + SYSTEM_PROMPT_FREEFORM
    : SYSTEM_PROMPT_FREEFORM;

  const turnId = logTurnStart({
    message,
    providerId: opts.providerId,
    useSkill: opts.useSkill,
    pipeline: opts.pipeline,
    outputFormat: opts.outputFormat,
    systemPromptBytes: systemPrompt.length,
    historyLength: history.length,
  });
  const t0 = Date.now();
  let ok = true;
  let errMsg: string | undefined;

  try {
    const result = provider(systemPrompt, message, history);
    for await (const ev of runWidgetParser(result.stream)) {
      if (ev.type === "widget_html") {
        logEvent(turnId, "widget_html", `bytes=${ev.html.length}`);
      } else if (ev.type === "error") {
        ok = false;
        errMsg = ev.message;
        logError(turnId, "stream", ev.message);
      }
      yield ev;
    }

    try {
      const usage = await result.usage();
      const ev = buildUsageEvent(opts.providerId, [usage]);
      if (ev.type === "usage") logUsage(turnId, ev.usage);
      yield ev;
    } catch (e) {
      logError(turnId, "usage", e instanceof Error ? e.message : String(e));
    }
  } catch (e) {
    ok = false;
    errMsg = e instanceof Error ? e.message : String(e);
    logError(turnId, "single-mode", errMsg);
    throw e;
  } finally {
    logTurnEnd(turnId, { ms: Date.now() - t0, ok, error: errMsg });
  }
}

/**
 * Agent mode — replaces the old one-word router with a 2-round Skill Decision
 * Agent that reasons through candidates, critiques its own pick, then commits.
 *
 * Flow:
 *   1. agent_runner.runAgent runs 2 LLM calls (Propose + Critique) and returns
 *      a structured AgentDecision with candidates, critique, chosen kind,
 *      confidence, and a one-sentence rationale.
 *   2. We emit `agent_decision` so the frontend can render the reasoning
 *      panel above the widget.
 *   3. We then call the specialist for `decision.chosen` to render the widget.
 */
async function* runPipelineMode(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts: RunEngineOpts,
): AsyncGenerator<EngineEvent> {
  const provider = getProvider(opts.providerId);

  const turnId = logTurnStart({
    message,
    providerId: opts.providerId,
    useSkill: opts.useSkill,
    pipeline: opts.pipeline,
    outputFormat: opts.outputFormat,
    systemPromptBytes: 0, // agent uses its own prompts internally
    historyLength: history.length,
  });
  const t0 = Date.now();
  let ok = true;
  let errMsg: string | undefined;

  // === STAGE 1: AGENT — recursive decision loop ===
  let agentResult;
  try {
    agentResult = await runAgent(provider, opts.providerId, message, history);
  } catch (e) {
    ok = false;
    errMsg = e instanceof Error ? e.message : String(e);
    logError(turnId, "agent", errMsg);
    logTurnEnd(turnId, { ms: Date.now() - t0, ok, error: errMsg });
    throw e;
  }
  const { decision, usage: agentUsages } = agentResult;
  const intent = decision.chosen;

  logRouterDecision(
    turnId,
    `iters=${decision.iterations} stop=${decision.stopReason}`,
    intent,
  );
  // Emit live thoughts for any UI that wants to stream them.
  yield { type: "agent_thought", round: 1, payload: decision.round1 };
  for (const reflection of decision.reflections) {
    yield { type: "agent_thought", round: 2, payload: reflection };
  }
  // The committed decision — frontend uses this to render AgentDecisionPanel.
  yield { type: "agent_decision", decision };

  // === STAGE 2: specialist (HTML mode — the only supported render path) ===
  const specialistPrompt = composeSpecialistPrompt(intent, opts.useSkill);
  logSpecialistStart(turnId, { intent, specialistPromptBytes: specialistPrompt.length });
  try {
    const specialistResult = provider(specialistPrompt, message, history);
    for await (const ev of runWidgetParser(specialistResult.stream)) {
      if (ev.type === "widget_html") {
        logEvent(turnId, "widget_html", `bytes=${ev.html.length}`);
      } else if (ev.type === "error") {
        ok = false;
        errMsg = ev.message;
        logError(turnId, "specialist-stream", ev.message);
      }
      yield ev;
    }

    let specialistUsage: UsageMetadata | null = null;
    try {
      specialistUsage = await specialistResult.usage();
    } catch (e) {
      logError(turnId, "specialist-usage", e instanceof Error ? e.message : String(e));
    }

    // Sum agent rounds + specialist into a single usage event so the
    // UsageFooter shows total tokens/cost across all 3 calls.
    const collected = [
      ...agentUsages,
      ...(specialistUsage ? [specialistUsage] : []),
    ];
    if (collected.length > 0) {
      const ev = buildUsageEvent(opts.providerId, collected);
      if (ev.type === "usage") logUsage(turnId, ev.usage);
      yield ev;
    }
  } catch (e) {
    ok = false;
    errMsg = e instanceof Error ? e.message : String(e);
    logError(turnId, "pipeline-mode", errMsg);
    throw e;
  } finally {
    logTurnEnd(turnId, { ms: Date.now() - t0, ok, error: errMsg });
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

