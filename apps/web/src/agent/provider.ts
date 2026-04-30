export interface MCPToolDescriptor {
  name: string;
  description: string;
  inputSchema: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  name: string;
  args: any;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  tools?: MCPToolDescriptor[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatChunk {
  content: string;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: { inputTokens: number; outputTokens: number };
  latencyMs: number;
}

export interface ModelProvider {
  id: string;
  name: string;
  supportedModels: string[];
  supportsTools: boolean;
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncIterable<ChatChunk>;
}

export class GeminiProvider implements ModelProvider {
  id = 'gemini';
  name = 'Google Gemini';
  supportedModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  supportsTools = true;

  constructor(private apiKey: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${this.apiKey}`;
    
    // Simplistic mapping for tests
    const contents = request.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`Gemini API Error: ${res.statusText}`);
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        content,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        },
        latencyMs: Date.now() - start,
      };
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message.includes('Timeout')) {
        throw new Error('Timeout');
      }
      throw e;
    }
  }

  async *stream(request: ChatRequest): AsyncIterable<ChatChunk> {
    yield { content: 'mock stream' };
  }
}

export class OllamaProvider implements ModelProvider {
  id = 'ollama';
  name = 'Ollama Local';
  supportedModels = ['llama3', 'qwen2.5:7b'];
  supportsTools = true;

  constructor(private baseUrl: string = 'http://localhost:11434') {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    throw new Error('Not implemented');
  }

  async *stream(request: ChatRequest): AsyncIterable<ChatChunk> {
    throw new Error('Not implemented');
  }
}
