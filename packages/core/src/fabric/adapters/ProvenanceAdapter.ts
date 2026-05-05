// @ts-nocheck
import { createEnvelope } from "../envelope";
import { FabricRouter } from "../transport";
import { FabricTopics } from "../topics";

export class ProvenanceAdapter {
  constructor(private router: FabricRouter) {}

  async recordProvenance(traceId: string, eventType: string, payload: any) {
    const envelope = createEnvelope({
      lane: "provenance",
      source: {
        type: "system",
        id: "provenance-logger",
        topic: FabricTopics.provenanceRecord(traceId),
      },
      event: { type: eventType },
      delivery: { class: "provenance_required" },
      traceId,
      payload,
    });

    await this.router.publish(envelope);
  }
}
