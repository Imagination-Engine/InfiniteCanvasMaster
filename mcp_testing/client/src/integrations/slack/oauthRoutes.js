import axios from "axios";
import express from "express";

const router = express.Router();

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const SLACK_OAUTH_ACCESS_URL = "https://slack.com/api/oauth.v2.access";

const SCOPES = [
  "chat:write",
  "chat:write.public",
  "channels:read",
  "channels:manage",
  "channels:history",
  "channels:join",
  "groups:read",
  "groups:history",
  "im:read",
  "im:history",
  "mpim:read",
  "mpim:history",
  "users:read",
  "reactions:write",
  "files:write",
];

router.get("/api/slack/connect", (_req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID ?? "";
  const redirectUri = process.env.SLACK_REDIRECT_URI ?? "";

  if (!clientId) {
    return res.status(500).json({ error: "Missing SLACK_CLIENT_ID" });
  }
  if (!redirectUri) {
    return res.status(500).json({ error: "Missing SLACK_REDIRECT_URI" });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES.join(","),
    redirect_uri: redirectUri,
  });

  return res.redirect(`${SLACK_AUTHORIZE_URL}?${params.toString()}`);
});

router.get("/api/slack/oauth/callback", async (req, res) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID ?? "";
    const clientSecret = process.env.SLACK_CLIENT_SECRET ?? "";
    const redirectUri = process.env.SLACK_REDIRECT_URI ?? "";

    if (!clientId) {
      return res.status(500).json({ error: "Missing SLACK_CLIENT_ID" });
    }
    if (!clientSecret) {
      return res.status(500).json({ error: "Missing SLACK_CLIENT_SECRET" });
    }
    if (!redirectUri) {
      return res.status(500).json({ error: "Missing SLACK_REDIRECT_URI" });
    }

    const error = typeof req.query.error === "string" ? req.query.error : "";
    if (error) {
      return res.status(400).json({ error: `Slack OAuth error: ${error}` });
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) {
      return res.status(400).json({ error: "Missing OAuth code" });
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(SLACK_OAUTH_ACCESS_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const payload = response.data;
    if (!payload?.ok) {
      throw new Error(payload?.error ? String(payload.error) : "Slack OAuth failed");
    }

    const botToken = String(payload.access_token ?? "");
    const teamId = String(payload.team?.id ?? "");
    const teamName = String(payload.team?.name ?? "");
    const botUserId = String(payload.bot_user_id ?? "");

    if (!botToken) {
      throw new Error("Slack OAuth response missing access_token");
    }

    global.slackIntegration = {
      teamId,
      teamName,
      botToken,
      botUserId,
    };

    const wantsHtml = String(req.headers.accept ?? "").includes("text/html");
    if (wantsHtml) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Slack Connected</title>
            <style>
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; background: #0b1220; color: #e5e7eb; }
              .card { max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid rgba(148,163,184,.25); border-radius: 12px; background: rgba(15,23,42,.9); }
              .title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
              .muted { color: #94a3b8; font-size: 13px; margin: 0 0 16px; }
              .btn { display: inline-block; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16,185,129,.4); background: rgba(16,185,129,.12); color: #a7f3d0; text-decoration: none; font-size: 13px; }
              code { color: #93c5fd; }
            </style>
          </head>
          <body>
            <div class="card">
              <p class="title">Slack workspace connected successfully</p>
              <p class="muted">Team: <code>${teamName || teamId || "unknown"}</code></p>
              <a class="btn" href="#" onclick="window.close(); return false;">Close this window</a>
              <p class="muted" style="margin-top: 12px;">You can return to the canvas and run your Slack node again.</p>
            </div>
          </body>
        </html>
      `);
    }

    return res.json({ message: "Slack workspace connected successfully", teamId, teamName, botUserId });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Slack OAuth callback failed",
    });
  }
});

export default router;
