import { describe, it, expect } from "vitest";
import {
  classifyOrchestratorIntent,
  OrchestratorUserIntent,
} from "../orchestratorIntentClassifier";

describe("OrchestratorIntentClassifier", () => {
  it("should classify praise as emotional_expression", () => {
    const inputs = [
      "This canvas is awesome!",
      "I love this tool",
      "great job",
      "wow this is cool",
    ];
    inputs.forEach((input) => {
      expect(classifyOrchestratorIntent(input)).toBe("emotional_expression");
    });
  });

  it("should classify requests to add blocks as create_block", () => {
    const inputs = [
      "Add a note",
      "drop an agent block",
      "create a video studio",
      "I need a writing block",
    ];
    inputs.forEach((input) => {
      expect(classifyOrchestratorIntent(input)).toBe("create_block");
    });
  });

  it("should classify plan requests as plan_request", () => {
    const inputs = [
      "Can you make a plan for this?",
      "generate a blueprint",
      "blueprint this",
      "create plan",
    ];
    inputs.forEach((input) => {
      expect(classifyOrchestratorIntent(input)).toBe("plan_request");
    });
  });

  it("should classify questions as question", () => {
    const inputs = [
      "How do I use this?",
      "What is this block?",
      "Why is the canvas empty?",
    ];
    inputs.forEach((input) => {
      expect(classifyOrchestratorIntent(input)).toBe("question");
    });
  });

  it("should fallback to unknown for ambiguous input", () => {
    expect(classifyOrchestratorIntent("maybe")).toBe("unknown");
  });

  it("should handle mixed/ambiguous inputs correctly based on priority", () => {
    // Should prioritize 'create_block' over 'question' for actionable requests
    expect(classifyOrchestratorIntent("How do I add a note block?")).toBe(
      "create_block",
    );

    // Should prioritize 'emotional_expression' for pure praise
    expect(
      classifyOrchestratorIntent("Wow this is great, how did you do it?"),
    ).toBe("emotional_expression");
  });
});
