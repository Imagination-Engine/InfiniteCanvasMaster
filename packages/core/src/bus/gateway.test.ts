// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { A2AGateway } from "./gateway";
import { LocalEventEmitterTransport } from "./transport";

describe("A2AGateway", () => {
  it("should forward messages based on rules", async () => {
    const local = new LocalEventEmitterTransport();
    const remote = new LocalEventEmitterTransport();
    const remoteSpy = vi.spyOn(remote, "publish");

    const gateway = new A2AGateway(local);
    gateway.addRule({
      topicPattern: "cloud.*",
      action: "forward",
      targetTransport: remote,
    });

    const envelope = {
      id: "1",
      event: { type: "test", timestamp: new Date().toISOString() },
      source: { id: "a" },
    } as any;
    await local.publish("cloud.test", envelope);

    expect(remoteSpy).toHaveBeenCalled();
  });
});
