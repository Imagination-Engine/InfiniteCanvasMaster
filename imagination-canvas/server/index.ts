import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { chromium } from "playwright";
import slackOauthRoutes from "../src/integrations/slack/oauthRoutes.js";
import { getSlackClient } from "../src/integrations/slack/slackClient.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/imagination_canvas";
const jwtSecret = process.env.JWT_SECRET ?? "dev-only-change-me";
const accessTokenTtlSeconds = Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900);
const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({ connectionString: databaseUrl });

const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434/api/generate";
const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3";
const ollamaTimeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS ?? 60_000);
const maxFiles = Number(process.env.ANALYZE_MAX_FILES ?? 20);
const maxCharsPerFile = Number(process.env.ANALYZE_MAX_CHARS_PER_FILE ?? 3_000);
const maxCorpusChars = Number(process.env.ANALYZE_MAX_TOTAL_CHARS ?? 45_000);

type AnalyzeFileInput = {
  name: string;
  path: string;
  content: string;
};

type AnalyzeRequestBody = {
  files?: AnalyzeFileInput[];
};

type CanvasKind = "creativity" | "work";

const defaultCanvasDocument = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use(slackOauthRoutes);

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(userId: string, username: string) {
  return jwt.sign(
    { sub: userId, username },
    jwtSecret,
    { expiresIn: accessTokenTtlSeconds },
  );
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function setRefreshTokenCookie(res: express.Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearRefreshTokenCookie(res: express.Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
  });
}

function parseBearerToken(req: express.Request) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

type AuthenticatedRequest = express.Request & {
  auth?: { userId: string; username: string };
};

function requireAuth(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = parseBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing access token." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") {
      return res.status(401).json({ error: "Invalid token payload." });
    }

    req.auth = { userId: payload.sub, username: payload.username };
    return next();
  } catch {
    return res.status(401).json({ error: "Access token is invalid or expired." });
  }
}

async function runMigrations() {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const version = file;
    const migrationSql = await fs.readFile(path.join(migrationsDir, file), "utf8");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const exists = await client.query<{ version: string }>(
        "SELECT version FROM schema_migrations WHERE version = $1",
        [version],
      );

      if (exists.rowCount === 0) {
        await client.query(migrationSql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [version],
        );
        console.log(`Applied migration: ${version}`);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

app.get("/api/slack/status", (_req, res) => {
  const teamId = typeof global.slackIntegration?.teamId === "string" ? global.slackIntegration.teamId : "";
  const teamName = typeof global.slackIntegration?.teamName === "string" ? global.slackIntegration.teamName : "";
  const botUserId = typeof global.slackIntegration?.botUserId === "string" ? global.slackIntegration.botUserId : "";
  const connected = Boolean(global.slackIntegration?.botToken);
  return res.json({ connected, teamId, teamName, botUserId });
});

const asString = (value: unknown) => (typeof value === "string" ? value : String(value ?? ""));

const isLikelySlackConversationId = (value: string) => {
  const trimmed = value.trim();
  return /^([CDG][A-Z0-9]{8,}|[A-Z0-9]{9,})$/.test(trimmed);
};

const resolveSlackChannelId = async (client: ReturnType<typeof getSlackClient>, channelOrId: string) => {
  const raw = channelOrId.trim();
  if (!raw) return "";
  if (isLikelySlackConversationId(raw)) return raw;

  const name = raw.startsWith("#") ? raw.slice(1) : raw;
  const list = await client.conversations.list({
    limit: 200,
    types: "public_channel,private_channel",
    exclude_archived: true,
  });

  if (!list.ok) {
    throw new Error(list.error ?? "Slack API error: conversations.list failed");
  }

  const channels = Array.isArray(list.channels) ? list.channels : [];
  const found = channels.find((c) => asString((c as any).name ?? "").trim() === name);
  const id = asString((found as any)?.id ?? "").trim();
  if (!id) {
    throw new Error(`Channel not found: ${raw} (use a channel ID like C123... or a name like #general)`);
  }

  return id;
};

const slackErrorResponse = (err: unknown) => ({
  error: err instanceof Error ? err.message : "Slack request failed",
});

const tryJoinChannelIfNeeded = async (client: ReturnType<typeof getSlackClient>, channelId: string, slackError: string) => {
  if (slackError !== "not_in_channel") return { joined: false, joinError: "" };

  // If we can, detect private channels and provide a better message.
  const info = await client.conversations.info({ channel: channelId }).catch(() => null);
  const isPrivate = Boolean((info as any)?.channel?.is_private);
  const isMember = Boolean((info as any)?.channel?.is_member);
  if (isPrivate && !isMember) {
    const botUserId = typeof global.slackIntegration?.botUserId === "string" ? global.slackIntegration.botUserId : "";
    const mention = botUserId ? `<@${botUserId}>` : "the bot";
    return { joined: false, joinError: `Bot is not in this private channel. Invite ${mention} to the channel, then retry.` };
  }

  const joined = await client.conversations.join({ channel: channelId });
  if (joined.ok) return { joined: true, joinError: "" };

  const joinError = joined.error ?? "";
  // Private channels and some channel types cannot be joined via API.
  if (joinError === "method_not_supported_for_channel_type" || joinError === "channel_not_found") {
    return { joined: false, joinError: "Bot is not in this channel. For private channels, invite the bot first." };
  }
  if (joinError === "missing_scope") {
    return { joined: false, joinError: "Missing scope to join channels (try reconnecting Slack with channels:join)." };
  }

  return { joined: false, joinError: joinError || "Failed to join channel." };
};

const safeSlackCall = async (promise: Promise<any>) => {
  return promise.catch((err: any) => {
    if (err.data?.error === "not_in_channel") return err.data;
    throw err;
  });
};

app.post("/api/slack/nodes/sendMessage", requireAuth, async (req, res) => {
  try {
    const channelInput = asString(req.body?.channelId ?? req.body?.channel).trim();
    const message = asString(req.body?.message ?? req.body?.text).trim();
    if (!channelInput) return res.status(400).json({ error: 'Missing required parameter: "channelId"' });
    if (!message) return res.status(400).json({ error: 'Missing required parameter: "message"' });

    const client = getSlackClient();
    const channelId = await resolveSlackChannelId(client, channelInput);
    let result = await safeSlackCall(client.chat.postMessage({ channel: channelId, text: message }));
    if (!result.ok && result.error === "not_in_channel") {
      const joinAttempt = await tryJoinChannelIfNeeded(client, channelId, result.error);
      if (joinAttempt.joined) {
        result = await safeSlackCall(client.chat.postMessage({ channel: channelId, text: message }));
      } else if (joinAttempt.joinError) {
        return res.status(409).json({ error: joinAttempt.joinError });
      }
    }

    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    return res.json({ result, text: message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/sendDm", requireAuth, async (req, res) => {
  try {
    const userId = asString(req.body?.userId).trim();
    const message = asString(req.body?.message ?? req.body?.text).trim();
    if (!userId) return res.status(400).json({ error: 'Missing required parameter: "userId"' });
    if (!message) return res.status(400).json({ error: 'Missing required parameter: "message"' });

    const client = getSlackClient();
    const opened = await client.conversations.open({ users: userId });
    if (!opened.ok || !opened.channel?.id) {
      return res.status(502).json({
        error: opened.error ?? "Slack API error: conversations.open failed",
        needed: (opened as any).needed ?? null,
        provided: (opened as any).provided ?? null,
      });
    }

    const result = await client.chat.postMessage({ channel: opened.channel.id, text: message });
    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    return res.json({ result, text: message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/createChannel", requireAuth, async (req, res) => {
  try {
    const name = asString(req.body?.name).trim();
    if (!name) return res.status(400).json({ error: 'Missing required parameter: "name"' });

    const isPrivateRaw = asString(req.body?.is_private ?? req.body?.isPrivate ?? "false").trim().toLowerCase();
    const isPrivate = isPrivateRaw === "true" || isPrivateRaw === "1" || isPrivateRaw === "yes";

    const client = getSlackClient();
    const result = await client.conversations.create({ name, is_private: isPrivate });
    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    const channel = result.channel ?? null;
    const text = channel?.id ? `Created channel ${name} (${channel.id})` : `Created channel ${name}`;
    return res.json({ channel, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/inviteUsers", requireAuth, async (req, res) => {
  try {
    const channelInput = asString(req.body?.channelId ?? req.body?.channel).trim();
    if (!channelInput) return res.status(400).json({ error: 'Missing required parameter: "channelId"' });

    const usersRaw = req.body?.users ?? req.body?.userIds ?? req.body?.userId;
    const users = Array.isArray(usersRaw)
      ? usersRaw.map((u: unknown) => asString(u).trim()).filter(Boolean)
      : asString(usersRaw).trim()
        ? [asString(usersRaw).trim()]
        : [];

    if (users.length === 0) {
      return res.status(400).json({ error: 'Missing required parameter: "users" (non-empty array)' });
    }

    const client = getSlackClient();
    const channelId = await resolveSlackChannelId(client, channelInput);
    let result = await safeSlackCall(client.conversations.invite({ channel: channelId, users: users.join(",") }));
    if (!result.ok && result.error === "not_in_channel") {
      const joinAttempt = await tryJoinChannelIfNeeded(client, channelId, result.error);
      if (joinAttempt.joined) {
        result = await safeSlackCall(client.conversations.invite({ channel: channelId, users: users.join(",") }));
      } else if (joinAttempt.joinError) {
        return res.status(409).json({ error: joinAttempt.joinError });
      }
    }

    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    return res.json({ result, text: `Invited ${users.length} user(s) to ${channelId}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/inviteToWorkspace", requireAuth, async (req, res) => {
  try {
    const email = asString(req.body?.email).trim();
    const teamId = asString(req.body?.teamId).trim() || (global.slackIntegration?.teamId ?? "");
    
    if (!email) return res.status(400).json({ error: 'Missing required parameter: "email"' });
    if (!teamId) return res.status(400).json({ error: 'Missing required parameter: "teamId" or workspace not connected.' });

    const client = getSlackClient();
    
    // Attempting to invite a user to the workspace.
    // Note: The `admin.users.invite` method is generally restricted to Enterprise Grid plans
    // and requires an admin user token with `admin.users:write` scope.
    let result = await safeSlackCall(client.admin.users.invite({
      team_id: teamId,
      email: email,
      // channel_ids is often required by the API, but we'll try without it first or let the API throw if missing.
    }));

    if (!result.ok) {
      // If it fails, check if we can fall back to the undocumented API just in case it works for their plan
      if (result.error === "missing_scope" || result.error === "unknown_method") {
        try {
          const fallback = await safeSlackCall(client.apiCall("users.admin.invite", {
            email: email,
            resend: true,
          }));
          if (fallback.ok) {
            result = fallback;
          }
        } catch (e) {
          // Ignore fallback error and stick to the original error
        }
      }

      if (!result.ok) {
        return res.status(502).json({
          error: result.error ? `Slack API error: ${result.error}. Note: Workspace invites via API usually require an Enterprise Grid plan.` : "Slack API error",
          needed: (result as any).needed ?? null,
          provided: (result as any).provided ?? null,
        });
      }
    }

    return res.json({ result, text: `Invited ${email} to the workspace.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/readMessages", requireAuth, async (req, res) => {
  try {
    const channelInput = asString(req.body?.channelId ?? req.body?.channel).trim();
    if (!channelInput) return res.status(400).json({ error: 'Missing required parameter: "channelId"' });

    const limitRaw = Number(asString(req.body?.limit ?? "20"));
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, limitRaw)) : 20;

    const client = getSlackClient();
    const channelId = await resolveSlackChannelId(client, channelInput);
    let result = await safeSlackCall(client.conversations.history({ channel: channelId, limit }));
    if (!result.ok && result.error === "not_in_channel") {
      const joinAttempt = await tryJoinChannelIfNeeded(client, channelId, result.error);
      if (joinAttempt.joined) {
        result = await safeSlackCall(client.conversations.history({ channel: channelId, limit }));
        if (!result.ok && result.error === "not_in_channel") {
          return res.status(409).json({
            error: "Bot still not in channel after join attempt. If this is a private channel, invite the bot first.",
          });
        }
      } else if (joinAttempt.joinError) {
        return res.status(409).json({ error: joinAttempt.joinError });
      }
    }

    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    const messages = Array.isArray(result.messages) ? result.messages : [];
    const text = messages
      .map((m) => {
        const user = asString((m as any).user ?? (m as any).username ?? "").trim();
        const body = asString((m as any).text ?? "").trim();
        if (!user && !body) return "";
        return user ? `${user}: ${body}` : body;
      })
      .filter(Boolean)
      .join("\n");

    return res.json({ messages, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/getMessage", requireAuth, async (req, res) => {
  try {
    const channelInput = asString(req.body?.channelId ?? req.body?.channel).trim();
    const messageTs = asString(req.body?.messageTs ?? req.body?.ts).trim();
    if (!channelInput) return res.status(400).json({ error: 'Missing required parameter: "channelId"' });
    if (!messageTs) return res.status(400).json({ error: 'Missing required parameter: "messageTs"' });

    const client = getSlackClient();
    const channelId = await resolveSlackChannelId(client, channelInput);
    let history = await safeSlackCall(client.conversations.history({
      channel: channelId,
      latest: messageTs,
      inclusive: true,
      limit: 1,
    }));
    if (!history.ok && history.error === "not_in_channel") {
      const joinAttempt = await tryJoinChannelIfNeeded(client, channelId, history.error);
      if (joinAttempt.joined) {
        history = await safeSlackCall(client.conversations.history({
          channel: channelId,
          latest: messageTs,
          inclusive: true,
          limit: 1,
        }));
      } else if (joinAttempt.joinError) {
        return res.status(409).json({ error: joinAttempt.joinError });
      }
    }

    if (!history.ok) {
      return res.status(502).json({
        error: history.error ?? "Slack API error",
        needed: (history as any).needed ?? null,
        provided: (history as any).provided ?? null,
      });
    }

    const message = Array.isArray(history.messages) ? history.messages[0] ?? null : null;
    const text = asString((message as any)?.text ?? "").trim();
    return res.json({ message, json: { message }, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/listChannels", requireAuth, async (_req, res) => {
  try {
    const client = getSlackClient();
    const result = await client.conversations.list({
      limit: 200,
      types: "public_channel,private_channel",
      exclude_archived: true,
    });
    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    const channels = Array.isArray(result.channels) ? result.channels : [];
    const text = channels.map((c) => asString((c as any).name ?? "").trim()).filter(Boolean).join("\n");
    return res.json({ channels, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post("/api/slack/nodes/listUsers", requireAuth, async (_req, res) => {
  try {
    const client = getSlackClient();
    const result = await client.users.list({ limit: 200 });
    if (!result.ok) {
      return res.status(502).json({
        error: result.error ?? "Slack API error",
        needed: (result as any).needed ?? null,
        provided: (result as any).provided ?? null,
      });
    }

    const members = Array.isArray(result.members) ? result.members : [];
    const text = members
      .map((m) => asString((m as any).real_name ?? (m as any).name ?? "").trim())
      .filter(Boolean)
      .join("\n");

    return res.json({ members, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Slack not connected") {
      return res.status(409).json({ error: "Slack not connected. Visit /api/slack/connect first." });
    }
    return res.status(500).json(slackErrorResponse(error));
  }
});

app.post(
  "/api/auth/signup",
  async (
    req: express.Request<
      Record<string, never>,
      unknown,
      { username?: string; password?: string }
    >,
    res: express.Response,
  ) => {
    try {
      const username = String(req.body.username ?? "").trim().toLowerCase();
      const password = String(req.body.password ?? "").trim();

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters." });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const createdUser = await pool.query<{ id: string; username: string }>(
        `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING id, username
        `,
        [username, passwordHash],
      );

      const user = createdUser.rows[0];
      const accessToken = createAccessToken(user.id, user.username);
      const refreshToken = createRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      await pool.query(
        `
        INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 day'))
        `,
        [
          user.id,
          refreshTokenHash,
          req.headers["user-agent"] ?? null,
          req.ip,
          refreshTokenTtlDays,
        ],
      );

      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        accessToken,
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("users_username_key")) {
        return res.status(409).json({ error: "Username is already taken." });
      }

      return res.status(500).json({ error: "Signup failed." });
    }
  },
);

app.post(
  "/api/auth/login",
  async (
    req: express.Request<
      Record<string, never>,
      unknown,
      { username?: string; password?: string }
    >,
    res: express.Response,
  ) => {
    try {
      const username = String(req.body.username ?? "").trim().toLowerCase();
      const password = String(req.body.password ?? "").trim();

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const foundUser = await pool.query<{ id: string; username: string; password_hash: string }>(
        "SELECT id, username, password_hash FROM users WHERE username = $1",
        [username],
      );

      if (foundUser.rowCount === 0) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const user = foundUser.rows[0];
      const passwordMatches = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const accessToken = createAccessToken(user.id, user.username);
      const refreshToken = createRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      await pool.query(
        `
        INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 day'))
        `,
        [
          user.id,
          refreshTokenHash,
          req.headers["user-agent"] ?? null,
          req.ip,
          refreshTokenTtlDays,
        ],
      );

      setRefreshTokenCookie(res, refreshToken);

      return res.json({
        accessToken,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch {
      return res.status(500).json({ error: "Login failed." });
    }
  },
);

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const refreshToken = typeof req.cookies.refreshToken === "string" ? req.cookies.refreshToken : "";
    if (!refreshToken) {
      return res.status(401).json({ error: "Missing refresh token." });
    }

    const refreshTokenHash = hashToken(refreshToken);

    const foundSession = await pool.query<{
      id: string;
      user_id: string;
      username: string;
      expires_at: string;
      revoked_at: string | null;
    }>(
      `
      SELECT s.id, s.user_id, u.username, s.expires_at, s.revoked_at
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.refresh_token_hash = $1
      `,
      [refreshTokenHash],
    );

    if (foundSession.rowCount === 0) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const session = foundSession.rows[0];
    const isExpired = new Date(session.expires_at).getTime() <= Date.now();
    const isRevoked = Boolean(session.revoked_at);

    if (isExpired || isRevoked) {
      clearRefreshTokenCookie(res);
      await pool.query("UPDATE sessions SET revoked_at = NOW() WHERE id = $1", [session.id]);
      return res.status(401).json({ error: "Refresh token is expired." });
    }

    const rotatedRefreshToken = createRefreshToken();
    const rotatedRefreshTokenHash = hashToken(rotatedRefreshToken);

    await pool.query(
      `
      UPDATE sessions
      SET refresh_token_hash = $1,
          user_agent = $2,
          ip_address = $3,
          expires_at = NOW() + ($4 * INTERVAL '1 day')
      WHERE id = $5
      `,
      [
        rotatedRefreshTokenHash,
        req.headers["user-agent"] ?? null,
        req.ip,
        refreshTokenTtlDays,
        session.id,
      ],
    );

    setRefreshTokenCookie(res, rotatedRefreshToken);
    const accessToken = createAccessToken(session.user_id, session.username);

    return res.json({
      accessToken,
      user: {
        id: session.user_id,
        username: session.username,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to refresh session." });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const refreshToken = typeof req.cookies.refreshToken === "string" ? req.cookies.refreshToken : "";
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      await pool.query(
        "UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1",
        [refreshTokenHash],
      );
    }

    clearRefreshTokenCookie(res);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Logout failed." });
  }
});

app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const foundUser = await pool.query<{ id: string; username: string }>(
    "SELECT id, username FROM users WHERE id = $1",
    [userId],
  );

  if (foundUser.rowCount === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: foundUser.rows[0] });
});

// Refiner Endpoint
app.post("/api/refineText", requireAuth, async (req, res) => {
  try {
    const { text, style } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const writingStyle = style || "Formal";
    
    const prompt = `
    Please refine or rephrase the following text to match a "${writingStyle}" writing style.
    
    Original Text:
    ${text}
    
    Output nothing but the refined text. Use clear, appropriate vocabulary matching the "${writingStyle}" style. Re-structure sentences if necessary to better fit the style while retaining the core meaning.
    `;
    const apiKey = process.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GOOGLE_API_KEY not set. Using mock response.");
      return res.json({ refinedText: `Refined text for "${text}" in ${writingStyle} style.` });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    const refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({ refinedText });

  } catch (error) {
    console.error("Error refining text:", error);
    return res.status(500).json({ error: "Failed to refine text." });
  }
});

app.get("/api/projects", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const projects = await pool.query<{
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }>(
    `
    SELECT id, name, created_at, updated_at
    FROM projects
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return res.json({ projects: projects.rows });
});

app.post(
  "/api/projects",
  requireAuth,
  async (
    req: AuthenticatedRequest &
      express.Request<
        Record<string, never>,
        unknown,
        { name?: string }
      >,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const name = String(req.body.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ error: "Project name is required." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertedProject = await client.query<{
        id: string;
        name: string;
        created_at: string;
        updated_at: string;
      }>(
        `
        INSERT INTO projects (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, created_at, updated_at
        `,
        [userId, name],
      );

      const project = insertedProject.rows[0];

      await client.query(
        `
        INSERT INTO canvases (project_id, kind, name, document)
        VALUES
          ($1, 'creativity', 'Project Canvas', $2::jsonb)
        `,
        [project.id, JSON.stringify(defaultCanvasDocument)],
      );

      await client.query("COMMIT");
      return res.status(201).json({ project });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof Error && error.message.includes("projects_user_id_name_key")) {
        return res.status(409).json({ error: "You already have a project with this name." });
      }
      return res.status(500).json({ error: "Failed to create project." });
    } finally {
      client.release();
    }
  },
);

app.delete(
  "/api/projects/:projectId",
  requireAuth,
  async (
    req: AuthenticatedRequest & express.Request<{ projectId: string }>,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId } = req.params;

    const deleted = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2",
      [projectId, userId],
    );

    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    return res.status(204).send();
  },
);

app.get(
  "/api/projects/:projectId/canvas",
  requireAuth,
  async (
    req: AuthenticatedRequest & express.Request<{ projectId: string }>,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId } = req.params;

    const found = await pool.query<{
      id: string;
      kind: CanvasKind;
      name: string;
      document: unknown;
      updated_at: string;
    }>(
      `
      SELECT c.id, c.kind, c.name, c.document, c.updated_at
      FROM canvases c
      INNER JOIN projects p ON p.id = c.project_id
      WHERE c.project_id = $1
        AND p.user_id = $2
      ORDER BY CASE WHEN c.kind = 'creativity' THEN 0 ELSE 1 END
      LIMIT 1
      `,
      [projectId, userId],
    );

    if (found.rowCount === 0) {
      const inserted = await pool.query<{
        id: string;
        kind: CanvasKind;
        name: string;
        document: unknown;
        updated_at: string;
      }>(
        `
        INSERT INTO canvases (project_id, kind, name, document)
        SELECT $1, 'creativity', 'Project Canvas', $2::jsonb
        WHERE EXISTS (
          SELECT 1 FROM projects WHERE id = $1 AND user_id = $3
        )
        RETURNING id, kind, name, document, updated_at
        `,
        [projectId, JSON.stringify(defaultCanvasDocument), userId],
      );

      if (inserted.rowCount === 0) {
        return res.status(404).json({ error: "Project not found." });
      }

      return res.json({ canvas: inserted.rows[0] });
    }

    return res.json({ canvas: found.rows[0] });
  },
);

app.put(
  "/api/projects/:projectId/canvas",
  requireAuth,
  async (
    req: AuthenticatedRequest &
      express.Request<
        { projectId: string },
        unknown,
        { document?: unknown }
      >,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId } = req.params;
    const document = req.body.document;
    if (!document || typeof document !== "object") {
      return res.status(400).json({ error: "Body must include document JSON." });
    }

    const updated = await pool.query<{
      id: string;
      kind: CanvasKind;
      name: string;
      document: unknown;
      updated_at: string;
    }>(
      `
      WITH selected_canvas AS (
        SELECT c.id
        FROM canvases c
        INNER JOIN projects p ON p.id = c.project_id
        WHERE c.project_id = $2
          AND p.user_id = $3
        ORDER BY CASE WHEN c.kind = 'creativity' THEN 0 ELSE 1 END
        LIMIT 1
      )
      UPDATE canvases c
      SET document = $1::jsonb,
          updated_at = NOW()
      FROM selected_canvas s
      WHERE c.id = s.id
      RETURNING c.id, c.kind, c.name, c.document, c.updated_at
      `,
      [JSON.stringify(document), projectId, userId],
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ error: "Canvas not found." });
    }

    return res.json({ canvas: updated.rows[0] });
  },
);

app.get(
  "/api/projects/:projectId/canvases",
  requireAuth,
  async (
    req: AuthenticatedRequest & express.Request<{ projectId: string }>,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId } = req.params;

    const canvases = await pool.query<{
      id: string;
      kind: CanvasKind;
      name: string;
      updated_at: string;
    }>(
      `
      SELECT c.id, c.kind, c.name, c.updated_at
      FROM canvases c
      INNER JOIN projects p ON p.id = c.project_id
      WHERE c.project_id = $1 AND p.user_id = $2
      ORDER BY c.kind ASC
      `,
      [projectId, userId],
    );

    return res.json({ canvases: canvases.rows });
  },
);

app.get(
  "/api/projects/:projectId/canvases/:kind",
  requireAuth,
  async (
    req: AuthenticatedRequest & express.Request<{ projectId: string; kind: CanvasKind }>,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId, kind } = req.params;
    if (kind !== "creativity" && kind !== "work") {
      return res.status(400).json({ error: "Canvas kind must be creativity or work." });
    }

    const found = await pool.query<{
      id: string;
      kind: CanvasKind;
      name: string;
      document: unknown;
      updated_at: string;
    }>(
      `
      SELECT c.id, c.kind, c.name, c.document, c.updated_at
      FROM canvases c
      INNER JOIN projects p ON p.id = c.project_id
      WHERE c.project_id = $1 AND c.kind = $2 AND p.user_id = $3
      `,
      [projectId, kind, userId],
    );

    if (found.rowCount === 0) {
      return res.status(404).json({ error: "Canvas not found." });
    }

    return res.json({ canvas: found.rows[0] });
  },
);

app.put(
  "/api/projects/:projectId/canvases/:kind",
  requireAuth,
  async (
    req: AuthenticatedRequest &
      express.Request<
        { projectId: string; kind: CanvasKind },
        unknown,
        { document?: unknown }
      >,
    res,
  ) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { projectId, kind } = req.params;
    if (kind !== "creativity" && kind !== "work") {
      return res.status(400).json({ error: "Canvas kind must be creativity or work." });
    }

    const document = req.body.document;
    if (!document || typeof document !== "object") {
      return res.status(400).json({ error: "Body must include document JSON." });
    }

    const updated = await pool.query<{
      id: string;
      kind: CanvasKind;
      name: string;
      document: unknown;
      updated_at: string;
    }>(
      `
      UPDATE canvases c
      SET document = $1::jsonb,
          updated_at = NOW()
      FROM projects p
      WHERE c.project_id = p.id
        AND c.project_id = $2
        AND c.kind = $3
        AND p.user_id = $4
      RETURNING c.id, c.kind, c.name, c.document, c.updated_at
      `,
      [JSON.stringify(document), projectId, kind, userId],
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ error: "Canvas not found." });
    }

    return res.json({ canvas: updated.rows[0] });
  },
);

app.post(
  "/api/scrape",
  requireAuth,
  async (req: express.Request<Record<string, never>, unknown, { url?: string }>, res) => {
    const { url } = req.body as { url?: string };
    if (!url) {
      return res.status(400).json({ error: "URL is required." });
    }

    let browser;
    try {
      console.log("Scraping URL:", url);
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      const title = await page.title();
      const rawContent = await page.evaluate(() => {
        const elementsToRemove = document.querySelectorAll(
          "script, style, nav, footer, header, iframe, noscript",
        );
        elementsToRemove.forEach((el) => el.remove());
        return document.body.innerText.replace(/\s+/g, " ").trim();
      });

      const apiKey = process.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GOOGLE_API_KEY is not defined in the environment.");
      }

      const prompt = `
        Please analyze the following web page content.
        URL: ${url}
        Title: ${title}
        
        Extract the most important insights into 3-5 concise bullet points.
        Return ONLY a JSON object with this exact structure:
        {
          "url": "${url}",
          "title": "${title}",
          "bullets": ["insight 1", "insight 2", "insight 3"]
        }
        
        Content:
        ${rawContent.slice(0, 15000)}
      `;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
      }

      const data = await geminiResponse.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let cleanJsonText = textResponse;
      const jsonBlockMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

      if (jsonBlockMatch && jsonBlockMatch[1]) {
        cleanJsonText = jsonBlockMatch[1];
      } else {
        const firstBrace = textResponse.indexOf("{");
        const lastBrace = textResponse.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJsonText = textResponse.substring(firstBrace, lastBrace + 1);
        }
      }

      const parsed = JSON.parse(cleanJsonText);

      return res.json({
        summary: {
          url: parsed.url || url,
          title: parsed.title || title,
          bullets: parsed.bullets || ["Failed to extract bullets"],
        },
      });
    } catch (error) {
      console.error("Scrape error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to scrape and summarize.",
      });
    } finally {
      if (browser) {
        await browser.close().catch(console.error);
      }
    }
  },
);

app.post(
  "/api/rephraseText",
  requireAuth,
  async (req, res) => {
    try {
      const text = String(req.body.text || "").trim();
      const style = String(req.body.style || "Formal").trim();

      if (!text) {
        return res.status(400).json({ error: "Missing required parameter: text" });
      }

      const apiKey = process.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GOOGLE_API_KEY is not defined in the environment.");
      }

      const prompt = `
        Please rephrase the following text.
        Target Style/Tone: ${style}
        
        Provide your rephrased text below. Return ONLY a JSON object with this exact structure:
        {
          "rephrased": "The final rephrased text goes here."
        }
        
        Text to rephrase:
        ${text}
      `;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
      }

      const data = await geminiResponse.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let cleanJsonText = textResponse;
      const jsonBlockMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

      if (jsonBlockMatch && jsonBlockMatch[1]) {
        cleanJsonText = jsonBlockMatch[1];
      } else {
        const firstBrace = textResponse.indexOf("{");
        const lastBrace = textResponse.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJsonText = textResponse.substring(firstBrace, lastBrace + 1);
        }
      }

      const parsed = JSON.parse(cleanJsonText);

      return res.json({
        rephrased: parsed.rephrased || "Failed to rephrase text.",
      });
    } catch (error) {
      console.error("Rephrase error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to rephrase text.",
      });
    }
  },
);


const buildCorpus = (files: AnalyzeFileInput[]) =>
  files
    .slice(0, maxFiles)
    .map((file) => `FILE: ${file.path}\n${file.content.slice(0, maxCharsPerFile)}`)
    .join("\n\n-----\n\n")
    .slice(0, maxCorpusChars);

const parseAnalysisResponse = (responseText: string) => {
  const normalized = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace
    ? normalized.slice(firstBrace, lastBrace + 1)
    : normalized;

  const parsed = JSON.parse(jsonText) as Partial<{
    summary: string;
    connections: string;
    keyTerms: string;
    organization: string;
  }>;

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "No summary available.",
    connections: typeof parsed.connections === "string" ? parsed.connections.trim() : "No connections available.",
    keyTerms: typeof parsed.keyTerms === "string" ? parsed.keyTerms.trim() : "No key terms available.",
    organization: typeof parsed.organization === "string"
      ? parsed.organization.trim()
      : "No organization suggestions available.",
  };
};

const callOllama = async (corpus: string) => {
  const prompt = [
    "You are analyzing a set of user-selected files from a filesystem workspace.",
    "Return STRICT JSON only with exactly these keys:",
    "summary, connections, keyTerms, organization.",
    "Each value should be concise markdown-friendly text.",
    "",
    "FILES:",
    corpus,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ollamaTimeoutMs);

  let response: Response;
  try {
    response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 500,
        },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status})`);
  }

  const payload = (await response.json()) as { response?: string };

  if (!payload.response?.trim()) {
    throw new Error("Ollama returned an empty response.");
  }

  return parseAnalysisResponse(payload.response);
};

app.post(
  "/api/analyze",
  async (
    req: express.Request<Record<string, never>, unknown, AnalyzeRequestBody>,
    res: express.Response,
  ) => {
    try {
      const files = Array.isArray(req.body?.files)
        ? req.body.files.filter(
          (file): file is AnalyzeFileInput =>
            Boolean(
              file
                && typeof file.name === "string"
                && typeof file.path === "string"
                && typeof file.content === "string",
            ),
        )
        : [];

      if (files.length === 0) {
        return res.status(400).json({ error: "Expected body.files with at least one text file." });
      }

      const corpus = buildCorpus(files);
      const result = await callOllama(corpus);
      return res.json(result);
    } catch (error) {
      const isTimeoutError = error instanceof Error && error.name === "AbortError";

      return res.status(500).json({
        error: isTimeoutError
          ? `Ollama timed out after ${ollamaTimeoutMs}ms`
          : error instanceof Error
            ? error.message
            : "Analysis failed.",
      });
    }
  },
);

async function startServer() {
  try {
    await runMigrations();
    app.listen(port, () => {
      console.log(`API server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
