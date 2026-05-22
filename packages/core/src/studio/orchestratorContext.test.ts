import { describe, it, expect } from "vitest";
import {
  buildBlockOrchestratorContext,
  buildStudioCapabilitySummary,
  formatConnectableBlocksAnswer,
  getMissingToolMountsForBlock,
} from "./orchestratorContext.js";

describe("orchestratorContext", () => {
  it("summarizes all registered studios", () => {
    const summary = buildStudioCapabilitySummary();
    expect(summary).toContain("Writer's Studio");
    expect(summary).toContain("writers-studio");
  });

  it("builds block context with compatible blocks", () => {
    const ctx = buildBlockOrchestratorContext("iem.studio.writer");
    expect(ctx?.blockName).toContain("Writer");
    expect(ctx?.compatibleBlocks.length).toBeGreaterThan(0);
  });

  it("formats connectability answers", () => {
    const answer = formatConnectableBlocksAnswer("iem.studio.writer");
    expect(answer).toMatch(/connect to/i);
  });

  it("detects mocked tool mounts for video studio blocks", () => {
    const missing = getMissingToolMountsForBlock("iem.media.video-gen");
    expect(missing.some((m) => m.status === "mock")).toBe(true);
  });
});
