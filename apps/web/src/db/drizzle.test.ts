import { describe, it, expect } from 'vitest';
import { db } from './index';
import { sql } from 'drizzle-orm';

describe('Drizzle Connection', () => {
  it('should be able to execute a simple query', async () => {
    const result = await db.execute(sql`SELECT 1 as result`);
    expect(result.rows[0].result).toBe(1);
  });
});
