import { describe, it, expect, vi, beforeEach } from "vitest";
import { characterProfileBlock } from "./characterProfileBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Character Profile Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(characterProfileBlock.id).toBe("iem.scribe.characterProfile");
    const validIn = { payload: "Hero" };
    expect(characterProfileBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: '{"name": "Hero", "age": 30}',
      usage: { promptTokens: 10, completionTokens: 5 },
    });

    const result = await characterProfileBlock.agent.invoke({
      payload: "Hero",
    });
    expect(result.success).toBe(true);
    expect(result.profile.name).toBe("Hero");
  });
});
