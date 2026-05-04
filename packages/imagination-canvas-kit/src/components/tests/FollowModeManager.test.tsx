// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { FollowModeManager } from "../FollowModeManager";
import { useViewportStore } from "../../state/viewportStore";
import { usePresenceStore } from "../../state/presenceStore";

describe("FollowModeManager", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    useViewportStore.setState({
      x: 0,
      y: 0,
      zoom: 1,
      mode: "free",
      followedUserId: undefined,
    } as any);
    usePresenceStore.setState({ users: {} });
  });

  it("should render nothing when not following", () => {
    const { container } = render(<FollowModeManager />);
    expect(container.firstChild).toBeNull();
  });

  it("should render a badge and sync viewport when following a user", () => {
    usePresenceStore.getState().updateUser("user-1", {
      name: "Alice",
      viewport: { x: 100, y: 100, zoom: 2 },
    });

    (useViewportStore.getState() as any).setFollowedUser("user-1");

    const { getAllByText } = render(<FollowModeManager />);

    expect(getAllByText("Following Alice").length).toBeGreaterThan(0);
    // Clean up DOM to prevent multi-element error
    document.body.innerHTML = "";

    const viewport = useViewportStore.getState();
    expect(viewport.x).toBe(100);
    expect(viewport.y).toBe(100);
    expect(viewport.zoom).toBe(2);
  });
});
