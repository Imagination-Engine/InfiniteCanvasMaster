// @ts-nocheck
import { createEnvelope } from "../envelope";
import { FabricTopics } from "../topics";
export class MastraDagFabricAdapter {
  router;
  runId;
  traceId;
  constructor(router, runId, traceId) {
    this.router = router;
    this.runId = runId;
    this.traceId = traceId;
  }
  async emitWorkflowStarted(input) {
    const envelope = createEnvelope({
      lane: "workflow_trace",
      source: {
        type: "workflow",
        id: "mastra-compiler",
        topic: FabricTopics.workflowTrace(this.runId),
      },
      event: { type: "run.started" },
      delivery: { class: "ephemeral" },
      traceId: this.traceId,
      runId: this.runId,
      payload: input,
    });
    await this.router.publish(envelope);
  }
  async emitNodeOutput(nodeId, output) {
    const envelope = createEnvelope({
      lane: "agent_stream",
      source: {
        type: "block",
        id: nodeId,
        topic: FabricTopics.workflowNodeOutput(this.runId, nodeId),
      },
      event: { type: "node.output" },
      delivery: { class: "replayable" },
      traceId: this.traceId,
      runId: this.runId,
      payload: output,
    });
    await this.router.publish(envelope);
    // Also mirror to durable_event if critical (using helper)
    const durableEnvelope = createEnvelope({
      ...envelope,
      lane: "durable_event",
      source: {
        ...envelope.source,
        topic: FabricTopics.durableEvent(this.runId),
      },
      delivery: { class: "durable" },
      id: undefined, // New ID
      event: { type: envelope.event.type }, // Explicitly pass type to avoid missing timestamp error if createEnvelope logic changed
    });
    await this.router.publish(durableEnvelope);
  }
}
