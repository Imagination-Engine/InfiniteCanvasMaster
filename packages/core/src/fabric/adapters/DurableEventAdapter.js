// @ts-nocheck
import { createEnvelope } from "../envelope";
import { FabricTopics } from "../topics";
export class DurableEventAdapter {
  router;
  constructor(router) {
    this.router = router;
  }
  async recordFact(runId, type, payload) {
    const envelope = createEnvelope({
      lane: "durable_event",
      source: {
        type: "system",
        id: "durable-recorder",
        topic: FabricTopics.durableEvent(runId),
      },
      event: { type },
      delivery: { class: "durable" },
      runId,
      payload,
    });
    await this.router.publish(envelope);
  }
}
