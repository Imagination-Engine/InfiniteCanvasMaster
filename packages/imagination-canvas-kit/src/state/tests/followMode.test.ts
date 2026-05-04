/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useViewportStore } from "../viewportStore";
import { usePresenceStore } from "../presenceStore";

describe("Follow Mode", () => {
  beforeEach(() => {
    useViewportStore.setState({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",
      followedUserId: undefined,
    } as any);
    usePresenceStore.setState({ users: {} });
  });

  it("should allow locking to a remote presence coordinate", () => {
    const { setFollowedUser } = useViewportStore.getState() as any;

    // Remote user moves
    usePresenceStore.getState().updateUser("user-2", {
      name: "Bob",
      viewport: { x: 500, y: 500, zoom: 1.5 },
    });

    // Start following
    setFollowedUser("user-2");

    // Viewport should immediately update
    const viewport = useViewportStore.getState();
    expect(viewport.mode).toBe("follow");
    expect((viewport as any).followedUserId).toBe("user-2");
    expect(viewport.x).toBe(500);
    expect(viewport.y).toBe(500);
    expect(viewport.zoom).toBe(1.5);
  });

  it("should break follow mode if local user attempts to pan or zoom", () => {
    const { setFollowedUser, pan, zoomTo } = useViewportStore.getState() as any;

    usePresenceStore
      .getState()
      .updateUser("user-2", { viewport: { x: 500, y: 500, zoom: 1 } });
    setFollowedUser("user-2");

    expect(useViewportStore.getState().mode).toBe("follow");

    // User tries to pan
    pan(10, 10);

    // Should break follow mode
    expect(useViewportStore.getState().mode).toBe("free");
    expect((useViewportStore.getState() as any).followedUserId).toBeUndefined();
  });
});
