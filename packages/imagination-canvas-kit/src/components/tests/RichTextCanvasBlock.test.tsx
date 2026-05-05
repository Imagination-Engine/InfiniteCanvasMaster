// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { RichTextCanvasBlock } from "../RichTextCanvasBlock";
import { useSelectionStore } from "../../state/selectionStore";

describe("RichTextCanvasBlock", () => {
  beforeEach(() => {
    useSelectionStore.setState({ editingId: null, selectedIds: [] });
  });

  const mockBlock = {
    id: "block-1",
    type: "block",
    blockKind: "note",
    x: 10,
    y: 10,
    width: 200,
    height: 100,
    data: { content: "Hello World" },
    status: "idle",
    capabilities: { canEditInline: true },
  };

  it("should render content correctly", () => {
    const { getByText } = render(
      <RichTextCanvasBlock block={mockBlock as any} />,
    );
    expect(getByText("Hello World")).toBeDefined();
  });

  it("should enter editing mode on double click", () => {
    const { container } = render(
      <RichTextCanvasBlock block={mockBlock as any} />,
    );

    // Select it first (usually needed)
    useSelectionStore.getState().setSelection(["block-1"]);

    const element = container.firstChild as HTMLElement;
    fireEvent.doubleClick(element);

    expect(useSelectionStore.getState().editingId).toBe("block-1");
  });

  it("should exit editing mode on ESC", () => {
    useSelectionStore.getState().setEditing("block-1");
    const { container } = render(
      <RichTextCanvasBlock block={mockBlock as any} />,
    );

    const editorEl = container.querySelector(
      ".rich-text-editor",
    ) as HTMLElement;
    fireEvent.keyDown(editorEl || container.firstChild!, { key: "Escape" });

    expect(useSelectionStore.getState().editingId).toBeNull();
  });

  it("should stop pointer event propagation when editing", () => {
    useSelectionStore.getState().setEditing("block-1");

    const mockStopPropagation = vi.fn();
    const { container } = render(
      <RichTextCanvasBlock block={mockBlock as any} />,
    );

    const editorEl = container.querySelector(
      ".rich-text-editor",
    ) as HTMLElement;

    // React testing library fires SyntheticEvents, which wrap native events.
    // If propagation is stopped, our mock should be called.
    const event = new MouseEvent("wheel", { bubbles: true });
    event.stopPropagation = mockStopPropagation;

    (editorEl || container.firstChild!).dispatchEvent(event);

    expect(mockStopPropagation).toHaveBeenCalled();
  });

  describe("adversarial cases", () => {
    it("should not enter edit mode if canEditInline is false", () => {
      const lockedBlock = {
        ...mockBlock,
        capabilities: { canEditInline: false },
      };
      const { container } = render(
        <RichTextCanvasBlock block={lockedBlock as any} />,
      );

      const element = container.firstChild as HTMLElement;
      fireEvent.doubleClick(element);

      expect(useSelectionStore.getState().editingId).toBeNull();
    });

    it("should not exit edit mode on random keys", () => {
      useSelectionStore.getState().setEditing("block-1");
      const { container } = render(
        <RichTextCanvasBlock block={mockBlock as any} />,
      );

      const editorEl = container.querySelector(
        ".rich-text-editor",
      ) as HTMLElement;
      fireEvent.keyDown(editorEl || container.firstChild!, { key: "a" });

      expect(useSelectionStore.getState().editingId).toBe("block-1");
    });
  });
});
