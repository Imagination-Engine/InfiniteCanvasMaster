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
      zIndex: 1,
      status: "idle",
      metadata: {
        label: "Custom Agent",
        role: "Researcher",
        instructions: "Do research",
      },
      capabilities: [],
      blockKind: "agent",
    };

    const fetchSpy = vi.spyOn(window, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response),
    );

    render(<AgentBlock object={testObject as any} mode="fullscreen" />);

    const saveButton = screen.getByText(/Save to Library/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url.toString()).toContain("/api/blocks/library");
    expect(options?.method).toBe("POST");

    const body = JSON.parse(options?.body as string);
    expect(body.metadata.label).toBe("Custom Agent");

    fetchSpy.mockRestore();
  });
});
