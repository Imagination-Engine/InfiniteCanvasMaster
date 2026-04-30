import { describe, it, expect } from 'vitest';
import { parseConfig } from './setup-models';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Model Onboarding Script (Red/Green Phase)', () => {
  it('parses the target models from a config file', () => {
    const tempConfigPath = path.join(__dirname, 'temp-models.json');
    const mockConfig = { models: ['hermes3', 'qwen2.5-coder:7b'] };
    fs.writeFileSync(tempConfigPath, JSON.stringify(mockConfig));

    const models = parseConfig(tempConfigPath);
    expect(models).toEqual(['hermes3', 'qwen2.5-coder:7b']);

    fs.unlinkSync(tempConfigPath);
  });

  it('throws an error if config is missing or malformed', () => {
    const tempConfigPath = path.join(__dirname, 'missing.json');
    expect(() => parseConfig(tempConfigPath)).toThrow();
  });
});