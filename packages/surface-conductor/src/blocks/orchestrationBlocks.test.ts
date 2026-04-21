import { describe, it, expect } from 'vitest';
import { ifBlock, forEachBlock, webhookTriggerBlock, scheduleTriggerBlock } from './orchestrationBlocks';

describe('Orchestration Blocks (Red/Green Phase)', () => {
  describe('If Block', () => {
    it('has valid metadata and schema', () => {
      expect(ifBlock.id).toBe('iem.conductor.if');
      const validIn = { condition: 'data.value > 5', context: { data: { value: 10 } } };
      expect(ifBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('evaluates condition via agent execution', async () => {
      const output = await ifBlock.agent.invoke({ condition: 'true', context: {} });
      expect(output).toHaveProperty('branch', 'truePath');
    });
  });

  describe('ForEach Block', () => {
    it('has valid metadata and schema', () => {
      expect(forEachBlock.id).toBe('iem.conductor.foreach');
      const validIn = { collection: [1, 2, 3] };
      expect(forEachBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('returns items for scheduler', async () => {
      const output = await forEachBlock.agent.invoke({ collection: ['a', 'b'], loopTarget: 'next_block' });
      expect(output).toHaveProperty('items', ['a', 'b']);
      expect(output).toHaveProperty('loopTarget', 'next_block');
    });
  });

  describe('Trigger Blocks', () => {
    it('Webhook Trigger has valid metadata', () => {
      expect(webhookTriggerBlock.id).toBe('iem.conductor.webhook');
      expect(webhookTriggerBlock.mode).toBe('ambient');
    });

    it('Schedule Trigger has valid metadata', () => {
      expect(scheduleTriggerBlock.id).toBe('iem.conductor.schedule');
      expect(scheduleTriggerBlock.mode).toBe('ambient');
    });
  });

  describe('Adversarial Schema Tests', () => {
    it('If block rejects malformed input', () => {
      expect(() => ifBlock.input.parse({ condition: 123 })).toThrow();
    });

    it('ForEach block rejects non-array collection', () => {
      expect(() => forEachBlock.input.parse({ collection: "not_an_array" })).toThrow();
    });
  });
});