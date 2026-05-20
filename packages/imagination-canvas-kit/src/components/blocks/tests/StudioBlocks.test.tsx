/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WriterStudioBlock } from "../studio/studioBlocks";

const mockUpdateObject = vi.fn();

vi.mock("../../../state/canvasStore", () => ({
  useCanvasStore: (
    selector: (s: { updateObject: typeof mockUpdateObject }) => unknown,
  ) => selector({ updateObject: mockUpdateObject }),
}));

describe("WriterStudioBlock", () => {
  const baseObject = {
    id: "writer-1",
    type: "iem.studio.writer",
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    zIndex: 1,
    status: "idle",
    metadata: {},
  };

  beforeEach(() => {
    cleanup();
    mockUpdateObject.mockClear();
  });

  it("renders compact preview on canvas", () => {
    render(<WriterStudioBlock object={baseObject as any} mode="compact" />);
    expect(screen.getByText("Manuscript")).toBeDefined();
  });

  it("renders fullscreen editor with title field", () => {
    render(<WriterStudioBlock object={baseObject as any} mode="fullscreen" />);
    expect(
      screen.getByText("Writer's Studio — Manuscript Editor"),
    ).toBeDefined();
    expect(screen.getByPlaceholderText("Write your narrative…")).toBeDefined();
  });

  it("persists manuscript artifact on blur in fullscreen mode", () => {
    render(<WriterStudioBlock object={baseObject as any} mode="fullscreen" />);

    const textarea = screen.getByPlaceholderText("Write your narrative…");
    fireEvent.change(textarea, { target: { value: "Hello manuscript." } });
    fireEvent.blur(textarea);

    expect(mockUpdateObject).toHaveBeenCalled();
    const call = mockUpdateObject.mock.calls[0][1];
    expect(call.metadata.outputs.manuscript.contractId).toBe("manuscript");
    expect(call.metadata.outputs.manuscript.data.body).toBe(
      "Hello manuscript.",
    );
  });
});
