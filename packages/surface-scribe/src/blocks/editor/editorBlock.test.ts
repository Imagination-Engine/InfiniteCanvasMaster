import { describe, it, expect, vi, beforeEach } from "vitest";
import { editorBlock } from "./editorBlock";

vi.mock("ai", () => ({
  generateText: vi.fn(),
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
    const { generateText } = await import("ai");
    (generateText as any).mockResolvedValueOnce({
      text: "Mocked edited content",
    });

    const result = await editorBlock.agent.invoke({ payload: "test" });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Mocked edited content");
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => editorBlock.input.parse({ payload: 123 })).toThrow();
  });
});
