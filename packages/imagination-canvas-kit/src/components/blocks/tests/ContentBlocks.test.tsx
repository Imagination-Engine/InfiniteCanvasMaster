/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArtifactBlock } from "../ArtifactBlock";
import { ChatBlock } from "../ChatBlock";
import { MemoryClusterBlock } from "../MemoryClusterBlock";

// Mock viewport store for semantic zoom tests
let mockZoom = 1;
vi.mock("../../../state/viewportStore", () => ({
  useViewportStore: (selector: any) =>
    selector({ viewport: { x: 0, y: 0, zoom: mockZoom } }),
}));

describe("Content Blocks Adversarial", () => {
  it("ArtifactBlock should suppress details when zoomed out", () => {
    mockZoom = 0.1;
    const mockObject: any = {
      id: "art-1",
      status: "idle",
      width: 400,
      height: 300,
      metadata: {
        title: "Research Summary",
        content: "Detailed research findings...",
      },
    };

    const { queryByText } = render(<ArtifactBlock object={mockObject} />);
    expect(queryByText("Detailed research findings...")).toBeNull();
  });

  it("ChatBlock should suppress details when zoomed out", () => {
    mockZoom = 0.1;
    const mockObject: any = {
      id: "chat-1",
      status: "idle",
      width: 350,
      height: 450,
      metadata: {
        messages: [{ role: "user", content: "Hello" }],
      },
    };

    const { queryByText } = render(<ChatBlock object={mockObject} />);
    expect(queryByText("Hello")).toBeNull();
  });

  it("MemoryClusterBlock should suppress details when zoomed out", () => {
    mockZoom = 0.1;
    const mockObject: any = {
      id: "mem-1",
      status: "idle",
      width: 300,
      height: 250,
      metadata: {
        summary: "Project Extraction Memories",
        itemsCount: 15,
      },
    };

    const { queryByText } = render(<MemoryClusterBlock object={mockObject} />);
    expect(queryByText("Project Extraction Memories")).toBeNull();
  });
});
