import { createEnvelope } from "../envelope";
import { FabricRouter } from "../transport";
import { FabricTopics } from "../topics";

export class DurableEventAdapter {
  constructor(private router: FabricRouter) {}

  async recordFact(runId: string, type: string, payload: any) {
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
