export interface ProviderInvoker {
  (
    systemPrompt: string,
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
  ): AsyncGenerator<string>;
}
