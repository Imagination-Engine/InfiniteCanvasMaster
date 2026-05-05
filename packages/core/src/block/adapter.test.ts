// @ts-nocheck
import { describe, it, expect } from "vitest";
import { createMastraToolFromBlock } from "./adapter";
import { z } from "zod";
import type { BlockDefinition } from "./protocol";

describe("createMastraToolFromBlock", () => {
  it("correctly adapts an IEM block to a Mastra tool", async () => {
    const mockBlock: BlockDefinition<any, any> = {
      id: "test.block",
      name: "Test Block",
      description: "A test block",
      category: "creative",
      mode: "triggered",
      input: z.object({ value: z.string() }),
      output: z.object({ result: z.string() }),
      agent: {
        kind: "local",
        toolName: "test_tool",
        invoke: async ({ value }) => ({ result: `${value}-processed` }),
      },
    };

    const tool = await createMastraToolFromBlock(mockBlock);

    expect(tool.id).toBe("test.block");
    expect(tool.description).toBe("A test block");

    // Execute the bound function to verify it proxies to the agent
    // Mastra 1.27 tool.execute typically takes the schema properties at the root if no `context` wrapper is used in older versions,
    // or `{ context: { ... } }` depending on the caller. If it requires the schema at the root:
    const res = await tool.execute({ context: { value: "hello" } as any });
    // Let's inspect the error to see if it requires the properties at the root
    if (res?.error && res?.validationErrors) {
      // It expects the arguments to match the schema exactly at the root of the input object.
      const directRes = await tool.execute({ value: "hello" } as any);
      expect(directRes).toEqual({ result: "hello-processed" });
    } else {
      expect(res).toEqual({ result: "hello-processed" });
    }
  });
});
