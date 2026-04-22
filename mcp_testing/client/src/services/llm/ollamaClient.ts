import { validateSchema } from "../../agent/schemas";

export class LLMStructuredError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "LLMStructuredError";
    this.code = code;
    this.details = details;
  }
}

type CallLLMArgs = {
  systemPrompt: string;
  userPrompt: string;
  schema: object;
};

type OllamaChatResponse = {
  message?: {
    role?: string;
    content?: string;
  };
  response?: string;
  error?: string;
};

const parseJsonFromContent = (content: string): unknown => {
  const normalized = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");

  const candidate =
    firstBrace >= 0 && lastBrace > firstBrace
      ? normalized.slice(firstBrace, lastBrace + 1)
      : normalized;

  return JSON.parse(candidate);
};

async function requestOllama(systemPrompt: string, userPrompt: string, schema: object): Promise<unknown> {
  const baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = import.meta.env.VITE_OLLAMA_MODEL ?? "llama3";

  const schemaInstruction = [
    "Return valid JSON only.",
    "Do not include markdown fences or commentary.",
    `Output must satisfy this JSON schema: ${JSON.stringify(schema)}`,
  ].join(" ");

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      options: {
        temperature: 0,
      },
      messages: [
        { role: "system", content: `${systemPrompt}\n${schemaInstruction}` },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as OllamaChatResponse | null;

  if (!response.ok) {
    throw new LLMStructuredError(
      "OLLAMA_HTTP_ERROR",
      `Ollama request failed with status ${response.status}`,
      payload,
    );
  }

  const content = payload?.message?.content ?? payload?.response;
  if (!content || typeof content !== "string") {
    throw new LLMStructuredError("OLLAMA_EMPTY_RESPONSE", "Ollama returned empty response content.", payload);
  }

  try {
    return parseJsonFromContent(content);
  } catch (error) {
    throw new LLMStructuredError("OLLAMA_NON_JSON_RESPONSE", "Model response was not valid JSON.", {
      rawContent: content,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function callLLM<T>({ systemPrompt, userPrompt, schema }: CallLLMArgs): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const json = await requestOllama(systemPrompt, userPrompt, schema);
      return validateSchema<T>(schema, json);
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        continue;
      }
    }
  }

  if (lastError instanceof LLMStructuredError) {
    throw lastError;
  }

  throw new LLMStructuredError(
    "OLLAMA_SCHEMA_INVALID",
    "Model response failed schema validation after retry.",
    lastError,
  );
}
