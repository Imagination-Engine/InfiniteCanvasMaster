/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { FloatingOrchestratorChat } from "../FloatingOrchestratorChat";
import { useCanvasStore } from "../../state/canvasStore";

describe("FloatingOrchestratorChat Integration", () => {
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
        const hasAgent = objectValues.some((obj) => obj.type === "agent");
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
          (obj) => obj.type === "agent",
        ) as any;
        expect(agent).toBeDefined();
        expect(agent.metadata.label).toBe("Researcher Agent");
        expect(agent.metadata.description).toContain("find market trends");
      },
      { timeout: 4000 },
    );
  });
});
