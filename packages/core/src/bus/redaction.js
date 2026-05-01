export function redactPayload(payload, level = "full") {
  if (!payload || typeof payload !== "object") return payload;
  if (level === "none") return payload;
  if (level === "full") {
    return { redacted: true, level: "full" };
  }
  // Compact redaction: keep keys, redact values
  const redacted = {};
  for (const key in payload) {
    const val = payload[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      redacted[key] = redactPayload(val, "compact");
    } else {
      redacted[key] = "[REDACTED]";
    }
  }
  return redacted;
}
