import { describe, it, expect } from 'vitest';
import { graphKnowledgeBlock } from './graphKnowledgeBlock';

describe('GraphKnowledge Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect(graphKnowledgeBlock.id).toBe('iem.atlas.graphKnowledge');
    expect(graphKnowledgeBlock.name).toBe('GraphKnowledge');
    
    const validIn = { payload: 'test' };
    expect(graphKnowledgeBlock.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await graphKnowledgeBlock.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => graphKnowledgeBlock.input.parse({ payload: 123 })).toThrow();
  });
});
