import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design Token Map", () => {
  it("should define spatial and cinematic tokens in index.css", () => {
    const cssPath = path.resolve(__dirname, "../index.css");
    const cssContent = fs.readFileSync(cssPath, "utf8");

    // Radius tokens
    expect(cssContent).toContain("--radius-soft: 12px;");
    expect(cssContent).toContain("--radius-pill: 9999px;");

    // Elevation tokens
    expect(cssContent).toContain("--shadow-spatial:");
    expect(cssContent).toContain("--shadow-floating:");

    // Motion tokens (easings)
    expect(cssContent).toContain("--ease-cinematic:");
    expect(cssContent).toContain("--ease-spatial:");

    // Semantic Agent tokens
    expect(cssContent).toContain("--color-agent-thinking:");
    expect(cssContent).toContain("--color-agent-generating:");
    expect(cssContent).toContain("--color-agent-waiting:");
  });
});
