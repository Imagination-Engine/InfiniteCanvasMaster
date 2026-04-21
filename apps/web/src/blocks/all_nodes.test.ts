import { describe, it, expect, vi } from 'vitest';
import { summarizerBlock } from './summarizer';
import { translatorBlock } from './translator';
import { colorSwapperBlock } from './colorSwapper';
import { filterBlock } from './filter';
import { webScraperBlock } from './webScraper';
import { formatterBlock } from './formatter';
import { programmerBlock } from './programmer';
import { gmailBlock } from './gmail';

describe('All Remaining Blocks (Refactoring)', () => {
  const blocks = [
    summarizerBlock,
    translatorBlock,
    colorSwapperBlock,
    filterBlock,
    webScraperBlock,
    formatterBlock,
    programmerBlock,
    gmailBlock
  ];

  blocks.forEach(block => {
    describe(`Block: ${block?.name}`, () => {
      it('should be defined', () => {
        expect(block).toBeDefined();
        expect(block.agent).toBeDefined();
      });

      it('should have a schema for input and output', () => {
        expect(block.input).toBeDefined();
        expect(block.output).toBeDefined();
      });
      
      it('should throw an error on malformed input (adversarial)', async () => {
        // Attempt to pass completely invalid data type
        const malformed = { text: 123, url: 123, action: 'invalid-action' };
        if (block.agent.invoke) {
          await expect(block.agent.invoke(malformed)).rejects.toThrow();
        }
      });
    });
  });
});
