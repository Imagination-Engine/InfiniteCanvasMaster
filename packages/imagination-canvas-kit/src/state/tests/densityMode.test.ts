/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useShellStore } from "../shellStore";

describe("Density Modes", () => {
  beforeEach(() => {
    useShellStore.setState({ density: "comfortable" } as any);
  });

  it("should default to comfortable density", () => {
    const { density } = useShellStore.getState() as any;
    expect(density).toBe("comfortable");
  });

  it("should allow setting different density modes", () => {
    const { setDensity } = useShellStore.getState() as any;

    setDensity("compact");
    expect((useShellStore.getState() as any).density).toBe("compact");

    setDensity("presentation");
    expect((useShellStore.getState() as any).density).toBe("presentation");

    setDensity("immersive");
    expect((useShellStore.getState() as any).density).toBe("immersive");
  });
});
