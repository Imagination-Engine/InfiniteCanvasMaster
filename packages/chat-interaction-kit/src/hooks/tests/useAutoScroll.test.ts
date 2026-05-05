import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAutoScroll } from "../useAutoScroll";

describe("useAutoScroll", () => {
  it("initializes with auto-scroll enabled", () => {
    const { result } = renderHook(() => useAutoScroll());
    expect(result.current.isAutoScrollEnabled).toBe(true);
  });

  it("allows manual locking and unlocking of auto-scroll", () => {
    const { result } = renderHook(() => useAutoScroll());

    act(() => {
      result.current.setAutoScrollEnabled(false);
    });
    expect(result.current.isAutoScrollEnabled).toBe(false);

    act(() => {
      result.current.setAutoScrollEnabled(true);
    });
    expect(result.current.isAutoScrollEnabled).toBe(true);
  });

  it("scrolls to bottom when enabled and new messages arrive", () => {
    const mockScrollIntoView = vi.fn();
    const mockRef = { current: { scrollIntoView: mockScrollIntoView } } as any;

    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScroll(mockRef, [messages]),
      {
        initialProps: { messages: [] },
      },
    );

    rerender({ messages: [{ id: "1" }] } as any);

    // Should have called scrollIntoView because auto-scroll is enabled by default
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "end",
    });
  });

  it("does not scroll to bottom when locked by the user", () => {
    const mockScrollIntoView = vi.fn();
    const mockRef = { current: { scrollIntoView: mockScrollIntoView } } as any;

    const { result, rerender } = renderHook(
      ({ messages }) => useAutoScroll(mockRef, [messages]),
      {
        initialProps: { messages: [] },
      },
    );

    // Clear initial mount call
    mockScrollIntoView.mockClear();

    act(() => {
      result.current.setAutoScrollEnabled(false);
    });

    rerender({ messages: [{ id: "1" }] } as any);

    // Should NOT have called scrollIntoView because the user scrolled up (locked)
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
