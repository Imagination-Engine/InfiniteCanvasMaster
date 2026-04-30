import { describe, it, expect } from 'vitest';
import { ExportManager } from './ExportManager';

describe('ExportManager (Red/Green/Refactor)', () => {
  it('generates a playable artifact URL based on canvas ID', () => {
    const url = ExportManager.generateArtifactUrl('canvas_123');
    expect(url).toContain('/play/canvas_123');
  });

  it('generates an invite link with a deterministic room ID', () => {
    const link = ExportManager.generateInviteLink('canvas_123');
    expect(link).toContain('/join/canvas_123');
  });

  it('adversarial: handles empty canvas IDs by throwing an error', () => {
    expect(() => ExportManager.generateArtifactUrl('')).toThrow('Canvas ID cannot be empty');
    expect(() => ExportManager.generateInviteLink('')).toThrow('Canvas ID cannot be empty');
  });
});