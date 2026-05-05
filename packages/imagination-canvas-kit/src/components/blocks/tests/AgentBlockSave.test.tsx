/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AgentBlock } from "../AgentBlock";

describe("AgentBlock Save to Library", () => {
  it("should trigger a save action when the button is clicked", async () => {
    const testObject = {
      id: "agent-1",
      type: "agent",
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      status: "idle",
      metadata: {
        label: "Custom Agent",
        role: "Researcher",
        instructions: "Do research",
      },
    };

    // We'll mock the global fetch to verify the network dispatch
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response),
    );

    render(<AgentBlock object={testObject} mode="fullscreen" />);

    const saveButton = screen.getByText(/Save to Library/i);
    fireEvent.click(saveButton);

    // Verify fetch was called with the correct path and payload
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/library/blocks");
    expect(options?.method).toBe("POST");

    const body = JSON.parse(options?.body as string);
    expect(body.metadata.label).toBe("Custom Agent");

    fetchSpy.mockRestore();
  });
});
