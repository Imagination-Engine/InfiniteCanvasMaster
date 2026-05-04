// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { AgentStatusIndicator } from "../AgentStatusIndicator";

describe("AgentStatusIndicator", () => {
  it('should map "thinking" status to the correct semantic CSS class or style', () => {
    const { container } = render(<AgentStatusIndicator status="thinking" />);
    const indicator = container.firstChild as HTMLElement;

    // We expect it to use the semantic CSS variable defined in Phase 1
    expect(indicator.style.backgroundColor).toBe("var(--color-agent-thinking)");
  });

  it('should map "generating" status to the correct semantic CSS class or style', () => {
    const { container } = render(<AgentStatusIndicator status="generating" />);
    const indicator = container.firstChild as HTMLElement;

    expect(indicator.style.backgroundColor).toBe(
      "var(--color-agent-generating)",
    );
  });

  it('should map "waiting" status to the correct semantic CSS class or style', () => {
    const { container } = render(<AgentStatusIndicator status="waiting" />);
    const indicator = container.firstChild as HTMLElement;

    expect(indicator.style.backgroundColor).toBe("var(--color-agent-waiting)");
  });

  it("should default to a neutral style for unknown statuses", () => {
    const { container } = render(
      <AgentStatusIndicator status="unknown_status" />,
    );
    const indicator = container.firstChild as HTMLElement;

    expect(indicator.style.backgroundColor).toBe("gray");
  });
});
