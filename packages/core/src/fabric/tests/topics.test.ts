import { describe, it, expect } from "vitest";
import { FabricTopics } from "../topics";

describe("FabricTopics", () => {
  it("should generate correct workflow topics", () => {
    expect(FabricTopics.workflowTrace("r1")).toBe("dag.r1.trace");
    expect(FabricTopics.workflowNodeOutput("r1", "n1")).toBe(
      "dag.r1.node.n1.output",
    );
  });

  it("should generate correct canvas topics", () => {
    expect(FabricTopics.canvasState("c1")).toBe("canvas.c1.state");
  });
});
