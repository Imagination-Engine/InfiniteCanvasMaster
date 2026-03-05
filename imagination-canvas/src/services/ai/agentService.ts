import { NODE_CATALOG } from "../../nodes/nodeCatalog";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AgentGraphResponse = {
  nodes: Array<{ type: string; label?: string; inputs?: Record<string, unknown>; config?: Record<string, unknown> }>;
  edges: Array<{ sourceIndex: number; targetIndex: number }>;
};

const chooseNodeTypesFromPrompt = (prompt: string): string[] => {
  const text = prompt.toLowerCase();

  const flow: string[] = [];
  if (text.includes("time") || text.includes("every")) flow.push("trigger.time");
  if (text.includes("zoom") || text.includes("meeting")) flow.push("zoom.getMeetingSummary");
  if (text.includes("email") || text.includes("gmail")) flow.push("gmail.sendEmail");
  if (text.includes("translate") || text.includes("translator")) flow.push("translator");
  if (text.includes("slack")) flow.push("slack.sendChannelMessage");

  if (flow.length === 0) {
    return ["trigger.time", "summarizer", "slack.sendChannelMessage"];
  }

  return flow;
};

export async function requestAgentGraph(prompt: string): Promise<AgentGraphResponse> {
  // Placeholder for local LLM endpoint integration.
  // Intended endpoint: http://localhost:11434/api/generate
  await sleep(500);

  const types = chooseNodeTypesFromPrompt(prompt).filter((type) => Boolean(NODE_CATALOG[type]));
  const nodes = types.map((type, index) => ({
    type,
    label: NODE_CATALOG[type]?.defaultData.label,
    inputs: {
      prompt,
      step: index + 1,
    },
  }));

  const edges = nodes.slice(1).map((_, index) => ({
    sourceIndex: index,
    targetIndex: index + 1,
  }));

  return { nodes, edges };
}
