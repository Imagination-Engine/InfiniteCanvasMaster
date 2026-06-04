/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ComposerAttachmentStrip } from "../ComposerAttachmentStrip";
import type { ComposerAttachment } from "../../utils/composerAttachments";

describe("ComposerAttachmentStrip", () => {
  it("renders image thumbnails and calls onRemove", () => {
    const onRemove = vi.fn();
    const attachments: ComposerAttachment[] = [
      {
        id: "att-1",
        file: new File(["x"], "scene.png", { type: "image/png" }),
        previewUrl: "blob:preview-1",
        kind: "image",
      },
    ];

    render(
      <ComposerAttachmentStrip attachments={attachments} onRemove={onRemove} />,
    );

    expect(screen.getByAltText("scene.png")).toBeDefined();
    fireEvent.click(screen.getByLabelText("Remove scene.png"));
    expect(onRemove).toHaveBeenCalledWith("att-1");
  });

  it("renders nothing when there are no attachments", () => {
    const { container } = render(
      <ComposerAttachmentStrip attachments={[]} onRemove={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
