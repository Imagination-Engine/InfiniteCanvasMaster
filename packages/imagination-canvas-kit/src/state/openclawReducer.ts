import { OpenClawBlock, OpenClawBlockEvent } from "../contracts/openclaw";

/**
 * State reducer for OpenClaw Block events.
 * Transitions block metadata based on the incoming typed event stream.
 */
export function openclawBlockReducer(
  state: OpenClawBlock,
  event: OpenClawBlockEvent,
): OpenClawBlock {
  const newState = {
    ...state,
    state: {
      ...(state.state || { status: "unconfigured", approvalQueue: [] }),
    },
  };

  newState.state.lastEventAt = event.timestamp;
  if (!newState.state.approvalQueue) newState.state.approvalQueue = [];

  switch (event.type) {
    case "openclaw.task.started":
      newState.state.status = "running";
      newState.state.currentTaskId = event.taskId;
      newState.state.progress = 0;
      break;

    case "openclaw.task.progress":
      newState.state.progress = event.progress;
      newState.state.currentTask = event.message;
      break;

    case "openclaw.task.completed":
      newState.state.status = "completed";
      newState.state.progress = 100;
      break;

    case "openclaw.task.failed":
      newState.state.status = "failed";
      newState.state.error = event.error;
      break;

    case "openclaw.tool.started":
      newState.state.status = "using_tool";
      newState.state.activeToolName = event.toolName;
      break;

    case "openclaw.tool.completed":
      newState.state.status = "running";
      newState.state.activeToolName = undefined;
      break;

    case "openclaw.approval.required":
      newState.state.status = "waiting_for_approval";
      newState.state.approvalQueue.push(event.request);
      break;

    case "openclaw.approval.approved":
    case "openclaw.approval.denied":
      newState.state.approvalQueue = newState.state.approvalQueue.filter(
        (req) => req.requestId !== event.requestId,
      );
      if (newState.state.approvalQueue.length === 0) {
        newState.state.status = "running";
      }
      break;

    case "openclaw.runtime.error":
      newState.state.status = "failed";
      newState.state.error = event.error;
      break;

    case "openclaw.runtime.disconnected":
      newState.state.status = "offline";
      if (newState.runtime) {
        newState.runtime.connectionStatus = "disconnected";
      }
      break;

    case "openclaw.runtime.bound":
      if (!newState.runtime) newState.runtime = {} as any;
      newState.runtime = { ...newState.runtime, ...event.runtime };
      newState.state.status = "ready";
      break;
  }

  return newState;
}
