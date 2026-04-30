import { describe, it, expect } from 'vitest';
import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';

describe('Mastra Brain Initialization', () => {
  it('should initialize with a postgres store', async () => {
    // Mock the connection string
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/imagination_canvas';
    
    const store = new PostgresStore({
      id: 'iem-storage',
      connectionString: process.env.DATABASE_URL,
    });

    const mastra = new Mastra({
      storage: store,
      agents: {},
    });

    expect(mastra).toBeDefined();
  });
});
