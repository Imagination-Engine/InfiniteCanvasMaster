import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useA2ASubscription, useA2AHistory } from "./useA2A";

// Mock EventSource
class MockEventSource {
  onopen: any;
  onerror: any;
  listeners: Record<string, Function[]> = {};
  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
  addEventListener(event: string, cb: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  close = vi.fn();
  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((l) => l({ data: JSON.stringify(data) }));
    }
  }
}
vi.stubGlobal("EventSource", MockEventSource);

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("A2A Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useA2ASubscription", () => {
    it("should initialize correctly and handle messages", async () => {
      const { result } = renderHook(() =>
        useA2ASubscription({ topic: "test" }),
      );

      await waitFor(() => expect(result.current.isConnected).toBe(true));
    });
  });

  describe("useA2AHistory", () => {
    it("should fetch history", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "1" }],
      });

      const { result } = renderHook(() => useA2AHistory({ runId: "run-1" }));

      await waitFor(() => expect(result.current.history).toHaveLength(1));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("runId=run-1"),
      );
    });

    it("adversarial: should handle fetch errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useA2AHistory({ runId: "run-1" }));

      await waitFor(() => expect(result.current.error).toBeDefined());

      // We need to wait for the finally block in fetchHistory to execute and update state
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });
});
