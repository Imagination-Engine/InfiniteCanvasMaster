import { z } from 'zod';
import { GenericBlockView } from './GenericBlockView';
import type { BlockDefinition } from '../block/protocol';

export const WebScraperInput = z.object({
  url: z.string().url(),
});

export const WebScraperOutput = z.object({
  text: z.string(),
});

export const webScraperBlock: BlockDefinition<typeof WebScraperInput, typeof WebScraperOutput> = {
  id: 'iem.core.webScraper',
  name: 'Web Scraper',
  description: 'Scrape URL.',
  category: 'io',
  input: WebScraperInput,
  output: WebScraperOutput,
  view: GenericBlockView,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'web_scrape',
    invoke: async (input: unknown) => {
      WebScraperInput.parse(input);
      return { text: 'mock-scraped-text' };
    }
  }
};