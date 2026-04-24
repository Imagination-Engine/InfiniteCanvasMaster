import { describe, it, expect, vi, beforeEach } from "vitest";
import { chapterBlock } from "./chapterBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Chapter Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(chapterBlock.id).toBe("iem.scribe.chapter");
    const validIn = { title: "Test", outline: "Test" };
    expect(chapterBlock.input.parse(validIn)).toEqual({ ...validIn });
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: "Mocked chapter content",
      usage: { promptTokens: 10, completionTokens: 5 },
    });

    const result = await chapterBlock.agent.invoke({ title: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Mocked chapter content");
  });
});
