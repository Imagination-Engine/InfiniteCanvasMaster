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
      zIndex: 1,
      status: "idle",
      metadata: {
        label: "Test Agent",
        role: "Researcher",
        instructions: "Find market trends",
      },
      capabilities: [],
      blockKind: "agent",
    };

    render(<AgentBlock object={testObject as any} mode="fullscreen" />);

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
      zIndex: 1,
      status: "idle",
      metadata: { label: "Test Agent" },
      capabilities: [],
      blockKind: "agent",
    };

    render(<AgentBlock object={testObject as any} mode="fullscreen" />);
    useCanvasStore.getState().addObject(testObject as any);

    const roleInput = screen.getByLabelText(/Agent Role/i) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: "Copywriter" } });

    const state = useCanvasStore.getState().objects["agent-1"] as any;
    expect(state.metadata.role).toBe("Copywriter");
  });
});
