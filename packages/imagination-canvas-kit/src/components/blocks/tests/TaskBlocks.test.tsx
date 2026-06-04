// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
import { GoalBlock } from "../GoalBlock";
import { useCanvasStore } from "../../../state/canvasStore";

describe("Task Blocks Adversarial", () => {
  beforeEach(() => {
    localStorage.clear();
    useCanvasStore.setState({
      objects: {},
      connections: [],
      bindings: [],
      _hasHydrated: true,
    });
  });

  it("AgentBlock should handle missing metadata gracefully", () => {
    const mockObject: any = {
      id: "agent-1",
      status: "thinking",
      width: 300,
      height: 200,
      metadata: {},
    };

    const { container } = render(<AgentBlock object={mockObject} />);
    expect(container.firstChild).toBeTruthy();
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
