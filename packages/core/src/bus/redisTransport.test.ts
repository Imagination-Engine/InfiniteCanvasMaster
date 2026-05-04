// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { RedisA2ATransport } from "./redisTransport";

describe("RedisA2ATransport", () => {
  it("should provide publish scaffold", async () => {
    const transport = new RedisA2ATransport({});
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      transport.publish("test.topic", {} as any),
    ).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[REDIS-A2A] Publishing to test.topic via Redis...",
    );

    consoleSpy.mockRestore();
  });

  it("should provide subscribe scaffold", () => {
    const transport = new RedisA2ATransport({});
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const sub = transport.subscribe("test.topic", () => {});
    expect(sub.unsubscribe).toBeDefined();

    sub.unsubscribe();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[REDIS-A2A] Unsubscribing from test.topic",
    );

    consoleSpy.mockRestore();
  });
});
