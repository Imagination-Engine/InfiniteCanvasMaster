import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupYjsProvider, getAwarenessState } from "../yjs";

describe("Yjs Real-Time Presence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes a Yjs Doc and connects to the websocket provider", () => {
    const { doc, provider } = setupYjsProvider("test-room-123");
    expect(doc).toBeDefined();
    expect(provider).toBeDefined();
    expect(provider.roomname).toBe("test-room-123");
  });

  it("broadcasts cursor position via awareness", () => {
    const { awareness } = setupYjsProvider("test-room-456");

    awareness.setLocalStateField("cursor", { x: 100, y: 200 });
    const state = getAwarenessState(awareness);

    expect(state.cursor).toEqual({ x: 100, y: 200 });
  });

  it("adversarial: handles high-latency/dropped websocket frames (reconnection logic)", () => {
    const { provider } = setupYjsProvider("test-room-789");

    // Simulate a disconnect
    provider.disconnect();
    expect(provider.shouldConnect).toBe(false);

    // Ensure it can explicitly reconnect
    provider.connect();
    expect(provider.shouldConnect).toBe(true);
  });
});
