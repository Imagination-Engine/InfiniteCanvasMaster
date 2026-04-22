import { NODE_CATALOG } from "../../nodes/nodeCatalog";
import { z } from "zod";

export type AgentGraphResponse = {
  nodes: Array<{
    type: string;
    label?: string;
    inputs?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }>;
  edges: Array<{ sourceIndex: number; targetIndex: number }>;
};

const AgentGraphSchema = z.object({
  nodes: z.array(
    z.object({
      type: z.string(),
      label: z.string().optional(),
      inputs: z.record(z.string(), z.unknown()).optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
  edges: z.array(
    z.object({
      sourceIndex: z.number(),
      targetIndex: z.number(),
    }),
  ),
});

export async function requestAgentGraph(
  prompt: string,
): Promise<AgentGraphResponse> {
  if (!prompt.trim()) {
    return { nodes: [], edges: [] };
  }

  const catalogSummary = Object.keys(NODE_CATALOG)
    .map((type) => `- ${type}: ${NODE_CATALOG[type]?.defaultData.description}`)
    .join("\\n");

  const systemPrompt = `You are an AI that creates workflow graphs. Available nodes:\\n${catalogSummary}\\n\\nBased on the user prompt, generate a JSON object with 'nodes' (array of {type, label, inputs}) and 'edges' (array of {sourceIndex, targetIndex}). Ensure types match the available nodes EXACTLY. Return ONLY valid JSON, no markdown formatting.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        system: systemPrompt,
        prompt: prompt,
        stream: false,
        format: "json",
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`LLM API returned status ${res.status}`);
    }

    const data = await res.json();
    const parsedData = JSON.parse(data.response);

    // Ensure nodes exist in catalog
    const validated = AgentGraphSchema.parse(parsedData);
    validated.nodes = validated.nodes.filter((n) =>
      Boolean(NODE_CATALOG[n.type]),
    );

    // Handle empty generation gracefully
    if (validated.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    return validated;
  } catch (err) {
    console.error("Failed to generate agent graph:", err);
    // Fallback or empty state on error
    throw new Error(
      `Agent Graph generation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
