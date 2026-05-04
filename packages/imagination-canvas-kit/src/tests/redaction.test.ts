// @ts-nocheck
import { describe, it, expect } from "vitest";
import { redactSensitivePayload } from "../utils/redaction";

describe("redactSensitivePayload", () => {
  it("should return non-objects unmodified", () => {
    expect(redactSensitivePayload("plain text")).toBe("plain text");
    expect(redactSensitivePayload(123)).toBe(123);
    expect(redactSensitivePayload(null)).toBe(null);
  });

  it("should redact top-level sensitive keys", () => {
    const payload = {
      id: "123",
      password: "super_secret_password",
      apiToken: "sk-123456789",
      sessionCookie: "abc-def",
    };

    const result = redactSensitivePayload(payload);

    expect(result.id).toBe("123");
    expect(result.password).toBe("[REDACTED]");
    expect(result.apiToken).toBe("[REDACTED]");
    expect(result.sessionCookie).toBe("[REDACTED]");
  });

  it("should recursively redact nested sensitive keys", () => {
    const payload = {
      event: "login",
      data: {
        user: "test@example.com",
        credentials: {
          secretKey: "hidden-value",
          publicInfo: "visible",
        },
      },
      headers: [
        { authorization: "Bearer token123" },
        { "Content-Type": "application/json" },
      ],
    };

    const result = redactSensitivePayload(payload);

    expect(result.data.user).toBe("test@example.com");
    expect(result.data.credentials.secretKey).toBe("[REDACTED]");
    expect(result.data.credentials.publicInfo).toBe("visible");
    expect(result.headers[0].authorization).toBe("[REDACTED]");
    expect(result.headers[1]["Content-Type"]).toBe("application/json");
  });
});
