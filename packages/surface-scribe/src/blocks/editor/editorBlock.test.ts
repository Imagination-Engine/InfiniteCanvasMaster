import { describe, it, expect, vi, beforeEach } from "vitest";
import { editorBlock } from "./editorBlock";

// Mock the AI SDK properly so generateText returns usage
vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: "Mocked edited content",
    usage: { promptTokens: 10, completionTokens: 5 },
  }),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Editor Block (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has valid metadata and schema", () => {
    expect(editorBlock.id).toBe("iem.scribe.editor");
    expect(editorBlock.name).toBe("Editor");

    const validIn = { payload: "test" };
    expect(editorBlock.input.parse(validIn)).toEqual(validIn);
  });

  it("executes agent binding successfully", async () => {
    const result = await editorBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Mocked edited content");
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => editorBlock.input.parse({ payload: 123 })).toThrow();
  });
});
