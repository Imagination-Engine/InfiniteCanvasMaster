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

  const fullUrl = c.req.url;
  const authHeader =
    c.req.header("Authorization") || c.req.header("authorization");
  const urlToken = c.req.query("token");
  const allHeaders = c.req.header();

  console.log(`[AUTH-DEBUG] Full URL: ${fullUrl}`);
  console.log(`[AUTH-DEBUG] Method: ${c.req.method}`);
  console.log(`[AUTH-DEBUG] Headers: ${JSON.stringify(allHeaders)}`);
  console.log(`[AUTH-DEBUG] Query Params: ${JSON.stringify(c.req.query())}`);

  let token = urlToken;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  // Debug: allow bypassing auth for testing if a specific header is present (ONLY IN DEV)
  if (
    !token &&
    process.env.NODE_ENV !== "production" &&
    c.req.header("x-bypass-auth") === "true"
  ) {
    console.warn("[AUTH-MIDDLEWARE] BYPASSING AUTH via x-bypass-auth header");
    c.set("user", { sub: "bypassed-user", email: "bypass@example.com" });
    return await next();
  }

  if (!token) {
    console.warn(
      `[AUTH-MIDDLEWARE] Unauthorized: Missing token for ${c.req.url}. Header: ${authHeader ? "Present" : "Missing"}, Query: ${urlToken ? "Present" : "Missing"}`,
    );
    return c.json(
      {
        error: "Unauthorized: Missing token",
        details: {
          header: authHeader ? "Present (but invalid or no Bearer)" : "Missing",
          query: urlToken ? "Present" : "Missing",
          allHeaders: Object.keys(allHeaders),
        },
      },
      401,
    );
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
