import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the database pool and saveCustomAgent BEFORE importing app
vi.mock('./db', () => ({
  pool: { 
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    })
  }
}));

vi.mock('./custom_agents', () => ({
  saveCustomAgent: vi.fn().mockResolvedValue('mock-agent-id'),
  getCustomAgents: vi.fn()
}));

// Provide a fake auth object attached to the request
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn().mockReturnValue({ sub: 'test-user-id', username: 'testuser' })
  }
}));

import { app } from './index';

describe('POST /api/custom-agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save a new custom agent and return the generated BlockDefinition', async () => {
    const payload = {
      story: 'A story',
      persona: { name: 'TestBot', tagline: 'I test things', tone: 'concise' },
      skills: ['web_search'],
      capabilities: { executionMode: 'triggered', outputTypes: [] },
      purpose: 'To test'
    };

    const res = await request(app)
      .post('/api/custom-agents')
      .send(payload)
      .set('Authorization', 'Bearer fake-valid-token');

    expect(res.status).toBe(201);
    expect(res.body.blockDefinition).toBeDefined();
    expect(res.body.blockDefinition.id).toMatch(/^iem\.user\./);
    expect(res.body.blockDefinition.name).toBe('TestBot');
  });

  it('should reject invalid payloads', async () => {
    const payload = { story: '' }; // Missing required fields

    const res = await request(app)
      .post('/api/custom-agents')
      .send(payload)
      .set('Authorization', 'Bearer fake-valid-token');

    expect(res.status).toBe(400);
  });
});
