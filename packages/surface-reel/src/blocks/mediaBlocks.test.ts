import { describe, it, expect, vi } from 'vitest';
import { textToImageBlock, textToSpeechBlock } from './mediaBlocks';

describe('Media Provider Integrations (Red/Green Phase)', () => {
  describe('TextToImage (Nanobanana)', () => {
    it('has valid metadata and schema', () => {
      expect(textToImageBlock.id).toBe('iem.reel.textToImage');
      const validIn = { prompt: 'A futuristic city', style: 'anime' };
      expect(textToImageBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('generates an image URL upon successful API call', async () => {
      const output = await textToImageBlock.agent.invoke({ prompt: 'A futuristic city', style: 'anime' });
      expect(output).toHaveProperty('imageUrl');
      expect(output.imageUrl).toContain('http');
    });
  });

  describe('TextToSpeech (ElevenLabs)', () => {
    it('has valid metadata and schema', () => {
      expect(textToSpeechBlock.id).toBe('iem.reel.textToSpeech');
      const validIn = { text: 'Hello world', voiceId: 'voice_123' };
      expect(textToSpeechBlock.input.parse(validIn)).toEqual(validIn);
    });

    it('generates an audio URL upon successful API call', async () => {
      const output = await textToSpeechBlock.agent.invoke({ text: 'Hello world', voiceId: 'voice_123' });
      expect(output).toHaveProperty('audioUrl');
      expect(output.audioUrl).toContain('http');
    });
  });

  describe('Adversarial Schema Tests & API Limits', () => {
    it('adversarial: throws on missing prompt for TextToImage', () => {
      expect(() => textToImageBlock.input.parse({ style: 'anime' })).toThrow();
    });

    it('adversarial: throws on missing text for TextToSpeech', () => {
      expect(() => textToSpeechBlock.input.parse({ voiceId: 'voice_123' })).toThrow();
    });

    it('adversarial: handles API rate limits for Nanobanana simulating a 429 response', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Rate limit exceeded (429)'));
      const oldInvoke = textToImageBlock.agent.invoke;
      textToImageBlock.agent.invoke = mockInvoke;

      await expect(textToImageBlock.agent.invoke({ prompt: 'Test', style: 'anime' }))
        .rejects.toThrow('Rate limit exceeded');

      textToImageBlock.agent.invoke = oldInvoke; // Restore
    });

    it('adversarial: handles invalid parameters simulating a 400 response from ElevenLabs', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Invalid voice ID (400)'));
      const oldInvoke = textToSpeechBlock.agent.invoke;
      textToSpeechBlock.agent.invoke = mockInvoke;

      await expect(textToSpeechBlock.agent.invoke({ text: 'Test', voiceId: 'invalid_voice' }))
        .rejects.toThrow('Invalid voice ID');

      textToSpeechBlock.agent.invoke = oldInvoke; // Restore
    });
  });
});