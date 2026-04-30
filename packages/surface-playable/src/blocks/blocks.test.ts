import { describe, it, expect } from 'vitest';
import { sceneBlock, characterBlock, inputBlock, ruleBlock } from './gameBlocks';

describe('Game Blocks (Red/Green Phase)', () => {
  describe('Scene Block', () => {
    it('should have correct metadata', () => {
      expect(sceneBlock.id).toBe('iem.playable.scene');
      expect(sceneBlock.name).toBe('Scene');
    });
    
    it('should have valid schema inputs and outputs', () => {
      const validIn = { background: 'sky', width: 800, height: 600 };
      expect(sceneBlock.input.parse(validIn)).toEqual(validIn);
      const validOut = { sceneId: '123', status: 'ready' };
      expect(sceneBlock.output.parse(validOut)).toEqual(validOut);
    });
  });

  describe('Character Block', () => {
    it('should have correct metadata', () => {
      expect(characterBlock.id).toBe('iem.playable.character');
      expect(characterBlock.name).toBe('Character');
    });
    
    it('should have valid schema inputs and outputs', () => {
      const validIn = { name: 'Hero', asset: 'hero.png', x: 0, y: 0 };
      expect(characterBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe('Input Block', () => {
    it('should have correct metadata', () => {
      expect(inputBlock.id).toBe('iem.playable.input');
      expect(inputBlock.name).toBe('Input');
    });
  });

  describe('Rule Block', () => {
    it('should have correct metadata', () => {
      expect(ruleBlock.id).toBe('iem.playable.rule');
      expect(ruleBlock.name).toBe('Rule');
    });
  });

  describe('Adversarial Schema Tests', () => {
    it('adversarial: throws on malformed scene inputs', () => {
      expect(() => sceneBlock.input.parse({})).toThrow();
      expect(() => sceneBlock.input.parse({ background: 123 })).toThrow();
    });

    it('adversarial: character block throws on missing required fields', () => {
      expect(() => characterBlock.input.parse({ name: 'Hero' })).toThrow(); // missing asset
      expect(() => characterBlock.input.parse({ asset: 'hero.png' })).toThrow(); // missing name
    });
  });
});