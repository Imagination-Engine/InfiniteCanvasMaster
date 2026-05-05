// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { getTransition } from "../motion-utils";

describe("Motion Utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the requested transition when prefers-reduced-motion is false", () => {
    // Mock matchMedia for standard motion
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });

    const transition = getTransition("cinematic");
    expect(transition.ease).toEqual([0.2, 0.8, 0.2, 1]);
    expect(transition.duration).toBeGreaterThan(0);
  });

  it("should return instant/fade transition when prefers-reduced-motion is true", () => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });

    const transition = getTransition("cinematic");
    // For reduced motion, duration should be 0 or very close to it
    expect(transition.duration).toBe(0);
  });
});
