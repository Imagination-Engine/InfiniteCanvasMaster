// @ts-nocheck
import { useEffect } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useToolStore } from "../state/toolStore";
import { useViewportStore } from "../state/viewportStore";
import { getCenterOfViewport, findEmptySpace } from "../utils/placement";

export const useNativeInteractions = () => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const text = e.clipboardData?.getData("text/plain");
      if (!text) return;

      const viewport = useViewportStore.getState();
      const center = getCenterOfViewport(viewport);
      const objects = useCanvasStore.getState().objects;

      const pos = findEmptySpace(
        center.x,
        center.y,
        250,
        150,
        objects as any[],
      );

      const newId = `note-${Date.now()}`;
      useCanvasStore.getState().addObject({
        id: newId,
        type: "block",
        blockKind: "note",
        x: pos.x,
        y: pos.y,
        width: 250,
        height: 150,
        data: { content: text },
        status: "idle",
      } as any);

      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore modifiers and special keys
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
        return;
      }

      const { activeTool } = useToolStore.getState();
      if (activeTool !== "select") return;

      const viewport = useViewportStore.getState();
      const center = getCenterOfViewport(viewport);
      const objects = useCanvasStore.getState().objects;

      const pos = findEmptySpace(
        center.x,
        center.y,
        250,
        150,
        objects as any[],
      );

      const newId = `note-${Date.now()}`;
      useCanvasStore.getState().addObject({
        id: newId,
        type: "block",
        blockKind: "note",
        x: pos.x,
        y: pos.y,
        width: 250,
        height: 150,
        data: { content: e.key },
        status: "idle",
      } as any);
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
