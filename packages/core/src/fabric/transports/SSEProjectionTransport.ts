// @ts-nocheck
import {
  FabricTransport,
  FabricSubscriptionFilter,
  FabricHandler,
  FabricUnsubscribe,
} from "../transport";
import { BalnceEnvelope } from "../envelope";
import { BalnceFabricLane } from "../lanes";

export class SSEProjectionTransport implements FabricTransport {
  readonly id = "sse-projection";
  readonly kind = "projection";

  private allowedLanes: BalnceFabricLane[] = [
    "agent_stream",
    "workflow_trace",
    "ui_projection",
  ];

  async publish<T>(envelope: BalnceEnvelope<T>): Promise<void> {
    // SSE is read-only projection. Backend components should not publish "to" SSE.
    // The Router handles mirroring events to SSE if a subscriber is active.
    throw new Error(
      "SSEProjectionTransport does not support direct publication. Use subscription mirroring.",
    );
  }

  async subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    // Verify that the requested lanes are projection-safe
    if (filter.lanes) {
      const unsafe = filter.lanes.filter((l) => !this.allowedLanes.includes(l));
      if (unsafe.length > 0) {
        throw new Error(
          `SSE projection forbidden for lanes: ${unsafe.join(", ")}`,
        );
      }
    }

    // In a real implementation, this would manage the actual HTTP stream/connection.
    // For the Core package, it provides the hook for the Server route to tap into.

    return () => {
      // Cleanup
    };
  }

  /**
   * Encodes an envelope for SSE delivery.
   */
  encode(envelope: BalnceEnvelope): string {
    return JSON.stringify(envelope);
  }
}
