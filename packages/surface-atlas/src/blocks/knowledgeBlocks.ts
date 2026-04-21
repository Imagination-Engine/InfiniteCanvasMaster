import { z } from 'zod';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

export const ingestionBlock: BlockDefinition<any, any> = {
  id: 'iem.atlas.ingestion',
  name: 'Ingestion',
  description: 'Ingests and chunks content into the vector store',
  category: 'knowledge',
  input: z.object({
    content: z.string().min(1, "Content cannot be empty"),
    source: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    chunksIngested: z.number(),
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'vector_ingest',
    invoke: async (input) => {
      // Stub: Chunking logic and pgvector insertion
      const simulatedChunks = Math.ceil(input.content.length / 500) || 1;
      return { success: true, chunksIngested: simulatedChunks };
    }
  }
};

export const retrievalBlock: BlockDefinition<any, any> = {
  id: 'iem.atlas.retrieval',
  name: 'Retrieval',
  description: 'Performs semantic search to retrieve top-K context chunks',
  category: 'knowledge',
  input: z.object({
    query: z.string().min(1),
    topK: z.number().min(1).max(20).default(5),
  }),
  output: z.object({
    chunks: z.array(z.string()),
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'vector_retrieve',
    invoke: async (input) => {
      // Stub: Semantic search in pgvector
      return { chunks: ['Mocked chunk 1 related to ' + input.query] };
    }
  }
};

export const synthesisBlock: BlockDefinition<any, any> = {
  id: 'iem.atlas.synthesis',
  name: 'Synthesis',
  description: 'Generates a cited, synthesized answer using LLM and context',
  category: 'knowledge',
  input: z.object({
    query: z.string(),
    contextChunks: z.array(z.string()),
  }),
  output: z.object({
    answer: z.string(),
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'llm_synthesize',
    invoke: async (input) => {
      // Stub: LLM invocation
      return { answer: `Synthesized answer based on ${input.contextChunks.length} chunks.` };
    }
  }
};