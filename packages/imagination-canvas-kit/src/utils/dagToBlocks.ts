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

/**
 * Blueprint for a reference-forge reel: N image sources → Video Studio forge.
 */
export function compileReelForgeBlueprint(
  imageNodeCount: number,
  motionPrompt: string,
  startX = 0,
  startY = 0,
): { objects: CanvasObject[]; connections: CanvasConnection[] } {
  const count = Math.min(Math.max(imageNodeCount, 1), 3);
  const nodes: PlanNode[] = [];
  const edges: { source: string; target: string }[] = [];

  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `reel-img-${i}`,
      type: "image",
      title: `Reference ${i + 1}`,
    });
    edges.push({ source: `reel-img-${i}`, target: "reel-forge" });
  }

  nodes.push({
    id: "reel-forge",
    type: "video",
    title: motionPrompt.slice(0, 48) || "Reel Forge",
  });

  const graph = compileDagToBlocks({ nodes, edges }, startX, startY);
  const forge = graph.objects.find((o) => o.id === "reel-forge");
  if (forge?.metadata) {
    forge.metadata = {
      ...forge.metadata,
      studioPayload: {
        title: "Reel Forge",
        scenes: [],
        forge: { prompt: motionPrompt, status: "idle" },
      },
    };
  }

  graph.objects.forEach((obj, i) => {
    if (obj.id.startsWith("reel-img-")) {
      (obj as any).blockKind = "iem.reel.textToImage";
      obj.x = startX + i * 360;
      obj.y = startY;
    }
    if (obj.id === "reel-forge") {
      (obj as any).blockKind = "iem.studio.video";
      obj.x = startX + ((count - 1) * 360) / 2;
      obj.y = startY + 280;
      obj.width = 400;
      obj.height = 320;
    }
  });

  return graph;
}
