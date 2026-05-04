import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

// --- Helpers ---
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
      const splitPoint = Math.max(
        chunk.lastIndexOf("."),
        chunk.lastIndexOf("\n"),
        chunk.lastIndexOf(" "),
      );
      const actualSplit = splitPoint > chunkSize / 2 ? i + splitPoint + 1 : end;
      chunk = text.slice(i, actualSplit);
      i = actualSplit - overlap;
    } else i += chunkSize;
    const trimmed = chunk.trim();
    if (trimmed.length > 0) chunks.push(trimmed);
  }
  return chunks;
}

// --- Blocks ---

export const ingestionBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.ingestion",
  name: "Ingestion",
  description: "Chunks and ingests content into a vector store.",
  category: "knowledge",
  input: z.object({
    content: z.string().min(1),
    source: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    chunksIngested: z.number(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "ingest",
    invoke: async (input: any) => {
      // Mock embedding and DB insertion
      const res1 = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
      });
      await res1.json();
      const res2 = await fetch("https://api.pinecone.io/vectors/upsert", {
        method: "POST",
      });
      await res2.json();
      return { success: true, chunksIngested: 1 };
    },
  },
};

export const retrievalBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.retrieval",
  name: "Retrieval",
  description: "Retrieves relevant chunks from a vector store.",
  category: "knowledge",
  input: z.object({
    query: z.string(),
    topK: z.number().optional().default(5),
  }),
  output: z.object({
    chunks: z.array(z.string()),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "retrieve",
    invoke: async (input: any) => {
      const res1 = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
      });
      await res1.json();
      const res2 = await fetch("https://api.pinecone.io/query", {
        method: "POST",
      });
      const data = await res2.json();
      if (Array.isArray(data)) {
        return { chunks: data.map((d: any) => d.content) };
      }
      return { chunks: [] };
    },
  },
};

export const synthesisBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.synthesis",
  name: "Synthesis",
  description: "Synthesizes an answer using an LLM.",
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
    toolName: "synthesize",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const result = await agentRuntime.chat({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: input.query }],
      });
      return { answer: result.content };
    },
  },
};

export const documentLoaderBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.documentLoader",
  name: "Document Loader",
  description: "Load data from external files or URLs.",
  category: "knowledge",
  input: z.object({ url: z.string().url() }),
  output: z.object({ rawData: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "load_doc",
    invoke: async (i: any) => ({ rawData: `Content from ${i.url}` }),
  },
};

export const chunkerBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.chunker",
  name: "Chunker",
  description: "Split text for vector indexing.",
  category: "knowledge",
  input: z.object({ text: z.string() }),
  output: z.object({ chunks: z.array(z.string()) }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "chunk_text",
    invoke: async (i: any) => ({ chunks: chunkText(i.text) }),
  },
};

export const vectorSearchBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.vectorSearch",
  name: "Vector Search",
  description: "Semantic search across embeddings.",
  category: "knowledge",
  input: z.object({ query: z.string(), topK: z.number().default(5) }),
  output: z.object({ matches: z.array(z.string()) }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vector_search",
    invoke: async (i: any) => ({ matches: ["Result 1", "Result 2"] }),
  },
};

export const graphKnowledgeBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.graphKnowledge",
  name: "Graph Knowledge",
  description: "Manage structured entity relations.",
  category: "knowledge",
  input: z.object({ entity: z.string() }),
  output: z.object({ relations: z.array(z.any()) }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "graph_lookup",
    invoke: async (i: any) => ({ relations: [] }),
  },
};

export const indexerBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.indexer",
  name: "Indexer",
  description: "Index chunks into vector store.",
  category: "knowledge",
  input: z.object({ chunks: z.array(z.string()) }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vector_index",
    invoke: async () => ({ success: true }),
  },
};

export const queryBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.query",
  name: "Query",
  description: "Run advanced RAG queries.",
  category: "knowledge",
  input: z.object({ prompt: z.string() }),
  output: z.object({ response: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "rag_query",
    invoke: async (i: any) => ({ response: `Answer to ${i.prompt}` }),
  },
};

export const embedBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.embed",
  name: "Embed",
  description: "Generate embeddings for text.",
  category: "knowledge",
  input: z.object({ text: z.string() }),
  output: z.object({ embedding: z.array(z.number()) }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "get_embedding",
    invoke: async () => ({ embedding: [0.1, 0.2] }),
  },
};

export const upsertBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.upsert",
  name: "Upsert",
  description: "Insert or update vector data.",
  category: "knowledge",
  input: z.object({ id: z.string(), data: z.any() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vector_upsert",
    invoke: async () => ({ success: true }),
  },
};

export const semanticRouterBlock: BlockDefinition<any, any> = {
  id: "iem.atlas.semanticRouter",
  name: "Semantic Router",
  description: "Route intent based on semantics.",
  category: "knowledge",
  input: z.object({ input: z.string(), routes: z.array(z.string()) }),
  output: z.object({ route: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "semantic_route",
    invoke: async (i: any) => ({ route: i.routes[0] }),
  },
};
