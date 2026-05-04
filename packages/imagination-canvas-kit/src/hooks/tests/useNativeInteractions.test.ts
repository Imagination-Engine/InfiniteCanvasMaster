// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNativeInteractions } from "../useNativeInteractions";
import { useToolStore } from "../../state/toolStore";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook } from "@testing-library/react";

describe("useNativeInteractions", () => {
  beforeEach(() => {
    useToolStore.setState({ activeTool: "select", creationPayload: null });
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
  });

  it("should handle pasting text and create a note block", () => {
    // We will simulate a paste event
    // The hook should intercept it, read text, and add an object to canvasStore
    const { unmount } = renderHook(() => useNativeInteractions());

    const pasteEvent = new Event("paste") as any;
    pasteEvent.clipboardData = {
      getData: (format: string) =>
        format === "text/plain" ? "Hello World" : "",
      types: ["text/plain"],
    };

    // Need to trigger the effect. In a real DOM, we'd fireEvent on window.
    // For unit testing the hook, we can export the handler or test via window.dispatchEvent
    window.dispatchEvent(pasteEvent);

    const objects = useCanvasStore.getState().objects;
    expect(objects.length).toBe(1);
    expect(objects[0].type).toBe("block");
    expect((objects[0] as any).blockKind).toBe("note");
    expect((objects[0] as any).data.content).toBe("Hello World");
    unmount();
  });

  it("should handle type-to-create on empty canvas", () => {
    renderHook(() => useNativeInteractions());

    const keyEvent = new KeyboardEvent("keydown", { key: "H", bubbles: true });

    // Simulate typing when active tool is select and no active inputs
    window.dispatchEvent(keyEvent);

    const state = useToolStore.getState();
    // It should ideally switch to note creation mode or directly inject a note
    // Let's assume it injects a note at the center of the viewport
    const objects = useCanvasStore.getState().objects;
    expect(objects.length).toBe(1);
    expect((objects[0] as any).blockKind).toBe("note");
    expect((objects[0] as any).data.content).toBe("H");
  });

  describe("adversarial cases", () => {
    it("should ignore typing if target is an input", () => {
      const { unmount } = renderHook(() => useNativeInteractions());

      const input = document.createElement("input");
      document.body.appendChild(input);

      const keyEvent = new KeyboardEvent("keydown", {
        key: "a",
        bubbles: true,
      });
      input.dispatchEvent(keyEvent);

      const objects = useCanvasStore.getState().objects;
      expect(objects.length).toBe(0);

      document.body.removeChild(input);
      unmount();
    });

    it("should ignore modifier keys", () => {
      const { unmount } = renderHook(() => useNativeInteractions());

      const keyEvent = new KeyboardEvent("keydown", {
        key: "c",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(keyEvent);

      const objects = useCanvasStore.getState().objects;
      expect(objects.length).toBe(0);

      unmount();
    });
  });
});
