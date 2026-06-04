/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.hoisted(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });
});

import { AgentBlock } from "../AgentBlock";
import { useCanvasStore } from "../../../state/canvasStore";

describe("AgentBlock Expanded State", () => {
  beforeEach(() => {
    localStorage.clear();
    useCanvasStore.setState({
      objects: {},
      connections: [],
      bindings: [],
      _hasHydrated: true,
    });
  });
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

    expect(screen.getByLabelText(/Custom Role Name/i)).toBeDefined();
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

    useCanvasStore.getState().addObject(testObject as any);
    render(<AgentBlock object={testObject as any} mode="fullscreen" />);

    const roleInput = screen.getByLabelText(
      /Custom Role Name/i,
    ) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: "Copywriter" } });

    const state = useCanvasStore.getState().objects["agent-1"] as any;
    expect(state.metadata.role).toBe("Copywriter");
  });
});
