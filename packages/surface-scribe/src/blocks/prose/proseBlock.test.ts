import { describe, it, expect, vi, beforeEach } from "vitest";
import { proseBlock } from "./proseBlock";

// Mock the AI SDK properly so generateText returns usage
vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: "Mocked prose content",
    usage: { promptTokens: 10, completionTokens: 5 },
  }),
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
    const result = await proseBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Mocked prose content");
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => proseBlock.input.parse({ payload: 123 })).toThrow();
  });
});
