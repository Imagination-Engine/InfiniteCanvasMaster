/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { BlockRegistry } from "../../index";

describe("Agent Template Registration (Consolidated)", () => {
  it("should resolve the unified agent template from the registry", () => {
    const component = BlockRegistry.resolve("iem.agent.agent");
    expect(component).toBeDefined();
  });

  it("should return undefined for a non-existent block kind", () => {
    const component = BlockRegistry.resolve("iem.agent.nonexistent");
    expect(component).toBeUndefined();
  });
});
