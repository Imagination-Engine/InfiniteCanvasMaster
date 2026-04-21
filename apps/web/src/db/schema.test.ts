import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

describe('Schema CRUD', () => {
  it('should be able to create and retrieve a user', async () => {
    const newUser = {
      username: 'testuser_' + Date.now(),
      passwordHash: 'hashedpassword',
    };
    
    const [inserted] = await db.insert(users).values(newUser).returning();
    expect(inserted.id).toBeDefined();
    expect(inserted.username).toBe(newUser.username);
    
    const [retrieved] = await db.select().from(users).where(eq(users.id, inserted.id));
    expect(retrieved).toEqual(inserted);
  });

  it('should fail to create a user with a duplicate username (adversarial)', async () => {
    const username = 'duplicate_' + Date.now();
    await db.insert(users).values({ username, passwordHash: 'hash' });
    
    await expect(db.insert(users).values({ username, passwordHash: 'another_hash' }))
      .rejects.toThrow();
  });
});
