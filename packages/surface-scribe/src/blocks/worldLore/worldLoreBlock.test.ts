import { describe, it, expect, vi, beforeEach } from "vitest";
import { worldLoreBlock } from "./worldLoreBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("World Lore Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(worldLoreBlock.id).toBe("iem.scribe.worldLore");
    const validIn = { payload: "Cyberpunk" };
    expect(worldLoreBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: "Mocked lore description",
      usage: { promptTokens: 10, completionTokens: 5 },
    });

    const result = await worldLoreBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.lore).toBe("Mocked lore description");
  });
});
