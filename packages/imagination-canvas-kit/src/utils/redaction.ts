// @ts-nocheck
/**
 * Redacts sensitive keys from event payloads before they reach the UI or state.
 */
export function redactSensitivePayload(payload: any): any {
  if (!payload) return payload;
  if (typeof payload !== "object") return payload;

  const sensitiveKeys = [
    "token",
    "password",
    "secret",
    "key",
    "credential",
    "authorization",
    "cookie",
    "session",
    "private",
  ];

  if (Array.isArray(payload)) {
    return payload.map(redactSensitivePayload);
  }

  const redacted: any = {};
  for (const [k, v] of Object.entries(payload)) {
    const keyLower = k.toLowerCase();
    if (sensitiveKeys.some((sk) => keyLower.includes(sk))) {
      redacted[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null) {
      redacted[k] = redactSensitivePayload(v);
    } else {
      redacted[k] = v;
    }
  }
  return redacted;
}
