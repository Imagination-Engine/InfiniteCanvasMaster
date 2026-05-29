import { describe, it, expect } from "vitest";
import {
  isConnectabilityQuestion,
  resolveOrchestratorReply,
  buildSuggestionChips,
} from "../orchestratorSuggestions";

describe("orchestratorSuggestions", () => {
  it("detects connectability questions", () => {
    expect(isConnectabilityQuestion("What can I connect to this block?")).toBe(
      true,
    );
    expect(isConnectabilityQuestion("hello")).toBe(false);
  });

  it("returns registry-aware answer for writer studio", () => {
    const answer = resolveOrchestratorReply(
      "What can I connect to this block?",
      "iem.studio.writer",
    );
    expect(answer).toMatch(/Writer|connect to/i);
    expect(answer).toMatch(/iem\./);
  });

  it("builds suggestion chips from compatible blocks", () => {
    const chips = buildSuggestionChips("iem.studio.writer");
    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0]).toHaveProperty("id");
    expect(chips[0]).toHaveProperty("label");
  });
});
