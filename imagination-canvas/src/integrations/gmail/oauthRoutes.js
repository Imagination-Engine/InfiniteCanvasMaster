import express from "express";

const router = express.Router();

const GOOGLE_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

const DEFAULT_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

const parseScopes = () => {
  const raw = process.env.GOOGLE_OAUTH_SCOPES ?? DEFAULT_SCOPES.join(" ");
  return raw
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
};

const getConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
});

router.get("/api/gmail/connect", (_req, res) => {
  const { clientId, redirectUri } = getConfig();
  if (!clientId) {
    return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
  }
  if (!redirectUri) {
    return res.status(500).json({ error: "Missing GOOGLE_REDIRECT_URI" });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: parseScopes().join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
  });

  return res.redirect(`${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`);
});

router.get("/api/gmail/oauth/callback", async (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri } = getConfig();
    if (!clientId) {
      return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
    }
    if (!clientSecret) {
      return res.status(500).json({ error: "Missing GOOGLE_CLIENT_SECRET" });
    }
    if (!redirectUri) {
      return res.status(500).json({ error: "Missing GOOGLE_REDIRECT_URI" });
    }

    const oauthError = typeof req.query.error === "string" ? req.query.error : "";
    if (oauthError) {
      return res.status(400).json({ error: `Google OAuth error: ${oauthError}` });
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) {
      return res.status(400).json({ error: "Missing OAuth code" });
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const tokenPayload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) {
      const providerError = typeof tokenPayload?.error_description === "string"
        ? tokenPayload.error_description
        : typeof tokenPayload?.error === "string"
          ? tokenPayload.error
          : "Google OAuth token exchange failed";
      throw new Error(providerError);
    }

    const accessToken = typeof tokenPayload?.access_token === "string" ? tokenPayload.access_token : "";
    const refreshTokenFromResponse = typeof tokenPayload?.refresh_token === "string" ? tokenPayload.refresh_token : "";
    const tokenType = typeof tokenPayload?.token_type === "string" ? tokenPayload.token_type : "Bearer";
    const scope = typeof tokenPayload?.scope === "string" ? tokenPayload.scope : parseScopes().join(" ");
    const expiresIn = Number(tokenPayload?.expires_in ?? 3600);
    if (!accessToken) {
      throw new Error("Google OAuth response missing access_token");
    }

    let email = "";
    const profileResponse = await fetch(GMAIL_PROFILE_URL, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    }).catch(() => null);

    if (profileResponse?.ok) {
      const profilePayload = await profileResponse.json().catch(() => ({}));
      email = typeof profilePayload?.emailAddress === "string" ? profilePayload.emailAddress : "";
    }

    const current = global.gmailIntegration ?? {};
    const refreshToken = refreshTokenFromResponse || (typeof current.refreshToken === "string" ? current.refreshToken : "");
    const expiresAt = Date.now() + ((Number.isFinite(expiresIn) ? expiresIn : 3600) * 1000);

    global.gmailIntegration = {
      accessToken,
      refreshToken,
      tokenType,
      scope,
      expiresAt,
      email,
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
            <title>Gmail Connected</title>
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
              <p class="title">Gmail connected successfully</p>
              <p class="muted">Account: <code>${email || "connected"}</code></p>
              <a class="btn" href="#" onclick="window.close(); return false;">Close this window</a>
              <p class="muted" style="margin-top: 12px;">You can return to the canvas and run your Gmail node again.</p>
            </div>
          </body>
        </html>
      `);
    }

    return res.json({ message: "Gmail connected successfully", email });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Gmail OAuth callback failed",
    });
  }
});

export default router;
