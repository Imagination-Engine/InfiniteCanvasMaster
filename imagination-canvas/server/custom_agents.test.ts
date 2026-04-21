import { describe, it, expect, vi } from 'vitest';
import { Pool } from 'pg';

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn().mockResolvedValue({ rows: [{ id: 'test-id' }] })
}));

vi.mock('pg', () => {
  return {
    Pool: class {
      query = mockQuery;
    }
  };
});

import { saveCustomAgent } from './custom_agents';

describe('Custom Agents Persistence', () => {
  it('should save a custom agent to the database', async () => {
    
    const agentData = {
      userId: 'user-123',
      name: 'Test Agent',
      tagline: 'A test agent',
      story: 'Once upon a time...',
      persona: { tone: 'formal' },
      skills: ['web_search'],
      purpose: 'To test',
      blockDefinition: { id: 'test.agent' }
    };

    await saveCustomAgent(agentData);
    
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO custom_agents'),
      expect.any(Array)
    );
  });

  it('should only retrieve agents belonging to the requesting user (adversarial)', async () => {
    const { getCustomAgents } = await import('./custom_agents');
    
    const userId = 'user-123';
    await getCustomAgents(userId);
    
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE owner_id = $1'),
      [userId]
    );
  });
});
