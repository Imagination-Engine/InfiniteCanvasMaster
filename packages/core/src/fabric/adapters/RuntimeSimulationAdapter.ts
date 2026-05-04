// @ts-nocheck
import { createEnvelope } from "../envelope";
import { FabricRouter } from "../transport";

export class RuntimeSimulationAdapter {
  constructor(private router: FabricRouter) {}

  async emitTick(simulationId: string, state: any) {
    const envelope = createEnvelope({
      lane: "runtime_simulation",
      source: { type: "runtime", id: simulationId },
      event: { type: "sim.tick" },
      delivery: { class: "realtime_low_latency" },
      payload: state,
    });

    await this.router.publish(envelope);
  }
}
