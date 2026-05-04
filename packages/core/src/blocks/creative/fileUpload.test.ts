// @ts-nocheck
import { describe, it, expect } from "vitest";
import { fileUploadBlock } from "./fileUpload";

describe("fileUploadBlock", () => {
  it("has the correct definition", () => {
    expect(fileUploadBlock.id).toBe("iem.core.fileUpload");
    expect(fileUploadBlock.name).toBe("File Upload");
  });

  it("validates the input schema", () => {
    const valid = fileUploadBlock.input.safeParse({
      fileName: "test.png",
      mimeType: "image/png",
    });
    expect(valid.success).toBe(true);

    const invalid = fileUploadBlock.input.safeParse({ fileName: 123 }); // Invalid type
    expect(invalid.success).toBe(false);
  });

  it("validates the output schema", () => {
    const valid = fileUploadBlock.output.safeParse({
      success: true,
      fileUrl: "https://cdn.example.com/test.png",
    });
    expect(valid.success).toBe(true);
  });

  it("handles execution correctly (adversarial: missing file context)", async () => {
    const result = await fileUploadBlock.agent.invoke({
      fileName: "missing.txt",
      mimeType: "text/plain",
    });
    // Without an actual file buffer, the tool should mock or handle the upload logic gracefully
    expect(result.success).toBe(true);
    expect(result.fileUrl).toBeDefined();
  });
});
