import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
  };
};

export const authMiddleware = async (c: Context, next: Next) => {
  const { JWT_SECRET } = getSecrets(c);

  const authHeader = c.req.header("Authorization");
  const urlToken = c.req.query("token");
  const token = authHeader ? authHeader.split(" ")[1] : urlToken;

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
    console.error("[AUTH MIDDLEWARE] JWT Verify failed:", err);
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }
};
