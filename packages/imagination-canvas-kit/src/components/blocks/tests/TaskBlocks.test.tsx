// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AgentBlock } from "../AgentBlock";
import { GoalBlock } from "../GoalBlock";

describe("Task Blocks Adversarial", () => {
  it("AgentBlock should handle missing metadata gracefully", () => {
    const mockObject: any = {
      id: "agent-1",
      status: "thinking",
      width: 300,
      height: 200,
      metadata: {},
    };

    const { getByText } = render(<AgentBlock object={mockObject} />);
    expect(getByText("Agent")).toBeTruthy();
    expect(getByText(/"Idle."/)).toBeTruthy();
  });

  it("GoalBlock should handle missing metadata gracefully", () => {
    const mockObject: any = {
      id: "goal-1",
      status: "running",
      width: 300,
      height: 200,
      metadata: {},
    };

    const { getByText } = render(<GoalBlock object={mockObject} />);
    expect(getByText("Untitled Goal")).toBeTruthy();
    expect(getByText("0%")).toBeTruthy();
  });

  it("GoalBlock should handle progress > 1 gracefully", () => {
    const mockObject: any = {
      id: "goal-1",
      status: "running",
      width: 300,
      height: 200,
      metadata: {
        progress: 1.5,
      },
    };

    const { getByText } = render(<GoalBlock object={mockObject} />);
    expect(getByText("150%")).toBeTruthy();
  });
});
