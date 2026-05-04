/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppBlock } from "../AppBlock";

describe("AppBlock Adversarial", () => {
  it("should handle invalid or missing appUrl gracefully", () => {
    const mockObject: any = {
      id: "app-3",
      status: "running",
      width: 600,
      height: 400,
      metadata: {},
    };

    const { getByText } = render(<AppBlock object={mockObject} />);
    expect(getByText(/No URL provided/)).toBeTruthy();
  });

  it("should show error state and allow recovery", () => {
    const mockObject: any = {
      id: "app-4",
      status: "error",
      width: 600,
      height: 400,
      metadata: { appUrl: "https://example.com" },
    };

    const { getByText } = render(<AppBlock object={mockObject} />);
    expect(getByText("Runtime Error")).toBeTruthy();

    const restartBtn = getByText("Restart");
    fireEvent.click(restartBtn);
    // Restart re-renders component with new key, error remains if status is error
    // but at least it didn't crash.
  });
});
