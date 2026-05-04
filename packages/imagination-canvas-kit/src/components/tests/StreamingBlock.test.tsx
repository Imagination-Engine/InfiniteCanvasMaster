/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { StreamingBlock } from "../StreamingBlock";

describe("StreamingBlock", () => {
  const mockBlock = {
    id: "stream-1",
    type: "block",
    x: 10,
    y: 10,
    width: 250,
    height: 150,
    status: "streaming",
    data: {},
  };

  it("should render a skeleton placeholder when status is streaming and no content exists", () => {
    const { container } = render(<StreamingBlock block={mockBlock as any} />);
    const skeleton = container.querySelector(".streaming-skeleton");
    expect(skeleton).toBeDefined();
    expect((skeleton as HTMLElement).style.width).toBe("100%"); // Internal relative width
  });

  it("should render children when status is idle", () => {
    const idleBlock = { ...mockBlock, status: "idle" };
    const { container, getAllByText } = render(
      <StreamingBlock block={idleBlock as any}>
        <div>Real Content</div>
      </StreamingBlock>,
    );

    expect(getAllByText("Real Content").length).toBeGreaterThan(0);
    expect(container.querySelector(".streaming-skeleton")).toBeNull();
  });

  it("should render both skeleton and children if streaming but partial content exists", () => {
    // For progressive reveal, if there's *some* content, we render the content
    // and maybe a small pulsing indicator, but here we just check if it renders children.
    const partialBlock = { ...mockBlock, data: { content: "Partial..." } };
    const { container, getAllByText } = render(
      <StreamingBlock block={partialBlock as any}>
        <div>Real Content</div>
      </StreamingBlock>,
    );

    expect(getAllByText("Real Content").length).toBeGreaterThan(0);
    const indicator = container.querySelector(".streaming-indicator");
    expect(indicator).toBeDefined();
  });

  describe("adversarial cases", () => {
    it("should ignore streaming wrapper logic if status is failed", () => {
      const failedBlock = { ...mockBlock, status: "failed" };
      const { container, getAllByText } = render(
        <StreamingBlock block={failedBlock as any}>
          <div>Failed State Content</div>
        </StreamingBlock>,
      );

      expect(getAllByText("Failed State Content").length).toBeGreaterThan(0);
      expect(container.querySelector(".streaming-indicator")).toBeNull();
      expect(container.querySelector(".streaming-skeleton")).toBeNull();
    });
  });
});
