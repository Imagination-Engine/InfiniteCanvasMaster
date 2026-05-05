// @ts-nocheck
import { CanvasObject, CanvasConnection } from "../contracts";
import { blockRegistry } from "@iem/core";

export interface PlanNode {
  id: string;
  type: string;
  title: string;
  dependencies?: string[];
}

export interface PlanGraph {
  nodes: PlanNode[];
  edges: { source: string; target: string }[];
}

function inferBlockId(node: PlanNode): string {
  const t = (node.type + " " + node.title).toLowerCase();

  if (t.indexOf("research") !== -1) return "iem.agent.researcher";
  if (
    t.indexOf("write") !== -1 ||
    t.indexOf("copy") !== -1 ||
    t.indexOf("narrative") !== -1
  )
    return "iem.studio.writer";
  if (t.indexOf("video") !== -1 || t.indexOf("reel") !== -1)
    return "iem.studio.video";
  if (t.indexOf("game") !== -1) return "iem.studio.game";
  if (
    t.indexOf("app") !== -1 ||
    t.indexOf("code") !== -1 ||
    t.indexOf("build") !== -1
  )
    return "iem.studio.app";
  if (t.indexOf("commerce") !== -1 || t.indexOf("sell") !== -1)
    return "iem.commerce.intentcast";
  if (t.indexOf("sandbox") !== -1 || t.indexOf("autonomous") !== -1)
    return "iem.agent.imagiclaw-sandbox";
  if (t.indexOf("approval") !== -1 || t.indexOf("human") !== -1)
    return "iem.intent.checkpoint";
  if (t.indexOf("output") !== -1 || t.indexOf("final") !== -1)
    return "iem.sys.compiler";

  return "iem.intent.task";
}

export function compileDagToBlocks(
  plan: PlanGraph,
  startX = 0,
  startY = 0,
): { objects: CanvasObject[]; connections: CanvasConnection[] } {
  const objects: CanvasObject[] = [];
  const connections: CanvasConnection[] = [];

  plan.nodes.forEach((node, index) => {
    const blockId = inferBlockId(node);
    const def = blockRegistry.get(blockId);

    objects.push({
      id: node.id,
      type: "block",
      blockKind: blockId,
      x: startX,
      y: startY,
      width: 320,
      height: 240,
      zIndex: 1,
      status: "idle",
      metadata: {
        title: node.title || def?.name || "Untitled Block",
        originalIntent: node.type,
      },
    } as any);
  });

  plan.edges.forEach((edge, idx) => {
    connections.push({
      id: "conn-" + Date.now() + "-" + idx,
      sourceId: edge.source,
      targetId: edge.target,
      type: "flow",
    });
  });

  if (plan.edges.length === 0) {
    plan.nodes.forEach((node) => {
      if (node.dependencies) {
        node.dependencies.forEach((depId, idx) => {
          connections.push({
            id: "conn-dep-" + Date.now() + "-" + node.id + "-" + idx,
            sourceId: depId,
            targetId: node.id,
            type: "flow",
          });
        });
      }
    });
  }

  return { objects, connections };
}
