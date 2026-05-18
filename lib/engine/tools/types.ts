/**
 * Provider-agnostic tool definitions for the agentic loop.
 *
 * Mirrors the engine-peripherals working_memory_log shape: each tool call
 * + result is one typed entry in the per-turn trace. Each provider
 * (Anthropic / OpenAI / Google) translates these into its native
 * tool / function-calling format. See `providers/*.ts`.
 */

export interface ToolDefinition {
  /** Tool name, sent verbatim to the model. snake_case. */
  name: string;
  /** Description the model reads to decide when to call this tool. */
  description: string;
  /** JSON Schema for the tool's input — used by all three providers. */
  input_schema: {
    type: "object";
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
  /** If true, calling this tool terminates the loop. Only `render_widget`. */
  terminal?: boolean;
}

export interface JsonSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
}

/** A single tool call emitted by the model in one loop iteration. */
export interface ToolCall {
  /** Provider-issued unique id, used to correlate the result back to the call. */
  id: string;
  name: string;
  /** Parsed input — already JSON-decoded. */
  input: Record<string, unknown>;
}

/** The serialized result we send back to the model. */
export interface ToolResult {
  /** Same id as the call this responds to. */
  toolCallId: string;
  /** Tool name (helpful for some providers). */
  name: string;
  /** Stringified result — model sees this as text. */
  content: string;
  /** True if execution threw — providers map this to an error flag. */
  isError: boolean;
}

/**
 * Normalized conversation message shape used by run-engine to track loop state.
 * Each provider translates this into its native message format on every turn.
 */
export type AgentMessage =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      /** Visible text the model emitted alongside any tool calls. */
      content: string;
      toolCalls?: ToolCall[];
    }
  | { role: "tool"; results: ToolResult[] };
