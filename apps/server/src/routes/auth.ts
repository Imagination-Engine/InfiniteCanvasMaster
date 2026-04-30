import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { dbMiddleware } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { users, authSessions } from "@iem/db";

const authRouter = new Hono();

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
    REFRESH_TOKEN_SECRET:
      c.env?.REFRESH_TOKEN_SECRET ||
      process.env.REFRESH_TOKEN_SECRET ||
      "super-secret-refresh-key",
  };
};

authRouter.post("/signup", async (c) => {
  console.log("[AUTH] Signup attempt start");
  const { JWT_SECRET, REFRESH_TOKEN_SECRET } = getSecrets(c);
  const db = c.get("db") as any;
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ error: "Email already exists" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning();

    const accessToken = jwt.sign(
      { sub: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign({ sub: newUser.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Store refresh token in DB
    await db.insert(authSessions).values({
      userId: newUser.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setCookie(c, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return c.json(
      {
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          hasCompletedOnboarding: newUser.hasCompletedOnboarding,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Signup error:", error);
    return c.json(
      {
        error:
          "An unexpected error occurred during signup. Please try again later.",
      },
      500,
    );
  }
});

authRouter.post("/login", async (c) => {
  console.log("[AUTH] Login attempt start");
  const { JWT_SECRET, REFRESH_TOKEN_SECRET } = getSecrets(c);
  const db = c.get("db") as any;
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign({ sub: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Store refresh token in DB
    await db.insert(authSessions).values({
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setCookie(c, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return c.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      email,
    });
    return c.json(
      {
        error:
          "An unexpected error occurred during login. Please try again later.",
        message: error.message,
      },
      500,
    );
  }
});

authRouter.post("/refresh", async (c) => {
  const { JWT_SECRET, REFRESH_TOKEN_SECRET } = getSecrets(c);
  const db = c.get("db") as any;
  const refreshToken = getCookie(c, "refresh_token");

  if (!refreshToken) {
    return c.json({ error: "Refresh token missing" }, 401);
  }

  try {
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        sub: string;
      };
    } catch (jwtErr) {
      console.error("[AUTH REFRESH] JWT Verify failed:", jwtErr);
      return c.json({ error: "Invalid refresh token" }, 401);
    }

    // Check if token exists in DB and is not expired
    const [session] = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.refreshToken, refreshToken));

    if (!session) {
      console.warn("[AUTH REFRESH] Session not found in database");
      return c.json({ error: "Session expired or revoked" }, 401);
    }

    if (session.expiresAt < new Date()) {
      console.warn("[AUTH REFRESH] Session expired by date");
      return c.json({ error: "Session expired" }, 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!user) {
      console.error("[AUTH REFRESH] User not found for valid token");
      return c.json({ error: "User not found" }, 401);
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    return c.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error: any) {
    console.error("[AUTH REFRESH] Unexpected Error:", error);
    return c.json(
      { error: "Internal authentication failure", message: error.message },
      500,
    );
  }
});

authRouter.post("/logout", async (c) => {
  const db = c.get("db") as any;
  const refreshToken = getCookie(c, "refresh_token");

  if (refreshToken) {
    await db
      .delete(authSessions)
      .where(eq(authSessions.refreshToken, refreshToken));
  }

  deleteCookie(c, "refresh_token", { path: "/" });
  return c.json({ success: true });
});

authRouter.post("/complete-onboarding", async (c) => {
  const { JWT_SECRET } = getSecrets(c);
  const db = c.get("db") as any;

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const [updatedUser] = await db
      .update(users)
      .set({ hasCompletedOnboarding: true })
      .where(eq(users.id, payload.sub))
      .returning();

    if (!updatedUser) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      success: true,
      hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return c.json({ error: "Failed to complete onboarding" }, 500);
  }
});

export { authRouter };
