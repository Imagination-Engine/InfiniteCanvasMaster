import { setupDatabase } from "./apps/server/src/db.js";
import * as schema from "@iem/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function testSignup() {
  const env = {
    HYPERDRIVE: {
      connectionString:
        "postgres://postgres:postgres@localhost:5433/imagination_canvas",
    },
  };
  const { db, client } = setupDatabase(env);

  await client.connect();

  try {
    const email = "test@example.com";
    const password = "password123";
    const JWT_SECRET = "super-secret-fallback-key";
    const REFRESH_TOKEN_SECRET = "super-secret-refresh-key";

    console.log("Checking existing user...");
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existingUser.length > 0) {
      console.log("Deleting existing user...");
      await db.delete(schema.users).where(eq(schema.users.email, email));
    }

    console.log("Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Inserting user...");
    const [newUser] = await db
      .insert(schema.users)
      .values({ email, passwordHash })
      .returning();

    console.log("Signing JWT...");
    const accessToken = jwt.sign(
      { sub: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign({ sub: newUser.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    console.log("Inserting auth session...");
    await db.insert(schema.authSessions).values({
      userId: newUser.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("SUCCESS!");
  } catch (err) {
    console.error("ERROR DETECTED:", err);
  } finally {
    await client.end();
  }
}

testSignup();
