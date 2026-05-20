import crypto from "crypto";
/**
 * Creates a valid v2 BalnceEnvelope.
 */
export function createEnvelope(params) {
  const { event, ...rest } = params;
  return {
    protocol: "balnce.fabric",
    version: "0.2.0",
    id: params.id || crypto.randomUUID(),
    traceId: params.traceId || crypto.randomUUID(),
    ...rest,
    event: {
      timestamp: new Date().toISOString(),
      ...event,
    },
  };
}
export function upgradeLegacyEnvelope(legacy) {
  // Map v1 fields to v2
  return createEnvelope({
    id: legacy.id,
    traceId: legacy.traceId,
    runId: legacy.runId,
    lane: legacy.lane || "agent_stream",
    source: legacy.source || { type: "system", id: "legacy-bridge" },
    event: legacy.event || { type: "legacy.event" },
    delivery: legacy.delivery || { class: "ephemeral" },
    payload: legacy.payload,
    instruction: legacy.instruction,
    context: legacy.context,
    policy: legacy.policy,
    provenance: legacy.provenance,
  });
}
export function validateEnvelope(envelope) {
  return !!(
    envelope &&
    envelope.protocol === "balnce.fabric" &&
    envelope.version === "0.2.0" &&
    typeof envelope.id === "string" &&
    typeof envelope.lane === "string" &&
    envelope.source &&
    envelope.event &&
    envelope.delivery
  );
}
