import { describe, it, expect, vi, beforeEach } from "vitest";
import { proseBlock } from "./proseBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Prose Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(proseBlock.id).toBe("iem.scribe.prose");
    expect(proseBlock.name).toBe("Prose");

    const validIn = { payload: "test" };
    expect(proseBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: "Mocked prose content",
    });

    const result = await proseBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Mocked prose content");
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => proseBlock.input.parse({ payload: 123 })).toThrow();
  });
});
