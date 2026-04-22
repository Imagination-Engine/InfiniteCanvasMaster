import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ingestionBlock,
  retrievalBlock,
  synthesisBlock,
} from "./knowledgeBlocks";

describe("Knowledge-Primitive Blocks (Red/Green Phase)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe("Ingestion Block", () => {
    it("has valid metadata and schema", () => {
      expect(ingestionBlock.id).toBe("iem.atlas.ingestion");
      const validIn = { content: "Sample text to embed", source: "test.txt" };
      expect(ingestionBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("successfully chunks and ingests content", async () => {
      // Mock embedding and DB insertion
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ embedding: [0.1, 0.2] }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const output = await ingestionBlock.agent.invoke({
        content: "test",
        source: "file",
      });
      expect(output).toHaveProperty("success", true);
      expect(output).toHaveProperty("chunksIngested", 1);
      expect(global.fetch).toHaveBeenCalledTimes(2); // 1 for embedding, 1 for insert
    });

    it("adversarial: throws on empty content ingestion", () => {
      // Empty string validation logic via zod refinement or length
      expect(() =>
        ingestionBlock.input.parse({ content: "", source: "test.txt" }),
      ).toThrow();
    });
  });

  describe("Retrieval Block", () => {
    it("has valid metadata and schema", () => {
      expect(retrievalBlock.id).toBe("iem.atlas.retrieval");
      const validIn = { query: "What is this?", topK: 5 };
      expect(retrievalBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("successfully retrieves vectors", async () => {
      // Mock embedding and DB search
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ embedding: [0.1, 0.2] }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ content: "Result chunk 1" }],
        });

      const output = await retrievalBlock.agent.invoke({ query: "test" });
      expect(output).toHaveProperty("chunks");
      expect(output.chunks).toEqual(["Result chunk 1"]);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("adversarial: handles retrieval against empty database", async () => {
      // Mock embedding and empty DB search
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ embedding: [0.1, 0.2] }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      const output = await retrievalBlock.agent.invoke({ query: "unknown" });
      expect(output.chunks).toEqual([]);
    });
  });

  describe("Synthesis Block", () => {
    it("has valid metadata and schema", () => {
      expect(synthesisBlock.id).toBe("iem.atlas.synthesis");
      const validIn = {
        query: "Summarize",
        contextChunks: ["chunk 1", "chunk 2"],
      };
      expect(synthesisBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("successfully synthesizes an answer using LLM", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Synthesized response" } }],
        }),
      });

      const output = await synthesisBlock.agent.invoke({
        query: "test",
        contextChunks: ["c1"],
      });
      expect(output).toHaveProperty("answer", "Synthesized response");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
