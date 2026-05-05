// @ts-nocheck
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseGapList } from "../gap-tracker";

describe("Gap List Document Parser", () => {
  it("should successfully parse the full gap list document", () => {
    // Assuming the document is at the root docs folder
    const docPath = path.resolve(
      process.cwd(),
      "../../docs/imagination-canvas-extraction/15-gap-list.md",
    );
    if (!fs.existsSync(docPath)) {
      console.warn(
        "Skipping test because 15-gap-list.md is not found at expected location",
      );
      return;
    }
    const markdown = fs.readFileSync(docPath, "utf-8");

    // This will throw if any gap is malformed
    const gaps = parseGapList(markdown);

    // We expect a significant number of gaps based on A-L categories
    expect(gaps.length).toBeGreaterThan(0);
  });
});
