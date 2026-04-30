import { apiRequest } from "../../lib/api";

/**
 * Unified Creative Node Runner
 * This replaces all client-side Gemini calls and monolithic switch-cases.
 * It executes the authoritative server-side logic for any block in the registry.
 */
export async function runCreativeNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  try {
    // 1. Map legacy frontend IDs to canonical reverse-DNS IDs if needed
    // In a mature system, nodeType would always be the canonical ID (e.g. iem.core.refiner)
    const blockId = nodeType.includes(".") ? nodeType : `iem.core.${nodeType}`;

    console.log(`[EXECUTION] Dispatching ${blockId} to server...`);

    // 2. Call the unified block execution endpoint
    const response = await apiRequest<{
      success: boolean;
      output: Record<string, any>;
      error?: string;
    }>(
      "/api/blocks/execute",
      {
        method: "POST",
        body: JSON.stringify({
          blockId,
          inputs: { ...inputs, ...config }, // Merge config into inputs for the agent
        }),
      },
      accessToken,
    );

    if (!response.success) {
      throw new Error(response.error || "Execution failed on server");
    }

    return response.output;
  } catch (error) {
    console.error(`[EXECUTION ERROR] ${nodeType}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown execution error",
      status: "error",
    };
  }
}
