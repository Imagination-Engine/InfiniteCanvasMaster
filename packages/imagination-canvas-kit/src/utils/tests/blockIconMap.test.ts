/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { resolveBlockIcon } from "../blockIconMap";
import { Bot, Search, Hammer, Code2, Box, Microscope } from "lucide-react";

describe("BlockIconMap Utility", () => {
  it("should resolve icon by exact block id", () => {
    // iem.agent.agent has icon "Bot" in registry
    const icon = resolveBlockIcon("iem.agent.agent");
    expect(icon).toBe(Bot);
  });

  it("should resolve icon by block type (short id)", () => {
    // "agent" should resolve to Bot
    const icon = resolveBlockIcon("agent");
    expect(icon).toBe(Bot);
  });

  it("should resolve icon by category if id not found", () => {
    // Category "Agents & Swarms" should fallback to Bot
    const icon = resolveBlockIcon("non.existent.agent", "Agents & Swarms");
    expect(icon).toBe(Bot);
  });

  it("should resolve icon by studio if id and category not found", () => {
    // Studio "Research Studio" should fallback to Search
    const icon = resolveBlockIcon(
      "unknown.id",
      "unknown.cat",
      "Research Studio",
    );
    expect(icon).toBe(Search);
  });

  it("should resolve icon by registry definition in Studios category", () => {
    // iem.studio.research has "Microscope" in registry
    const researchStudioIcon = resolveBlockIcon(
      "iem.studio.research",
      "Studios",
      "Research Studio",
    );
    expect(researchStudioIcon).toBe(Microscope);
  });

  it("should fallback to Box for completely unknown blocks", () => {
    const icon = resolveBlockIcon(
      "alien.technology",
      "Outer Space",
      "Deep Void",
    );
    expect(icon).toBe(Box);
  });
});
