/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { BlockRegistry } from "../../index";

describe("Blank Agent Template Registration", () => {
  it("should resolve the blank agent template from the registry", () => {
    // This should fail initially in the RED phase as we haven't registered it yet
    const component = BlockRegistry.resolve("iem.agent.blank");
    expect(component).toBeDefined();
  });

  it("should return undefined for a non-existent block kind", () => {
    const component = BlockRegistry.resolve("iem.agent.nonexistent");
    expect(component).toBeUndefined();
  });
});
