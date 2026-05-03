/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAgentInsertion } from "../useAgentInsertion";
import { useCanvasStore } from "../../state/canvasStore";
import { renderHook } from "@testing-library/react";

describe("useAgentInsertion", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
  });

  it("should insert a batch of objects safely", () => {
    const { result } = renderHook(() => useAgentInsertion());
    const { insertBatch } = result.current;

    const payload = [
      { type: "note", data: { content: "Agent Note 1" } },
      { type: "note", data: { content: "Agent Note 2" } },
    ];

    insertBatch(payload, {
      source: "agent",
      agentId: "agent-123",
      model: "gemini",
      timestamp: "2026-05-01",
    });

    const objects = useCanvasStore.getState().objects;
    expect(objects.length).toBe(2);
    expect(objects[0].provenance?.source).toBe("agent");
    expect(objects[0].provenance?.agentId).toBe("agent-123");

    // They shouldn't be at the exact same coordinates due to findEmptySpace
    expect(objects[0].x === objects[1].x && objects[0].y === objects[1].y).toBe(
      false,
    );
  });

  describe("adversarial cases", () => {
    it("should handle an empty batch gracefully", () => {
      const { result, unmount } = renderHook(() => useAgentInsertion());
      const { insertBatch } = result.current;

      insertBatch([], {
        source: "agent",
        agentId: "agent-123",
        model: "gemini",
        timestamp: "2026-05-01",
      });

      const objects = useCanvasStore.getState().objects;
      expect(objects.length).toBe(0);

      unmount();
    });

    it("should handle a large batch insertion without crashing", () => {
      const { result, unmount } = renderHook(() => useAgentInsertion());
      const { insertBatch } = result.current;

      const payload = Array.from({ length: 50 }).map((_, i) => ({
        type: "note",
        data: { content: `Note ${i}` },
      }));

      insertBatch(payload, {
        source: "agent",
        agentId: "agent-bulk",
        model: "gemini",
        timestamp: "2026-05-01",
      });

      const objects = useCanvasStore.getState().objects;
      expect(objects.length).toBe(50);

      unmount();
    });
  });
});
