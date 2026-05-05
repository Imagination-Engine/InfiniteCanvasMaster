export type BalnceFabricLane =
  | "document_state"
  | "presence"
  | "agent_stream"
  | "command_control"
  | "workflow_trace"
  | "runtime_simulation"
  | "durable_event"
  | "provenance"
  | "ui_projection";

export const BALNCE_FABRIC_LANES: BalnceFabricLane[] = [
  "document_state",
  "presence",
  "agent_stream",
  "command_control",
  "workflow_trace",
  "runtime_simulation",
  "durable_event",
  "provenance",
  "ui_projection",
];
