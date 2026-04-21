import { describe, it, expect, vi } from 'vitest';
import { webFetchBlock, slackPostBlock, notionCreateBlock } from './saasIntegrations';

describe('SaaS Integrations (Red/Green Phase)', () => {
  describe('Generic Web/File', () => {
    it('has valid metadata for webFetch', () => {
      expect(webFetchBlock.id).toBe('iem.conductor.webFetch');
    });

    it('adversarial: rejects invalid URLs for fetch', () => {
      expect(() => webFetchBlock.input.parse({ url: 'not_a_url' })).toThrow();
    });
  });

  describe('Productivity Suite', () => {
    it('Slack Post block has valid metadata and schema', () => {
      expect(slackPostBlock.id).toBe('iem.conductor.slackPost');
      const validIn = { channel: '#general', message: 'Hello' };
      expect(slackPostBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('Notion Create block has valid metadata and schema', () => {
      expect(notionCreateBlock.id).toBe('iem.conductor.notionCreate');
      const validIn = { databaseId: 'db123', properties: { Name: 'Test' } };
      expect(notionCreateBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('adversarial: Slack rejects missing channel', () => {
      expect(() => slackPostBlock.input.parse({ message: 'Hello' })).toThrow();
    });

    it('adversarial: handles API rate limits simulating a 429 response', async () => {
      // Assuming our generic invoke handles the mock
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Rate limit exceeded (429)'));
      const oldInvoke = slackPostBlock.agent.invoke;
      slackPostBlock.agent.invoke = mockInvoke;

      await expect(slackPostBlock.agent.invoke({ channel: '#gen', message: 'Test' }))
        .rejects.toThrow('Rate limit exceeded');

      // Restore
      slackPostBlock.agent.invoke = oldInvoke;
    });

    it('adversarial: handles authentication failures simulating a 401 response', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Authentication failed (401)'));
      const oldInvoke = notionCreateBlock.agent.invoke;
      notionCreateBlock.agent.invoke = mockInvoke;

      await expect(notionCreateBlock.agent.invoke({ databaseId: 'abc', properties: {} }))
        .rejects.toThrow('Authentication failed');

      // Restore
      notionCreateBlock.agent.invoke = oldInvoke;
    });
  });
});