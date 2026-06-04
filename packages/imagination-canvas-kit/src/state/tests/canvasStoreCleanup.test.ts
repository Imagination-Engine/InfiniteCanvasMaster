// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useCanvasStore } from "../canvasStore";
import { useConnectionStore } from "../connectionStore";
import { sanitizeCanvasData } from "../../utils/spatialDocumentBridge";

describe("Canvas Node Deletion Cleanup", () => {
  beforeEach(() => {
    useCanvasStore.setState({ objects: {}, connections: [], bindings: [] });
    useConnectionStore.setState({ connections: {}, draftConnection: null });
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("should remove associated connections from connectionStore when a node is removed", () => {
    const { addObject, removeObject } = useCanvasStore.getState();
    const { addConnection } = useConnectionStore.getState();

    // 1. Add two nodes with valid UUID format
    const nodeAId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const nodeBId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12";
    const connId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13";

    const nodeA = {
      id: nodeAId,
      type: "block" as const,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      metadata: {},
    };
    const nodeB = {
      id: nodeBId,
      type: "block" as const,
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      metadata: {},
    };
    addObject(nodeA);
    addObject(nodeB);

    // 2. Add connection in connectionStore
    addConnection({
      id: connId,
      fromId: nodeAId,
      toId: nodeBId,
    });

    expect(Object.keys(useConnectionStore.getState().connections)).toContain(
      connId,
    );

    // 3. Remove nodeA
    removeObject(nodeAId);

    // 4. Assert nodeA is deleted and connection conn-ab is deleted
    expect(useCanvasStore.getState().objects[nodeAId]).toBeUndefined();
    expect(useConnectionStore.getState().connections[connId]).toBeUndefined();
  });

  it("should filter out orphaned connections in sanitizeCanvasData", () => {
    // Use valid UUIDs so they don't get re-mapped in step 1
    const nodeAId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const nodeBId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12"; // not in objects
    const connAbId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13";
    const connValidId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14";

    const objects = {
      [nodeAId]: {
        id: nodeAId,
        type: "block" as const,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        metadata: {},
      },
      // Note: nodeBId does not exist (is deleted/orphaned)
    };

    const connections = {
      [connAbId]: {
        id: connAbId,
        fromId: nodeAId,
        toId: nodeBId, // Target node is missing/orphaned
      },
      [connValidId]: {
        id: connValidId,
        fromId: nodeAId,
        toId: nodeAId, // Valid (uses existing nodeAId)
      },
    };

    const sanitized = sanitizeCanvasData(objects, connections);

    expect(sanitized.connections[connAbId]).toBeUndefined();
    expect(sanitized.connections[connValidId]).toBeDefined();
    expect(sanitized.changed).toBe(true);
  });
});
