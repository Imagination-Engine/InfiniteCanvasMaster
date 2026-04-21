import { describe, it, expect } from 'vitest';
import { db } from './index';
import { users, sessions, canvases, blocks } from './schema';
import { eq } from 'drizzle-orm';

describe('Graph Schema Cascade Deletes', () => {
  it('should delete canvas and blocks when session is deleted', async () => {
    // 1. Setup User & Session
    const [user] = await db.insert(users).values({ username: 'graphuser_' + Date.now(), passwordHash: 'hash' }).returning();
    const [session] = await db.insert(sessions).values({ ownerId: user.id, title: 'Test Session' }).returning();
    
    // 2. Setup Canvas
    const [canvas] = await db.insert(canvases).values({ sessionId: session.id, name: 'Main Canvas' }).returning();
    
    // 3. Setup Block
    await db.insert(blocks).values({ id: 'block-1', canvasId: canvas.id, type: 'text', pos_x: 0, pos_y: 0, data: {} });
    
    // 4. Delete Session
    await db.delete(sessions).where(eq(sessions.id, session.id));
    
    // 5. Verify Deletions
    const canvasResult = await db.select().from(canvases).where(eq(canvases.id, canvas.id));
    expect(canvasResult.length).toBe(0);
    
    const blocksResult = await db.select().from(blocks).where(eq(blocks.canvasId, canvas.id));
    expect(blocksResult.length).toBe(0);
  });
});
