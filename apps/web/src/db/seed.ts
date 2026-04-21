import { db, pool } from './index';
import { users, sessions, canvases, blocks, blockEdges } from './schema';
import bcrypt from 'bcryptjs';

export async function createDemoUser() {
  const passwordHash = await bcrypt.hash('demo123', 10);
  const [user] = await db.insert(users).values({
    username: 'demo_user',
    passwordHash,
    hasCompletedOnboarding: true,
  }).onConflictDoNothing().returning();

  return user || (await db.query.users.findFirst({ where: (u, { eq }) => eq(u.username, 'demo_user') }));
}

export async function createDemoSession(userId: string) {
  const [session] = await db.insert(sessions).values({
    ownerId: userId,
    title: 'Getting Started with Imagination Engine',
    isCreation: true,
    creationSurface: 'playable',
  }).returning();
  return session;
}

export async function createDemoCanvas(sessionId: string) {
  const [canvas] = await db.insert(canvases).values({
    sessionId: sessionId,
    name: 'Demo Canvas',
  }).returning();
  return canvas;
}

async function main() {
  console.log('Seeding database with factories...');

  const user = await createDemoUser();
  if (!user) throw new Error('Could not create demo user');

  const session = await createDemoSession(user.id);
  const canvas = await createDemoCanvas(session.id);

  await db.insert(blocks).values([
    {
      id: 'welcome-block',
      canvasId: canvas.id,
      type: 'text',
      pos_x: 100,
      pos_y: 100,
      data: { content: 'Welcome to the Imagination Engine!' },
    },
    {
      id: 'instruction-block',
      canvasId: canvas.id,
      type: 'text',
      pos_x: 400,
      pos_y: 100,
      data: { content: 'This is a pre-wired canvas to get you started.' },
    },
  ]).onConflictDoNothing();

  await db.insert(blockEdges).values({
    id: 'edge-1',
    canvasId: canvas.id,
    sourceBlockId: 'welcome-block',
    targetBlockId: 'instruction-block',
    connectionType: 'dataflow',
  }).onConflictDoNothing();

  console.log('Database seeded successfully!');
  await pool.end();
}

if (import.meta.url.endsWith('seed.ts')) {
  main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
