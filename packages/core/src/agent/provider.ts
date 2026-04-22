import { z } from 'zod';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface MCPToolDescriptor {
  name: string;
  description?: string;
  inputSchema: any;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  system?: string;
  tools?: MCPToolDescriptor[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: { inputTokens: number; outputTokens: number };
  latencyMs: number;
}

export interface ChatChunk {
  content: string;
  toolCall?: ToolCall;
}

export interface ModelProvider {
  id: string;
  name: string;
  supportedModels: string[];
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncIterable<ChatChunk>;
  supportsTools: boolean;
}
