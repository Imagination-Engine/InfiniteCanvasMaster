// @ts-nocheck
import { describe, it, expect } from "vitest";
import { OpenClawTaskAdapter } from "./adapters";
import { BalnceEnvelope } from "./protocol";

describe("OpenClawTaskAdapter", () => {
  it("should merge payloads into taskContext", () => {
    const adapter = new OpenClawTaskAdapter();
    const envelopes: BalnceEnvelope[] = [
      { payload: { result: "Task A done" } } as any,
      { payload: { summary: "Task B summary" } } as any,
    ];

    const result = adapter.fromEnvelopeBatch({
      envelopes,
      baseInput: { original: "input" },
    } as any);

    expect(result).toEqual({
      original: "input",
      taskContext: "Task A done\n\nTask B summary",
    });
  });

  it("should not add taskContext if no relevant payload exists", () => {
    const adapter = new OpenClawTaskAdapter();
    const envelopes: BalnceEnvelope[] = [{ payload: { other: "data" } } as any];

    const result = adapter.fromEnvelopeBatch({
      envelopes,
      baseInput: { original: "input" },
    } as any);

    expect(result).toEqual({ original: "input" });
  });
});
