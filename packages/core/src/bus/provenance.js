import crypto from "crypto";
export function signEnvelope(envelope, secret) {
  // Simple HMAC-SHA256 signature for the envelope content
  const content = JSON.stringify({
    id: envelope.id,
    payload: envelope.payload,
    timestamp: envelope.event.timestamp,
  });
  return crypto.createHmac("sha256", secret).update(content).digest("hex");
}
export function verifyEnvelopeSignature(envelope, signature, secret) {
  const expected = signEnvelope(envelope, secret);
  return expected === signature;
}
