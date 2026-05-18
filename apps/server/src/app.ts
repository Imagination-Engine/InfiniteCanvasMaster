import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { chatRouter } from "./routes/chat.js";
import { blocksRouter } from "./routes/blocks.js";
import { a2aRouter } from "./routes/a2a.js";
import { reelRouter } from "./routes/reel.js";
import { dbMiddleware } from "./db.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      // In production, you would restrict this to your actual domains
      return origin || "http://localhost:5173";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("*", dbMiddleware);

app.route("/api/health", healthRouter);
app.route("/api/auth", authRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/chat", chatRouter);
app.route("/api/blocks", blocksRouter);
app.route("/api/a2a", a2aRouter);
app.route("/api/reel", reelRouter);

// Serve persisted generated media files
app.get("/generated-media/:filename", async (c) => {
  const filename = c.req.param("filename");
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const filepath = join(process.cwd(), "public", "generated-media", filename);

  try {
    const data = await readFile(filepath);
    const ext = filename.split(".").pop() || "png";
    const mimeType = ext === "jpg" ? "image/jpeg" : "image/png";

    return new Response(data, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

export { app };
