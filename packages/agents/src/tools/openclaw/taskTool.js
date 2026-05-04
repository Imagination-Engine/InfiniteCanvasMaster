import { createTool } from "@mastra/core/tools";
import { z } from "zod";
export const OpenClawMastraToolInputSchema = z.object({
  blockId: z.string().describe("The ID of the OpenClaw block on the canvas"),
  sessionId: z
    .string()
    .describe("The active OpenClaw session ID to execute within"),
  task: z.string().describe("The specific instruction or task to be executed"),
  requireApproval: z
    .boolean()
    .optional()
    .describe("Override to explicitly require human approval for this task"),
  policyOverrides: z
    .record(z.any())
    .optional()
    .describe("Optional temporary loosening or tightening of policies"),
});
/**
 * Creates a Mastra tool that delegates to a specific OpenClaw block via the runtime adapter.
 * Mastra uses this to command an OpenClaw instance dynamically.
 *
 * @param adapter The runtime adapter implementation
 */
export function createOpenClawTaskTool(adapter) {
  return createTool({
    id: "openclaw_task_executor",
    description:
      "Execute a task within a specific OpenClaw Agent Block on the Imagination Canvas. Requires a blockId and active sessionId.",
    inputSchema: OpenClawMastraToolInputSchema,
    execute: async (args) => {
      const { blockId, sessionId, task, requireApproval, policyOverrides } =
        args;
      try {
        // Construct the effective policy context for this task execution
        const effectivePolicy = {
          ...policyOverrides,
          ...(requireApproval !== undefined
            ? {
                requireHumanApprovalForShell: requireApproval,
                requireHumanApprovalForFileWrites: requireApproval,
                requireHumanApprovalForExternalMessages: requireApproval,
                requireHumanApprovalForPurchases: requireApproval,
                requireHumanApprovalForCredentialAccess: requireApproval,
              }
            : {}),
        };
        const result = await adapter.startTask(
          blockId,
          sessionId,
          task,
          effectivePolicy,
        );
        return {
          taskId: result.taskId || "unknown",
          status: result.status || "started",
          summary: `Task submitted to OpenClaw Block ${blockId}`,
        };
      } catch (err) {
        return {
          taskId: "none",
          status: "failed",
          summary: err.message || "Failed to execute OpenClaw task",
        };
      }
    },
  });
}
