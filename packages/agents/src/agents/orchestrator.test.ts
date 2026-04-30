import { describe, it, expect } from "vitest";
import { orchestrator } from "./orchestrator.js";

describe("Imagination Orchestrator Agent", () => {
  it("should be initialized with correct metadata", () => {
    expect(orchestrator.name).toBe("Imagination Orchestrator");
    expect(orchestrator.id).toBe("orchestrator");
  });

  it("should have model defined", () => {
    expect(orchestrator.model).toBeDefined();
    expect((orchestrator.model as any).provider).toBe("google.generative-ai");
  });
});
