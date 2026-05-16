export interface UsageMetadata {
  /** Total prompt tokens billed (including cached + cache-write). */
  inputTokens: number;
  /** Generated output tokens. */
  outputTokens: number;
  /** Tokens that hit prompt cache (billed at reduced rate). */
  cacheReadTokens: number;
  /** Tokens written to cache (Anthropic-specific; billed at 1.25× input rate). */
  cacheWriteTokens: number;
}

export interface ProviderResult {
  stream: AsyncGenerator<string>;
  /** Resolves after `stream` is fully consumed. */
  usage(): Promise<UsageMetadata>;
}

export type ProviderInvoker = (
  systemPrompt: string,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) => ProviderResult;
