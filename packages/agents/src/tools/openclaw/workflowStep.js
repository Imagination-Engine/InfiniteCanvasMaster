import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
export const createOpenClawWorkflowStep = (adapter) =>
  createStep({
    id: "openclaw-executor-step",
    description:
      "Executes a task on an OpenClaw block, pausing for human approval if required by policy.",
    inputSchema: z.object({
      blockId: z.string(),
      sessionId: z.string(),
      task: z.string(),
      policyOverrides: z.record(z.any()).optional(),
    }),
    outputSchema: z.object({
      taskId: z.string(),
      status: z.string(),
      approved: z.boolean(),
    }),
    execute: async (params) => {
      const suspend = params.suspend;
      const inputData = params.context || params; // Provide fallback mapping
      const { blockId, sessionId, task, policyOverrides } = inputData;
      const result = await adapter.startTask(
        blockId,
        sessionId,
        task,
        policyOverrides,
      );
      if (result.status === "waiting_for_approval") {
        console.log(
          `[OpenClaw Workflow Step] Task ${result.taskId} requires human approval. Suspending workflow.`,
        );
        const resumePayload = await suspend(
          `Approval required for task: ${task}`,
        );
        if (resumePayload && resumePayload.approved === true) {
          await adapter.approveAction(
            blockId,
            resumePayload.requestId || result.requestId,
          );
          return {
            taskId: result.taskId,
            status: "resumed",
            approved: true,
          };
        } else {
          await adapter.denyAction(
            blockId,
            resumePayload?.requestId || result.requestId,
          );
          throw new Error("Human denied the OpenClaw task execution.");
        }
      }
      return {
        taskId: result.taskId || "unknown",
        status: result.status || "completed",
        approved: true,
      };
    },
  });
