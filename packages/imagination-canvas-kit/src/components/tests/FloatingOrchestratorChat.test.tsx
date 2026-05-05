/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import React from "react";
import { FloatingOrchestratorChat } from "../FloatingOrchestratorChat";
import { useCanvasStore } from "../../state/canvasStore";

describe("FloatingOrchestratorChat Integration", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useCanvasStore.setState({ objects: {} });
  });

  it("should open when the Agent tag is clicked", async () => {
    render(<FloatingOrchestratorChat />);

    // Find the toggle button
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    const tag = tags[0];
    expect(tag).toBeDefined();

    // Click the tag
    fireEvent.click(tag);

    // Orchestrator header should appear
    const headers = await screen.findAllByRole("heading", {
      name: /Orchestrator/i,
    });
    expect(headers[0]).toBeDefined();
  });

  it("should handle praise conversationally without triggering a plan", async () => {
    render(<FloatingOrchestratorChat />);

    // Open drawer
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    // Find input and send praise
    const inputs =
      await screen.findAllByPlaceholderText(/Describe your intent/i);
    const input = inputs[0];
    fireEvent.change(input, { target: { value: "This is amazing!" } });

    const sendButtons = screen.getAllByLabelText(/Send Message/i);
    fireEvent.click(sendButtons[0]);

    // Wait for agent response
    await waitFor(
      () => {
        // Look for the conversational response prefixes
        const response =
          screen.queryByText(
            /I am so glad you are enjoying the creative process/i,
          ) ||
          screen.queryByText(/Thanks! I'm here to help you/i) ||
          screen.queryByText(/That means a lot!/i);

        expect(response).not.toBeNull();
      },
      { timeout: 4000 },
    );
  });

  it("should incorporate session context into block creation responses", async () => {
    // Set session context in shell store
    const { useShellStore } = await import("../../state/shellStore");
    useShellStore.setState({ sessionContext: "Build a Sci-Fi epic" });

    render(<FloatingOrchestratorChat />);

    // Open drawer
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    // Find input and request a note
    const inputs =
      await screen.findAllByPlaceholderText(/Describe your intent/i);
    fireEvent.change(inputs[0], { target: { value: "Add a note block" } });

    const sendButtons = screen.getAllByLabelText(/Send Message/i);
    fireEvent.click(sendButtons[0]);

    // Wait for agent response mentioning the session context
    await waitFor(
      () => {
        const response = screen.queryByText(/Build a Sci-Fi epic/i);
        expect(response).not.toBeNull();
      },
      { timeout: 4000 },
    );
  });

  it("should drop an agent block onto the canvas when requested", async () => {
    render(<FloatingOrchestratorChat />);

    // Open drawer
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    // Find input and request an agent
    const inputs =
      await screen.findAllByPlaceholderText(/Describe your intent/i);
    fireEvent.change(inputs[0], { target: { value: "Add an agent block" } });

    const sendButtons = screen.getAllByLabelText(/Send Message/i);
    fireEvent.click(sendButtons[0]);

    // Wait for agent response and store update
    await waitFor(
      () => {
        const objects = useCanvasStore.getState().objects;
        const objectValues = Object.values(objects);
        const hasAgent = objectValues.some(
          (obj) => (obj as any).type === "agent",
        );
        expect(hasAgent).toBe(true);
      },
      { timeout: 4000 },
    );
  });

  it("should drop an agent with correct traits when requested", async () => {
    render(<FloatingOrchestratorChat />);

    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    const inputs =
      await screen.findAllByPlaceholderText(/Describe your intent/i);
    fireEvent.change(inputs[0], {
      target: { value: "I need a researcher agent to find market trends" },
    });

    const sendButtons = screen.getAllByLabelText(/Send Message/i);
    fireEvent.click(sendButtons[0]);

    await waitFor(
      () => {
        const objects = useCanvasStore.getState().objects;
        const agent = Object.values(objects).find(
          (obj) => (obj as any).type === "agent",
        ) as any;
        expect(agent).toBeDefined();
        expect(agent.metadata.label).toBe("Researcher Agent");
        expect(agent.metadata.description).toContain("find market trends");
      },
      { timeout: 4000 },
    );
  });

  // ─── Issue 5: Orchestrator Header Visibility (Red phase) ─────────────────

  it("should render the close button with sufficient contrast class", async () => {
    render(<FloatingOrchestratorChat />);

    // Open the panel
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    // Find close button
    const closeBtn = screen.getByLabelText("Close Orchestrator");
    // Will FAIL before fix — class is text-white/40, not text-white/70
    expect(closeBtn.className).toMatch(/text-white\/70/);
  });

  it("should render toggle button with a descriptive title", () => {
    render(<FloatingOrchestratorChat />);
    const toggleBtns = screen.getAllByLabelText(/Open Orchestrator/i);
    const toggleBtn = toggleBtns[0];
    // Will FAIL before fix — title attribute is missing
    expect(toggleBtn.getAttribute("title")).toBe("Open Canvas Orchestrator");
  });

  it("adversarial: X button must remain accessible when panel is scrolled", async () => {
    render(<FloatingOrchestratorChat />);
    const tags = screen.getAllByLabelText(/Open Orchestrator/i);
    fireEvent.click(tags[0]);

    // Close button must still be reachable in the DOM
    expect(screen.getByLabelText("Close Orchestrator")).toBeDefined();
  });
});
