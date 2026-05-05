// @ts-nocheck
import { describe, it, expect } from "vitest";
import { parseGapList } from "../gap-tracker";

describe("Gap Tracker Parser", () => {
  it("should parse a valid gap entry", () => {
    const markdown = `
### GAP-001: Missing Context Menu
- **Surface:** Canvas
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Implement a right-click context menu.
- **Acceptance Criteria:** Right-clicking a block opens a menu.
`;
    const gaps = parseGapList(markdown);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].id).toBe("GAP-001");
    expect(gaps[0].title).toBe("Missing Context Menu");
    expect(gaps[0].surface).toBe("Canvas");
    expect(gaps[0].severity).toBe("High");
    expect(gaps[0].status).toBe("Open");
  });

  it("should throw or return errors for missing fields", () => {
    const markdown = `
### GAP-002: Invalid Gap
- **Surface:** Canvas
- **Status:** Open
`;
    // Severity and others are missing
    expect(() => parseGapList(markdown)).toThrow(/Missing required fields/i);
  });
});
