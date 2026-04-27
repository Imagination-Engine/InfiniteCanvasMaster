/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOpenClawOutputConversion } from "../hooks/useOpenClawOutputConversion";
import { useCanvasStore } from "../state/canvasStore";

vi.mock("../state/canvasStore");

describe("useOpenClawOutputConversion", () => {
  it("should convert an OpenClawOutput into a new CanvasObject and add it to the store", async () => {
    const mockAddObject = vi.fn();

    (useCanvasStore as any).mockImplementation((selector: any) => {
      if (
        selector.name.includes("addObject") ||
        selector.toString().includes("addObject")
      ) {
        return mockAddObject;
      }
      // Return the source block state
      return {
        id: "source-block",
        x: 100,
        y: 200,
        width: 300,
        height: 300,
      };
    });

    const { result } = renderHook(() =>
      useOpenClawOutputConversion("source-block"),
    );

    await act(async () => {
      await result.current.convertToCanvasBlock({
        outputId: "out-1",
        kind: "summary",
        title: "Test Summary",
        summary: "This is a test summary output",
        createdAt: "2026-01-01T00:00:00Z",
      });
    });

    expect(mockAddObject).toHaveBeenCalledTimes(1);

    const newObjectArgs = mockAddObject.mock.calls[0][0];

    // Check type mapping
    expect(newObjectArgs.type).toBe("note");
    expect(newObjectArgs.kind).toBe("note");

    // Check spatial placement (x + width + offset)
    expect(newObjectArgs.x).toBe(100 + 300 + 40);
    expect(newObjectArgs.y).toBe(200);

    // Check provenance payload
    expect(newObjectArgs.metadata.provenance).toMatchObject({
      sourceBlockId: "source-block",
      outputId: "out-1",
    });
  });

  it("should map artifact kinds correctly", async () => {
    const mockAddObject = vi.fn();
    (useCanvasStore as any).mockImplementation((selector: any) => {
      if (
        selector.name.includes("addObject") ||
        selector.toString().includes("addObject")
      )
        return mockAddObject;
      return { x: 0, y: 0, width: 100, height: 100 };
    });

    const { result } = renderHook(() =>
      useOpenClawOutputConversion("source-block"),
    );

    await act(async () => {
      await result.current.convertToCanvasBlock({
        outputId: "out-2",
        kind: "artifact",
        title: "Generated Image",
        createdAt: "2026-01-01T00:00:00Z",
      });
    });

    const newObjectArgs = mockAddObject.mock.calls[0][0];
    expect(newObjectArgs.type).toBe("artifact");
  });
});
