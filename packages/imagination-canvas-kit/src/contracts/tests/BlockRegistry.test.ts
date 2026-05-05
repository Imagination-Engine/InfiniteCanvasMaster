// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { BlockRegistry } from "../BlockRegistry";
import React from "react";

describe("BlockRegistry Adversarial", () => {
  it("should handle null or undefined kinds gracefully", () => {
    // @ts-ignore
    expect(BlockRegistry.resolve(null)).toBeUndefined();
    // @ts-ignore
    expect(BlockRegistry.resolve(undefined)).toBeUndefined();
  });

  it("should handle registration with empty strings", () => {
    const MockComponent: React.FC<any> = () => null;
    BlockRegistry.register("", MockComponent);
    expect(BlockRegistry.resolve("")).toBe(MockComponent);
  });

  it("should handle very long kind strings", () => {
    const longKind = "a".repeat(1000);
    const MockComponent: React.FC<any> = () => null;
    BlockRegistry.register(longKind, MockComponent);
    expect(BlockRegistry.resolve(longKind)).toBe(MockComponent);
  });
});
