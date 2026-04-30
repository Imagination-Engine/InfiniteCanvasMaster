import { describe, it, expect, vi, beforeEach } from "vitest";
import { proofreaderBlock } from "./proofreaderBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Proofreader Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(proofreaderBlock.id).toBe("iem.scribe.proofreader");
    const validIn = { payload: "test" };
    expect(proofreaderBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: "Corrected text",
      usage: { promptTokens: 10, completionTokens: 5 },
    });

    const result = await proofreaderBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Corrected text");
  });
});
