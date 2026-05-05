// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { usePresenceStore } from "../presenceStore";

describe("Presence Store", () => {
  beforeEach(() => {
    usePresenceStore.setState({ users: {} });
  });

  it("should add a new user if updating a non-existent id", () => {
    const { updateUser } = usePresenceStore.getState();
    updateUser("user-1", { name: "Alice", x: 100, y: 100, isAgent: false });

    const users = usePresenceStore.getState().users;
    expect(users["user-1"]).toBeDefined();
    expect(users["user-1"].name).toBe("Alice");
    expect(users["user-1"].x).toBe(100);
    expect(users["user-1"].isAgent).toBe(false);
  });

  it("should update an existing user", () => {
    const { updateUser } = usePresenceStore.getState();
    updateUser("user-1", { name: "Alice", x: 100, y: 100 });

    updateUser("user-1", { x: 200, y: 200 });

    const users = usePresenceStore.getState().users;
    expect(users["user-1"].x).toBe(200);
    expect(users["user-1"].y).toBe(200);
    expect(users["user-1"].name).toBe("Alice"); // Name should be preserved
  });

  it("should correctly track agent vs human presence", () => {
    const { updateUser } = usePresenceStore.getState();
    updateUser("agent-1", { name: "AI Helper", isAgent: true, x: 50, y: 50 });

    const users = usePresenceStore.getState().users;
    expect(users["agent-1"].isAgent).toBe(true);
  });

  it("should remove a user", () => {
    const { updateUser, removeUser } = usePresenceStore.getState();
    updateUser("user-1", { name: "Alice" });

    expect(usePresenceStore.getState().users["user-1"]).toBeDefined();

    removeUser("user-1");

    expect(usePresenceStore.getState().users["user-1"]).toBeUndefined();
  });

  it("should track selection states and viewport states", () => {
    const { updateUser } = usePresenceStore.getState();
    updateUser("user-1", {
      selectionIds: ["block-1"],
      viewport: { x: 10, y: 10, zoom: 1 },
    });

    const user = usePresenceStore.getState().users["user-1"];
    expect(user.selectionIds).toContain("block-1");
    expect(user.viewport?.zoom).toBe(1);
  });
});
