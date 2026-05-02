/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useViewportGestures } from "../useViewportGestures";
import { useViewportStore } from "../../state/viewportStore";

// Mock the store
vi.mock("../../state/viewportStore", () => ({
  useViewportStore: vi.fn(),
}));

describe("useViewportGestures", () => {
  const mockPan = vi.fn();
  const mockZoomTo = vi.fn();
  const mockSetCamera = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useViewportStore as any).mockReturnValue({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",
      pan: mockPan,
      zoomTo: mockZoomTo,
      setCamera: mockSetCamera,
    });
  });

  it("should handle wheel event for zooming", () => {
    const { result } = renderHook(() =>
      useViewportGestures({ current: null } as any),
    );

    // Simulate wheel event
    const wheelEvent = {
      deltaY: -100, // Zoom in
      clientX: 500,
      clientY: 500,
      ctrlKey: true,
      preventDefault: vi.fn(),
    };

    result.current.onWheel(wheelEvent as any);

    expect(mockSetCamera).toHaveBeenCalled();
  });

  it("should handle wheel event for panning", () => {
    const { result } = renderHook(() =>
      useViewportGestures({ current: null } as any),
    );

    const wheelEvent = {
      deltaX: 10,
      deltaY: 20,
      ctrlKey: false,
      preventDefault: vi.fn(),
    };

    result.current.onWheel(wheelEvent as any);

    expect(mockPan).toHaveBeenCalledWith(10, 20);
  });
});
