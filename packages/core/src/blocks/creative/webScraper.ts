import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const WebScraperInput = z.object({
  url: z.string().url(),
});

export const WebScraperOutput = z.object({
  text: z.string(),
});

export const webScraperBlock: BlockDefinition<
  typeof WebScraperInput,
  typeof WebScraperOutput
> = {
  id: "iem.core.webScraper",
  name: "Web Scraper",
  description: "Scrape URL.",
  category: "io",
  input: WebScraperInput,
  output: WebScraperOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "web_scrape",
    invoke: async (input: unknown) => {
      const parsed = WebScraperInput.parse(input);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(parsed.url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        return { text: text.substring(0, 5000) }; // limit size to prevent massive text output
      } catch (err) {
        throw new Error(
          `Web Scraper failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
