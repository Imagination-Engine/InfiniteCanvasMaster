import { describe, it, expect } from 'vitest';
import { orchestrator } from './orchestrator.js';

describe('Imagination Orchestrator Agent', () => {
  it('should be initialized with correct metadata', () => {
    expect(orchestrator.name).toBe('Imagination Orchestrator');
    // id defaults to name if not provided
    expect(orchestrator.id).toBe('Imagination Orchestrator');
  });

  it('should have model defined', () => {
    expect(orchestrator.model).toBeDefined();
    expect((orchestrator.model as any).provider).toBe('GOOGLE');
  });
});
