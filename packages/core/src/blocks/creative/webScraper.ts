// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const WebScraperInput = z.object({
  url: z.string().url().optional().or(z.literal("")),
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
  description: "Extract text content from a URL.",
  category: "data",
  input: WebScraperInput,
  output: WebScraperOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "scrape_url",
    invoke: async (input: any) => {
      if (!input.url) return { text: "No URL provided to scrape." };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(input.url, { signal: controller.signal });
        const html = await res.text();
        return { text: html.substring(0, 2000) }; // Basic text output
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
