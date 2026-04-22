import { z } from "zod";
import { GenericBlockView } from "./GenericBlockView";
import type { BlockDefinition } from "@iem/core";

export const GmailInput = z.object({
  action: z.enum(["send", "retrieve"]),
  payload: z.any().optional(),
});

export const GmailOutput = z.object({
  result: z.any(),
});

export const gmailBlock: BlockDefinition<
  typeof GmailInput,
  typeof GmailOutput
> = {
  id: "iem.core.gmail",
  name: "Gmail",
  description: "Send or retrieve emails.",
  category: "io",
  input: GmailInput,
  output: GmailOutput,
  view: GenericBlockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gmail_action",
    invoke: async (input: unknown) => {
      const parsed = GmailInput.parse(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch("https://httpbin.org/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ json: z.any() });
        const validated = apiResponseSchema.parse(data);
        return { result: validated.json };
      } catch (err) {
        throw new Error(
          `Gmail block failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
