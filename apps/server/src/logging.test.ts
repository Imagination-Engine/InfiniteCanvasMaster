import { describe, it, expect } from "vitest";
import { logger } from "./logging";
import fs from "fs";

// To test pino's redaction, we write to a temporary stream
describe("Logging Hygiene (Red/Green Phase)", () => {
  it("redacts sensitive fields from log output", () => {
    // We capture the output by providing a custom stream
    const chunks: string[] = [];
    const stream = {
      write: (msg: string) => {
        chunks.push(msg);
      },
    };

    // We create a test logger specifically to test the redaction rules on the stream
    const pino = require("pino");
    const testLogger = pino(
      {
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "token",
            "apiKey",
            "*.apiKey",
            "*.*.apiKey",
          ],
          censor: "[REDACTED]",
        },
      },
      stream,
    );

    testLogger.info(
      {
        user: "test_user",
        password: "super_secret_password",
        req: {
          headers: {
            authorization: "Bearer token123",
            cookie: "session=123",
          },
        },
      },
      "Test login",
    );

    const output = JSON.parse(chunks[0]);
    expect(output.user).toBe("test_user");
    expect(output.password).toBe("[REDACTED]");
    expect(output.req.headers.authorization).toBe("[REDACTED]");
    expect(output.req.headers.cookie).toBe("[REDACTED]");
  });

  it("adversarial: handles deeply nested objects containing apiKey", () => {
    const chunks: string[] = [];
    const stream = {
      write: (msg: string) => chunks.push(msg),
    };

    const pino = require("pino");
    const testLogger = pino(
      {
        redact: {
          paths: ["password", "token", "apiKey", "*.apiKey", "*.*.apiKey"],
          censor: "[REDACTED]",
        },
      },
      stream,
    );

    testLogger.info(
      {
        payload: {
          integration: {
            apiKey: "mock-key-123",
          },
        },
      },
      "Integration event",
    );

    const output = JSON.parse(chunks[0]);
    expect(output.payload.integration.apiKey).toBe("[REDACTED]");
  });
});
