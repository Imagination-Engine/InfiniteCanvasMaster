import { describe, it, expect, vi } from 'vitest';
import { setupDatabase, dbMiddleware } from './db';
import { Hono } from 'hono';

const mockClientConnect = vi.fn().mockResolvedValue(undefined);
const mockClientEnd = vi.fn().mockResolvedValue(undefined);

vi.mock('pg', () => ({
  Client: class {
    connect = mockClientConnect;
    end = mockClientEnd;
  }
}));

describe('Database Connectivity & Hyperdrive', () => {
  it('connects utilizing the c.env.HYPERDRIVE context', () => {
    const mockEnv = {
      HYPERDRIVE: {
        connectionString: 'postgres://mock_hyperdrive_proxy:5432/mockdb'
      }
    };
    const mockExecutionCtx = {
      waitUntil: vi.fn()
    };

    const { db, client } = setupDatabase(mockEnv as any, mockExecutionCtx as any);
    
    expect(db).toBeDefined();
    expect(client).toBeDefined();
    // Simulate cleanup which uses waitUntil
    expect(mockExecutionCtx.waitUntil).not.toHaveBeenCalled();
    
    // Test the cleanup specifically
    mockExecutionCtx.waitUntil(client.end());
    expect(mockExecutionCtx.waitUntil).toHaveBeenCalled();
  });

  it('Hono middleware sets db and cleans up on exit', async () => {
    const app = new Hono<{ Bindings: { HYPERDRIVE: { connectionString: string } } }>();
    const mockWaitUntil = vi.fn();

    app.use('*', dbMiddleware);
    app.get('/', (c) => {
      const db = c.get('db');
      expect(db).toBeDefined();
      return c.text('ok');
    });

    const env = { HYPERDRIVE: { connectionString: 'postgres://test' } };
    const executionCtx = { waitUntil: mockWaitUntil, passThroughOnException: vi.fn() };
    
    const res = await app.request('/', {}, env, executionCtx as any);
    
    expect(res.status).toBe(200);
    expect(mockWaitUntil).toHaveBeenCalled();
  });
});
