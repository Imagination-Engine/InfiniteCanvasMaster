export type ToolCallState = "executing" | "completed" | "error";

export interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  state: ToolCallState;
  result?: any;
}

export type StreamState = "idle" | "thinking" | "streaming" | "error";

export type MessageLifecycle =
  | "pending"
  | "submitted"
  | "persisted"
  | "queued"
  | "streaming"
  | "tool_invocation"
  | "tool_result"
  | "complete"
  | "interrupted"
  | "error";

export interface Artifact {
  id: string;
  type: string; // e.g., 'image', 'code', 'blueprint'
  content: any;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  toolInvocations?: ToolCall[];
  artifacts?: Artifact[];
  createdAt: Date;
  lifecycle: MessageLifecycle;
  error?: string;
}

export interface StreamEvent {
  type: "text" | "tool_call" | "tool_result" | "error" | "finish" | "start";
  payload: any;
}
