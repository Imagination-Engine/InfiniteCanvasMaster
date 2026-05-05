import { describe, it, expect } from "vitest";
import { extractAgentTraits } from "../orchestratorTraitExtractor";

describe("orchestratorTraitExtractor", () => {
  it("should extract basic agent traits from natural language", () => {
    const input = "I need a copywriter agent that writes high-converting ads";
    const traits = extractAgentTraits(input);

    expect(traits.role).toBe("copywriter");
    expect(traits.description).toContain("writes high-converting ads");
  });

  it("should handle 'create a [role] agent' pattern", () => {
    const input = "create a researcher agent to find market trends";
    const traits = extractAgentTraits(input);

    expect(traits.role).toBe("researcher");
    expect(traits.description).toContain("find market trends");
  });

  it("should return null role if none identified", () => {
    const input = "add an agent";
    const traits = extractAgentTraits(input);

    expect(traits.role).toBeNull();
  });
});
