import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { chatRouter } from "./routes/chat.js";
import { blocksRouter } from "./routes/blocks.js";
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

export { app };
