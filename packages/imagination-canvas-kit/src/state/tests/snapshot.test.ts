// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../historyStore";
import { useCanvasStore } from "../canvasStore";

describe("Canvas Snapshots & Recovery", () => {
  beforeEach(() => {
    // We will expand historyStore to support snapshots
    useHistoryStore.setState({ past: [], future: [], snapshots: {} } as any);
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });
  });

  it("should create a snapshot of the current canvas state", () => {
    const { createSnapshot } = useHistoryStore.getState() as any;
    const { addObject } = useCanvasStore.getState();

    addObject({
      id: "obj-1",
      type: "shape",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    } as any);

    const snapshotId = createSnapshot("pre-ai-generation");

    const { snapshots } = useHistoryStore.getState() as any;
    expect(snapshots[snapshotId]).toBeDefined();
    expect(snapshots[snapshotId].name).toBe("pre-ai-generation");
    expect(snapshots[snapshotId].state.objects).toHaveLength(1);
    expect(snapshots[snapshotId].state.objects[0].id).toBe("obj-1");
  });

  it("should restore the canvas state from a snapshot", () => {
    const { createSnapshot, restoreSnapshot } =
      useHistoryStore.getState() as any;
    const { addObject } = useCanvasStore.getState();

    addObject({
      id: "obj-1",
      type: "shape",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    } as any);

    const snapshotId = createSnapshot("pre-ai-generation");

    // Simulate destructive AI action
    useCanvasStore.setState({ objects: [], connections: [], bindings: [] });

    // Restore
    restoreSnapshot(snapshotId);

    const canvasState = useCanvasStore.getState();
    expect(canvasState.objects).toHaveLength(1);
    expect(canvasState.objects[0].id).toBe("obj-1");
  });

  describe("adversarial cases", () => {
    it("should throw when restoring a non-existent snapshot", () => {
      const { restoreSnapshot } = useHistoryStore.getState() as any;

      expect(() => {
        restoreSnapshot("ghost-snapshot");
      }).toThrow("Snapshot not found");
    });
  });
});
