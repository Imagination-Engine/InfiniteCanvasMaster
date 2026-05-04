// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { RemoteCursor } from "../RemoteCursor";

describe("RemoteCursor", () => {
  const mockPresence = {
    id: "user-1",
    name: "Alice",
    color: "#ff0000",
    x: 150,
    y: 250,
    lastActive: Date.now(),
    isAgent: false,
  };

  it("should render a human cursor at the correct coordinates", () => {
    const { container, getByText } = render(
      <RemoteCursor presence={mockPresence} />,
    );

    // Check if name is rendered
    expect(getByText("Alice")).toBeDefined();

    // Check if it's positioned correctly
    const cursorEl = container.firstChild as HTMLElement;
    expect(cursorEl.style.transform).toContain("translate(150px, 250px)");

    // Ensure it is NOT an agent
    expect(container.querySelector(".agent-halo")).toBeNull();
  });

  it("should render an AgentHalo when isAgent is true", () => {
    const agentPresence = { ...mockPresence, isAgent: true, name: "AI Helper" };
    const { container, getByText } = render(
      <RemoteCursor presence={agentPresence} />,
    );

    expect(getByText("AI Helper")).toBeDefined();

    // Ensure the halo is present
    expect(container.querySelector(".agent-halo")).toBeDefined();
  });
});
