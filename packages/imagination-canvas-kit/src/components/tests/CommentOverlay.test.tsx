/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { CommentOverlay } from "../CommentOverlay";
import { useCanvasStore } from "../../state/canvasStore";

describe("CommentOverlay", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });

    // Add a block to comment on
    useCanvasStore.getState().addObject({
      id: "block-1",
      type: "block",
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      status: "idle",
    } as any);

    // Add a comment object (using the generic object store but typed appropriately)
    useCanvasStore.getState().addObject({
      id: "comment-1",
      type: "comment",
      x: 100,
      y: 80,
      width: 150,
      height: 50,
      status: "idle",
      data: { text: "This is a test comment", author: "Alice" },
    } as any);

    // Bind the comment to the block
    useCanvasStore.getState().addBinding({
      id: "bind-1",
      sourceId: "comment-1",
      targetId: "block-1",
      type: "anchor",
    } as any);
  });

  it("should render comments bound to the canvas objects", () => {
    const { getByText } = render(<CommentOverlay />);
    expect(getByText("This is a test comment")).toBeDefined();
    expect(getByText("Alice")).toBeDefined();
  });

  it("should visually follow the object when the parent moves", () => {
    const { container } = render(<CommentOverlay />);

    const commentEl = container.querySelector(".canvas-comment") as HTMLElement;
    expect(commentEl).toBeDefined();
    // Assuming the overlay absolutely positions them based on store coordinates
    expect(commentEl.style.transform).toContain("translate(100px, 80px)");

    act(() => {
      // Move the parent block
      useCanvasStore.getState().moveObjects(["block-1"], 50, 50);

      // Our custom moveObjects logic in the canvasStore or a hook should ALSO move the bound comments.
      // If it doesn't currently, the test will fail here, signaling we need to update `moveObjects`.
    });

    const movedComment = useCanvasStore
      .getState()
      .objects.find((o) => o.id === "comment-1");
    expect(movedComment?.x).toBe(150);
    expect(movedComment?.y).toBe(130);

    // Check visual update
    expect(commentEl.style.transform).toContain("translate(150px, 130px)");
  });
});
