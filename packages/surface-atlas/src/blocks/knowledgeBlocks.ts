import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    let chunk = text.slice(i, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const lastSpace = chunk.lastIndexOf(" ");

      let splitPoint = end;
      if (lastPeriod > chunkSize / 2) splitPoint = i + lastPeriod + 1;
      else if (lastNewline > chunkSize / 2) splitPoint = i + lastNewline + 1;
      else if (lastSpace > chunkSize / 2) splitPoint = i + lastSpace + 1;

      chunk = text.slice(i, splitPoint);
      i = splitPoint - overlap;
    } else {
      i += chunkSize;
    }
    const trimmed = chunk.trim();
    if (trimmed.length > 0) chunks.push(trimmed);
    if (i >= text.length) break;
  }
  return chunks;
}

async function getEmbedding(text: string): Promise<number[]> {
  const llmApi =
    process.env.LLM_API_URL || "https://api.openai.com/v1/embeddings";
  const apiKey = process.env.OPENAI_API_KEY || "";

  const response = await fetch(llmApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
  });

  if (!response.ok) {
    throw new Error(
      `Embedding failed: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data.data[0].embedding;
}

export const ingestionBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.ingestion",
  name: "Ingestion",
  description: "Ingests and chunks content into the vector store",
  category: "knowledge",
  input: z.object({
    content: z.string().min(1, "Content cannot be empty"),
    source: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    chunksIngested: z.number(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vector_ingest",
    invoke: async (input) => {
      try {
        const chunks = chunkText(input.content);
        const vectorDbUrl =
          process.env.VECTOR_DB_URL || "http://localhost:3000/api/vector/query";
        const apiKey = process.env.DB_API_KEY || "";

        let ingested = 0;
        for (const chunk of chunks) {
          const embedding = await getEmbedding(chunk);
          const response = await fetch(vectorDbUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              query:
                "INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)",
              params: [
                chunk,
                { source: input.source },
                `[${embedding.join(",")}]`,
              ],
            }),
          });
          if (!response.ok) {
            console.error(`Failed to ingest chunk: ${response.statusText}`);
            continue;
          }
          ingested++;
        }
        return { success: ingested > 0, chunksIngested: ingested };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Unknown ingestion error",
        );
      }
    },
  },
};

export const retrievalBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.retrieval",
  name: "Retrieval",
  description: "Performs semantic search to retrieve top-K context chunks",
  category: "knowledge",
  input: z.object({
    query: z.string().min(1),
    topK: z.number().min(1).max(20).default(5),
  }),
  output: z.object({
    chunks: z.array(z.string()),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vector_retrieve",
    invoke: async (input) => {
      try {
        const queryEmbedding = await getEmbedding(input.query);
        const vectorDbUrl =
          process.env.VECTOR_DB_URL || "http://localhost:3000/api/vector/query";
        const apiKey = process.env.DB_API_KEY || "";

        const response = await fetch(vectorDbUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            query:
              "SELECT content FROM documents ORDER BY embedding <-> $1 LIMIT $2",
            params: [`[${queryEmbedding.join(",")}]`, input.topK],
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Retrieval failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const chunks = (data.rows || data || []).map((row: any) => row.content);
        return { chunks };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Unknown retrieval error",
        );
      }
    },
  },
};

export const synthesisBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.synthesis",
  name: "Synthesis",
  description: "Generates a cited, synthesized answer using LLM and context",
  category: "knowledge",
  input: z.object({
    query: z.string(),
    contextChunks: z.array(z.string()),
  }),
  output: z.object({
    answer: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "llm_synthesize",
    invoke: async (input) => {
      try {
        const { agentRuntime } = await import("@iem/core");

        const systemPrompt =
          "You are a helpful assistant. Use the provided context to answer the user's query. If you cannot answer based on the context, say so.";
        const userPrompt = `Context:\n${input.contextChunks.join("\n---\n")}\n\nQuery: ${input.query}`;

        const response = await agentRuntime.chat({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        return { answer: response.content };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Unknown synthesis error",
        );
      }
    },
  },
};
