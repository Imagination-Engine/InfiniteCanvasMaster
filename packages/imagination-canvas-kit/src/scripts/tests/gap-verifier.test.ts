// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { verifyGaps } from "../gap-verifier";
import fs from "fs";

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
  existsSync: vi.fn(),
}));

describe("Gap Verifier", () => {
  it("should pass if a Verified gap has a corresponding test file", () => {
    // Mock that the test file exists
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const gaps = [
      {
        id: "GAP-001",
        title: "Context Menu",
        surface: "Canvas",
        severity: "High",
        status: "Verified",
        owner: "Alice",
        requiredFix: "Add menu",
        acceptanceCriteria: "Menu opens",
        testFile: "src/components/tests/ContextMenu.test.tsx",
      },
    ];

    // Should not throw
    expect(() => verifyGaps(gaps as any)).not.toThrow();
  });

  it("should throw if a Verified gap lacks a test file reference", () => {
    const gaps = [
      {
        id: "GAP-002",
        title: "Missing Test Ref",
        status: "Verified",
        // No testFile property
      },
    ];

    expect(() => verifyGaps(gaps as any)).toThrow(/must specify a testFile/i);
  });

  it("should throw if a Verified gap test file does not exist on disk", () => {
    // Mock that the test file DOES NOT exist
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const gaps = [
      {
        id: "GAP-003",
        title: "Ghost Test File",
        status: "Verified",
        testFile: "src/ghost.test.ts",
      },
    ];

    expect(() => verifyGaps(gaps as any)).toThrow(/Test file not found/i);
  });

  it("should ignore non-Verified gaps", () => {
    const gaps = [
      {
        id: "GAP-004",
        title: "Open Gap",
        status: "Open",
        // No testFile, but it is not verified so it should pass
      },
    ];

    expect(() => verifyGaps(gaps as any)).not.toThrow();
  });
});
