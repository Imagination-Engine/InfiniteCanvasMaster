// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useToolStore } from "../toolStore";

describe("Tool Store", () => {
  beforeEach(() => {
    useToolStore.setState({
      activeTool: "select",
      creationPayload: null,
    });
  });

  it("should initialize with select tool", () => {
    const state = useToolStore.getState();
    expect(state.activeTool).toBe("select");
  });

  it("should switch to hand tool", () => {
    const { setTool } = useToolStore.getState();
    setTool("hand");

    const state = useToolStore.getState();
    expect(state.activeTool).toBe("hand");
  });

  it("should switch to creation mode with a payload", () => {
    const { setCreationMode } = useToolStore.getState();
    const payload = { type: "note", data: {} };
    setCreationMode("note", payload);

    const state = useToolStore.getState();
    expect(state.activeTool).toBe("note");
    expect(state.creationPayload).toEqual(payload);
  });

  it("should clear creation payload when switching back to select", () => {
    const { setCreationMode, setTool } = useToolStore.getState();
    setCreationMode("shape", { shapeType: "rectangle" });
    setTool("select");

    const state = useToolStore.getState();
    expect(state.activeTool).toBe("select");
    expect(state.creationPayload).toBeNull();
  });

  describe("adversarial cases", () => {
    it("should handle rapid tool switching safely", () => {
      const { setTool, setCreationMode } = useToolStore.getState();

      setTool("hand");
      setCreationMode("shape", { type: "circle" });
      setTool("select");
      setTool("note");

      const state = useToolStore.getState();
      expect(state.activeTool).toBe("note");
      expect(state.creationPayload).toBeNull();
    });

    it("should handle undefined payloads in creation mode without crashing", () => {
      const { setCreationMode } = useToolStore.getState();

      setCreationMode("shape", undefined);

      const state = useToolStore.getState();
      expect(state.activeTool).toBe("shape");
      expect(state.creationPayload).toBeUndefined();
    });
  });
});
