import pino from "pino";

// Centralized, auto-redacting logger as defined in Section 5.4
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
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
  // In development, we use pino-pretty for readability, otherwise standard JSON
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
});
