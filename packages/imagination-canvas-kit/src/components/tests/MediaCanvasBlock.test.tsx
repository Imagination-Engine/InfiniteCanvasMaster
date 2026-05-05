// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { MediaCanvasBlock } from "../MediaCanvasBlock";

describe("MediaCanvasBlock", () => {
  const mockBlock = {
    id: "media-1",
    type: "block",
    blockKind: "artifact",
    x: 10,
    y: 10,
    width: 300,
    height: 300,
    data: { url: "https://example.com/image.png", type: "image" },
    status: "idle",
  };

  it("should render an image if type is image", () => {
    const { container } = render(<MediaCanvasBlock block={mockBlock as any} />);
    const img = container.querySelector("img");
    expect(img).toBeDefined();
    expect(img?.src).toBe("https://example.com/image.png");
  });

  it("should render an iframe if type is embed", () => {
    const embedBlock = {
      ...mockBlock,
      data: { url: "https://youtube.com", type: "embed" },
    };
    const { container } = render(
      <MediaCanvasBlock block={embedBlock as any} />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeDefined();
    expect(iframe?.src).toBe("https://youtube.com/");
  });

  it("should stop wheel event propagation to prevent accidental canvas zooming", () => {
    const mockStopPropagation = vi.fn();
    const { container } = render(<MediaCanvasBlock block={mockBlock as any} />);

    const element = container.firstChild as HTMLElement;

    const event = new MouseEvent("wheel", { bubbles: true });
    event.stopPropagation = mockStopPropagation;

    element.dispatchEvent(event);

    expect(mockStopPropagation).toHaveBeenCalled();
  });

  describe("adversarial cases", () => {
    it("should handle undefined data gracefully", () => {
      const undefinedBlock = { ...mockBlock, data: undefined };
      const { getByText } = render(
        <MediaCanvasBlock block={undefinedBlock as any} />,
      );
      expect(getByText("Empty Media")).toBeDefined();
    });

    it("should handle unknown media types gracefully", () => {
      const unknownBlock = {
        ...mockBlock,
        data: { type: "hologram", url: "..." },
      };
      const { getByText } = render(
        <MediaCanvasBlock block={unknownBlock as any} />,
      );
      expect(getByText("Unsupported Media Type")).toBeDefined();
    });
  });
});
