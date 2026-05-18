/**
 * Tiny structured logger for the engine.
 *
 * Goal: when watching the dev server stdout (`npm run dev`), every assistant
 * turn shows a labelled, indented trace of what happened — system prompt size,
 * model call, parser, usage, errors — so the backend isn't a black box.
 *
 * Format: `[bap] <stage> <key>=<val> <key>=<val>` — readable, greppable.
 *
 * Disable by setting MINI_BAP_LOG=0. Suppress in tests by default if NODE_ENV
 * is "test".
 */

const ENABLED =
  process.env.MINI_BAP_LOG !== "0" && process.env.NODE_ENV !== "test";

function fmt(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([k, v]) => {
      if (typeof v === "string") {
        // single-line, truncate long strings
        const cleaned = v.replace(/\n/g, "\\n");
        return `${k}=${cleaned.length > 80 ? cleaned.slice(0, 80) + "…" : cleaned}`;
      }
      return `${k}=${JSON.stringify(v)}`;
    })
    .join(" ");
}

export function logTurnStart(opts: {
  message: string;
  providerId: string;
  useSkill: boolean;
  pipeline: boolean;
  outputFormat: string;
  systemPromptBytes: number;
  historyLength: number;
}): string {
  const turnId = `t_${Date.now().toString(36)}`;
  if (!ENABLED) return turnId;
  console.log(`\n[bap] ▶ turn-start  ${fmt({ turnId, ...opts })}`);
  return turnId;
}

export function logRouterDecision(turnId: string, raw: string, intent: string): void {
  if (!ENABLED) return;
  console.log(
    `[bap]   router-pick   ${fmt({ turnId, raw: raw.trim().slice(0, 40), intent })}`,
  );
}

export function logSpecialistStart(
  turnId: string,
  info: { intent?: string; specialistPromptBytes: number },
): void {
  if (!ENABLED) return;
  console.log(`[bap]   specialist    ${fmt({ turnId, ...info })}`);
}

export function logEvent(turnId: string, eventType: string, detail?: string): void {
  if (!ENABLED) return;
  const line = detail
    ? `[bap]   event         ${fmt({ turnId, type: eventType, detail })}`
    : `[bap]   event         ${fmt({ turnId, type: eventType })}`;
  console.log(line);
}

export function logUsage(
  turnId: string,
  u: {
    providerId: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    totalCost: number;
  },
): void {
  if (!ENABLED) return;
  console.log(
    `[bap]   usage         ${fmt({
      turnId,
      provider: u.providerId,
      in: u.inputTokens,
      out: u.outputTokens,
      cache_read: u.cacheReadTokens,
      cost_usd: u.totalCost.toFixed(5),
    })}`,
  );
}

export function logTurnEnd(turnId: string, info: { ms: number; ok: boolean; error?: string }): void {
  if (!ENABLED) return;
  console.log(
    `[bap] ◀ turn-end    ${fmt({ turnId, ...info })}\n`,
  );
}

export function logError(turnId: string, where: string, message: string): void {
  if (!ENABLED) return;
  console.log(
    `[bap]   ✕ error       ${fmt({ turnId, where, message: message.slice(0, 160) })}`,
  );
}
