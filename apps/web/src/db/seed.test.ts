import { describe, it, expect } from 'vitest';
import { db } from './index';
import { users, sessions, canvases } from './schema';

describe('Database Seeder', () => {
  it('should have a demo user and session after seeding', async () => {
    const demoUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'demo_user'),
    });
    expect(demoUser).toBeDefined();
    
    const demoSessions = await db.select().from(sessions);
    expect(demoSessions.length).toBeGreaterThan(0);
    
    const demoCanvases = await db.select().from(canvases);
    expect(demoCanvases.length).toBeGreaterThan(0);
  });
});
