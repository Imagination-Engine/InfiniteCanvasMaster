import { createOpenClawTaskTool } from "./taskTool";
import { createOpenClawWorkflowStep } from "./workflowStep";
export const createOpenClawIntegrations = (adapter) => {
  return {
    openclawTaskTool: createOpenClawTaskTool(adapter),
    openclawWorkflowStep: createOpenClawWorkflowStep(adapter),
  };
};
export { createOpenClawTaskTool, createOpenClawWorkflowStep };
