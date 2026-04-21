import { describe, it, expect } from 'vitest';
import { architectBlock, designerBlock, builderBlock, testerBlock } from './roleBlocks';

describe('Role Blocks (Red/Green Phase)', () => {
  describe('Architect', () => {
    it('has valid schema', () => {
      const validIn = { prompt: 'Make a todo app' };
      expect(architectBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe('Designer', () => {
    it('has valid schema', () => {
      const validIn = { prompt: 'Make it blue' };
      expect(designerBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe('Builder', () => {
    it('has valid schema', () => {
      const validIn = { context: 'context' };
      expect(builderBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe('Tester', () => {
    it('has valid schema', () => {
      const validIn = { strict: true };
      expect(testerBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe('Adversarial Schema Tests', () => {
    it('rejects invalid inputs', () => {
      expect(() => architectBlock.input.parse({ prompt: 123 })).toThrow();
      expect(() => designerBlock.input.parse({ prompt: false })).toThrow();
    });
  });
});