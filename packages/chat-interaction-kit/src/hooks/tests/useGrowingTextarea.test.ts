import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useGrowingTextarea } from "../useGrowingTextarea";

describe("useGrowingTextarea", () => {
  it("updates height based on scrollHeight up to max limit", () => {
    const mockRef = {
      current: {
        style: { height: "0px" },
        scrollHeight: 100,
      },
    } as any;

    renderHook(() => useGrowingTextarea(mockRef, "test input"));

    // Height should be dynamically set to the scrollHeight
    expect(mockRef.current.style.height).toBe("100px");
  });

  it("caps height at the maximum specified limit", () => {
    const mockRef = {
      current: {
        style: { height: "0px", overflowY: "hidden" },
        scrollHeight: 300, // greater than default max 200
      },
    } as any;

    renderHook(() => useGrowingTextarea(mockRef, "very long input", 200));

    // Height should be capped
    expect(mockRef.current.style.height).toBe("200px");
    // Overflow should be auto because it exceeded max height
    expect(mockRef.current.style.overflowY).toBe("auto");
  });
});
