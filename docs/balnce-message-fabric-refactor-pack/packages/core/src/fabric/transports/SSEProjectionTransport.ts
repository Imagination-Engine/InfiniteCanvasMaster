import type { BalnceEnvelope } from "../envelope";
import type {
  FabricHandler,
  FabricSubscriptionFilter,
  FabricTransport,
  FabricTransportCapability,
  FabricUnsubscribe,
} from "../transport";

export class SSEProjectionTransport implements FabricTransport {
  readonly id = "sse_projection";
  readonly kind = "ui_projection";

  async publish<T>(_envelope: BalnceEnvelope<T>): Promise<void> {
    // Implementation agents must connect this to the app's actual SSE response registry.
    // This class is projection-only; it must never be used for command/control.
  }

  async subscribe<T>(
    _filter: FabricSubscriptionFilter,
    _handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe> {
    // SSE is generally server-to-client projection. Subscription here may attach to
    // an internal projection registry if the app uses one.
    return () => {};
  }

  supports(capability: FabricTransportCapability): boolean {
    return (
      capability.lane === "agent_stream" ||
      capability.lane === "workflow_trace" ||
      capability.lane === "ui_projection"
    );
  }
}
