import { describe, it, expect, vi } from "vitest";
import { a2aRouter } from "../a2a.js";
import jwt from "jsonwebtoken";

describe("A2A Bridge Route", () => {
  const JWT_SECRET = "super-secret-fallback-key";
  process.env.JWT_SECRET = JWT_SECRET;
  const token = jwt.sign({ sub: "user-1" }, JWT_SECRET);

  it("should return 401 if token is missing", async () => {
    const res = await a2aRouter.request("/stream?topic=test");
    expect(res.status).toBe(401);
  });

  it("should accept valid token and topic", async () => {
    // Note: streamSSE makes it hard to test the actual stream content in vitest request()
    // but we can at least check if it starts.
    const res = await a2aRouter.request(`/stream?token=${token}&topic=test`);
    expect(res.status).toBe(200);
  });

  it("adversarial: should return 401 for invalid token", async () => {
    const res = await a2aRouter.request("/stream?token=invalid&topic=test");
    expect(res.status).toBe(401);
  });
});
