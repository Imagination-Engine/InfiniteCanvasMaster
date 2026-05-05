// @ts-nocheck
import { describe, it, expect } from "vitest";

describe("Index Barrel File", () => {
  it("should export all required modules from index.ts", async () => {
    const Index = await import("../index");

    const expectedExports = [
      "InfiniteViewport",
      "ObjectRenderer",
      "ConnectorLayer",
      "useCanvasClipboard",
      "useAgentOnCanvas",
      "useCanvasStore",
      "useViewportStore",
    ];

    for (const exp of expectedExports) {
      expect(
        Index[exp],
        `Expected ${exp} to be exported from src/index.ts`,
      ).toBeDefined();
    }
  });
});
