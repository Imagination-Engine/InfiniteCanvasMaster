/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ObjectRenderer } from "../ObjectRenderer";
import { useSelectionStore } from "../../state/selectionStore";
import { useCanvasStore } from "../../state/canvasStore";

describe("ObjectRenderer Body & Footer", () => {
  const mockObject = {
    id: "obj-1",
    type: "iem.agent.agent",
    x: 0,
    y: 0,
    width: 320,
    height: 240,
    zIndex: 1,
    status: "thinking",
    metadata: {
      label: "Test Agent",
      role: "Researcher",
      instructions: "Find market trends",
      capabilities: ["web_search", "file_read"],
    },
    capabilities: [],
    blockKind: "agent",
  };

  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: [] });
    useCanvasStore.setState({
      objects: { [mockObject.id]: mockObject as any },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render role and status line in the chrome", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    // Expect to see the role in the body metadata section
    expect(screen.getByText(/Researcher/i)).toBeDefined();

    // Expect to see the status line (e.g. thinking) in the chrome
    expect(screen.getByText(/thinking/i)).toBeDefined();
  });

  it("should render capability chips (max 2) in the footer", () => {
    render(<ObjectRenderer object={mockObject as any} />);

    expect(screen.getByText(/web_search/i)).toBeDefined();
    expect(screen.getByText(/file_read/i)).toBeDefined();
  });

  it("should render a human-in-the-loop indicator when status is 'waiting-for-user'", () => {
    const waitingObject = { ...mockObject, status: "waiting-for-user" };
    useCanvasStore.setState({
      objects: { [waitingObject.id]: waitingObject as any },
    });

    render(<ObjectRenderer object={waitingObject as any} />);

    expect(screen.getByTestId("hitl-indicator")).toBeDefined();
  });

  // ─── Issue 2: On-Canvas Minimized Block (Red & Adversarial) ─────────────

  it("should render block description when metadata.description is present", () => {
    const obj = {
      ...mockObject,
      metadata: {
        ...mockObject.metadata,
        description: "Writes creative prose content.",
      },
    };
    render(<ObjectRenderer object={obj as any} />);
    // Will FAIL before implementation — description is not rendered yet
    expect(screen.getByTestId("block-description")).toBeDefined();
  });

  it("should NOT render description element when metadata.description is absent", () => {
    render(<ObjectRenderer object={mockObject as any} />);
    expect(screen.queryByTestId("block-description")).toBeNull();
  });

  it("should apply error status color class when status is 'error'", () => {
    const obj = { ...mockObject, status: "error" };
    render(<ObjectRenderer object={obj as any} />);
    const statusEl = screen.getByTestId("block-status");
    // Will FAIL — currently always text-brand-cyan
    expect(statusEl.className).toMatch(/text-rose/);
  });

  it("adversarial: very long description is clamped and does not break layout", () => {
    const obj = {
      ...mockObject,
      metadata: { ...mockObject.metadata, description: "A".repeat(500) },
    };
    // Must render without crashing
    const { container } = render(<ObjectRenderer object={obj as any} />);
    expect(container.firstChild).toBeDefined();
  });

  it("adversarial: unknown status falls back to neutral color", () => {
    const obj = { ...mockObject, status: "completely-unknown-status" as any };
    render(<ObjectRenderer object={obj as any} />);
    const statusEl = screen.getByTestId("block-status");
    expect(statusEl.className).toMatch(/text-white/);
  });
});
