import crypto from "crypto";
import { BalnceEnvelope } from "./protocol";

export function signEnvelope(envelope: BalnceEnvelope, secret: string): string {
  // Simple HMAC-SHA256 signature for the envelope content
  const content = JSON.stringify({
    id: envelope.id,
    payload: envelope.payload,
    timestamp: envelope.event.timestamp,
  });

  return crypto.createHmac("sha256", secret).update(content).digest("hex");
}

export function verifyEnvelopeSignature(
  envelope: BalnceEnvelope,
  signature: string,
  secret: string,
): boolean {
  const expected = signEnvelope(envelope, secret);
  return expected === signature;
}
