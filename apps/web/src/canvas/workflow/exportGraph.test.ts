import { describe, it, expect } from "vitest";
import { exportWorkflowGraphFromShapes } from "./exportGraph";

describe("exportWorkflowGraphFromShapes", () => {
  it("exports nodes and iemEdge arrows", () => {
    const graph = exportWorkflowGraphFromShapes([
      {
        id: "shape:1",
        type: "iem-block",
        props: {
          blockId: "iem.scribe.prose",
          label: "Prose",
          inputs: { a: 1 },
        },
        meta: { iem: { nodeId: "prose-1" } },
      },
      {
        id: "shape:2",
        type: "iem-block",
        props: {
          blockId: "iem.core.summarizer",
          label: "Summarize",
          inputs: {},
        },
        meta: { iem: { nodeId: "sum-1" } },
      },
      {
        id: "shape:edge-1",
        type: "arrow",
        meta: { iemEdge: { sourceNodeId: "prose-1", targetNodeId: "sum-1" } },
      },
    ] as any);

    expect(graph.nodes).toEqual([
      {
        id: "prose-1",
        type: "iem.scribe.prose",
        label: "Prose",
        data: { inputs: { a: 1 } },
      },
      {
        id: "sum-1",
        type: "iem.core.summarizer",
        label: "Summarize",
        data: { inputs: {} },
      },
    ]);

    expect(graph.edges).toEqual([
      {
        id: "shape:edge-1",
        source: "prose-1",
        target: "sum-1",
        condition: undefined,
      },
    ]);
  });

  it("adversarial: ignores arrows without iemEdge metadata", () => {
    const graph = exportWorkflowGraphFromShapes([
      { id: "shape:a", type: "arrow", meta: {} },
      { id: "shape:b", type: "arrow" },
    ] as any);
    expect(graph.edges).toEqual([]);
  });
});
