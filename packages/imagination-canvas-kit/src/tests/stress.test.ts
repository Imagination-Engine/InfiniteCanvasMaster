/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { useCanvasStore } from "../state/canvasStore";
import { renderHook, act } from "@testing-library/react";

describe("Performance Stress Test", () => {
  it("handles 5,000 objects in the store without crashing", () => {
    const { result } = renderHook(() => useCanvasStore());

    act(() => {
      for (let i = 0; i < 5000; i++) {
        result.current.addObject({
          id: `stress-${i}`,
          type: "shape",
          x: Math.random() * 10000,
          y: Math.random() * 10000,
          width: 100,
          height: 100,
          zIndex: 0,
          metadata: {},
        });
      }
    });

    expect(Object.keys(result.current.objects).length).toBe(5000);
  });

  it("updates a single object quickly among 5,000 others", () => {
    const { result } = renderHook(() => useCanvasStore());

    const startTime = performance.now();
    act(() => {
      result.current.updateObject("stress-0", { x: 999 });
    });
    const endTime = performance.now();

    expect(result.current.objects["stress-0"].x).toBe(999);
    expect(endTime - startTime).toBeLessThan(100); // Should be very fast (< 100ms)
  });
});
