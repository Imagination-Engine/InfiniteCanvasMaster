import { z } from "zod";

export const BalnceEnvelopeSchema = z.object({
  id: z.string(),
  traceId: z.string(),
  sourceId: z.string(),
  targetId: z.string().optional(),
  instruction: z.string().optional(),
  context: z.record(z.any()).default({}),
  payload: z.any(),
  timestamp: z.number(),
});

export type BalnceEnvelope<T = any> = z.infer<typeof BalnceEnvelopeSchema> & {
  payload: T;
};

export function wrapInEnvelope<T>(
  params: Omit<BalnceEnvelope<T>, "id" | "timestamp">,
): BalnceEnvelope<T> {
  const { randomUUID } = require("crypto");
  return {
    id: randomUUID(),
    timestamp: Date.now(),
    ...params,
  };
}

export function serializeEnvelope(envelope: BalnceEnvelope<any>): string {
  // NDJSON compatible single line serialization
  return JSON.stringify(envelope);
}
