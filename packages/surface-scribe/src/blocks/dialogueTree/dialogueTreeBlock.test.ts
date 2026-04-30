import { describe, it, expect, vi, beforeEach } from "vitest";
import { dialogueTreeBlock } from "./dialogueTreeBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Dialogue Tree Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(dialogueTreeBlock.id).toBe("iem.scribe.dialogueTree");
    const validIn = { payload: "A quest" };
    expect(dialogueTreeBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: '{"nodes": [], "edges": []}',
      usage: { promptTokens: 10, completionTokens: 5 },
    });

    const result = await dialogueTreeBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.tree).toHaveProperty("nodes");
  });
});
