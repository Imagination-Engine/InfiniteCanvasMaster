/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteBlock } from "../NoteBlock";

describe("NoteBlock dual-mode", () => {
  const object = {
    id: "n1",
    type: "note",
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    metadata: { text: "Short note" },
  };

  it("shows compact textarea on canvas", () => {
    render(<NoteBlock object={object as any} mode="compact" />);
    expect(screen.getByPlaceholderText("Type a note...")).toBeDefined();
  });

  it("shows expanded editor in fullscreen mode", () => {
    render(<NoteBlock object={object as any} mode="fullscreen" />);
    expect(screen.getByText("Note Editor")).toBeDefined();
    expect(screen.getByPlaceholderText("Expand your thoughts…")).toBeDefined();
  });
});
