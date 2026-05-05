/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AgentBlock } from "../AgentBlock";
import { useCanvasStore } from "../../../state/canvasStore";

describe("AgentBlock Expanded State", () => {
  it("should render configuration forms when in expanded mode", () => {
    const testObject = {
      id: "agent-1",
      type: "agent",
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      status: "idle",
      metadata: {
        label: "Test Agent",
        role: "Researcher",
        instructions: "Find market trends",
      },
    };

    // We pass a 'mode' prop or similar to indicate expanded state
    // Let's assume we use a prop called 'mode'
    render(<AgentBlock object={testObject} mode="fullscreen" />);

    // In expanded mode, we expect to see input fields for role and instructions
    expect(screen.getByLabelText(/Agent Role/i)).toBeDefined();
    expect(screen.getByLabelText(/Instructions/i)).toBeDefined();
  });

  it("should update the store when inputs change", () => {
    const testObject = {
      id: "agent-1",
      type: "agent",
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      status: "idle",
      metadata: { label: "Test Agent" },
    };

    render(<AgentBlock object={testObject} mode="fullscreen" />);

    // Add object to store so updateObject can find it
    useCanvasStore.getState().addObject(testObject);

    const roleInput = screen.getByLabelText(/Agent Role/i) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: "Copywriter" } });

    const state = useCanvasStore.getState().objects["agent-1"] as any;
    expect(state.metadata.role).toBe("Copywriter");
  });
});
