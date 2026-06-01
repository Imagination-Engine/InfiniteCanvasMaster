# IEM-MASTER-02 — Security Hardening Playbook

> Addendum to IEM-MASTER-00 and IEM-MASTER-01. Establishes the security discipline that prevents API keys, user credentials, and other secrets from leaking out of this project at any point in its life.

**Document ID:** IEM-MASTER-02
**Status:** Canonical. Required reading. Enforced by CI, pre-commit hooks, and agent CLI rules.
**Audience:** Every student, every agent CLI, every reviewer, every mentor.
**Governing principle:** A single leaked key is a worse outcome than six weeks of slower velocity. Treat accordingly.

---

## Why this document exists

Five students. Three cloud model providers (Gemini, Anthropic, fal.ai) with metered billing. Nine integrations (Gmail, Calendar, Drive, Slack, Discord, Notion, Obsidian, GitHub, filesystem) each holding OAuth tokens with real write permissions to a real person's real accounts. A public GitHub repository. Two to three agent CLIs per student, each capable of reading, writing, and sometimes echoing files. A web app meant to eventually face real users.

In that environment, any of the following end the project overnight if they happen:

- A Gemini or Anthropic API key committed to the public repo and scraped by a bot within minutes.
- A user's Gmail OAuth token leaking via a log line posted into Discord for debugging.
- A student's `.env.local` pasted into a Slack thread to "help out another student."
- An agent CLI echoing `process.env` into its own transcript, which gets shared on Twitter as a "cool demo."
- A shared team key getting rotated by one student and breaking every other student's dev loop for two days.
- A browser-exposed API key (via a `VITE_*` prefix) burning through $400 of Gemini credit in an afternoon.

Each of these has happened to student and indie projects this year. The discipline below prevents each one.

This document is not enterprise security theater. It is the smallest set of measures that holds against the realistic attacks this project faces. Every control below is implemented, tested, and enforced. Nothing is aspirational.

---

## Table of Contents

**Part I** — The Threat Model
**Part II** — The Three Secret Classes
**Part III** — Prevention (Pre-commit)
**Part IV** — Isolation (Runtime Architecture)
**Part V** — Storage (At Rest)
**Part VI** — Transmission (In Flight)
**Part VII** — Rotation and Lifecycle
**Part VIII** — Detection
**Part IX** — Incident Response
**Part X** — Agent CLI Security Protocol
**Part XI** — Student Security Onboarding
**Part XII** — CI/CD Security Gates
**Part XIII** — Known-Good Configurations
**Part XIV** — The Top Ten Student Leak Patterns

Appendices

- A. The 5-Minute Hardening Checklist
- B. Per-Provider Key Rotation Guides
- C. The "Did You Leak?" Checklist

---

# Part I — The Threat Model

Three questions frame every decision in this document.

**What are we protecting?** Three classes of secret, taxonomized in Part II. Each has a different blast radius when leaked.

**Who are the attackers?** Four categories, in descending order of likelihood for a student project:

1. **Automated scrapers.** Bots that scan every new GitHub commit within minutes for patterns matching known API key formats. Zero human attention; total coverage. A key committed to a public repo is compromised in under five minutes, always.

2. **Opportunistic humans.** Someone sees a `.env` pasted in a Discord screenshot, copies the key, uses it. Not targeted; not sophisticated; very common.

3. **Careless insiders.** Students themselves, leaking their own or each other's keys through chat messages, screen shares, pasted terminal output, committed files. The largest single leak source for student projects.

4. **Targeted attackers.** Rare at this scale. A focused human trying to compromise this specific project. Unlikely until post-launch.

**What are the consequences?** Three tiers:

- **Billing nuke.** A cloud model key leaked, used at scale. $100-$1000 charged before revocation catches up.
- **Data compromise.** A user's Gmail or Notion token leaked, used to read or write to their real accounts.
- **Reputation damage.** A leak becomes public, faculty lose confidence, seed investors raise eyebrows.

Every control in this document maps to preventing at least one of these three consequences from at least one of these four attacker categories.

---

# Part II — The Three Secret Classes

Every string the project handles falls into exactly one class. Agents and students must know which class they're touching before deciding how to handle it.

## Class A — Project Infrastructure Secrets

**What:** Secrets the server needs to operate. The Gemini API key. The Anthropic API key. The fal.ai key. The Replicate token. The JWT signing secret. The database password. The master encryption key for Class C storage.

**Where they live:** Server process environment variables. Never in the database. Never on disk outside `.env.local`. Never in the client bundle. Never in git.

**Who holds them:** Each student has their own copies for local development. The deployed environment (if the team ships one) has its own copies held in the hosting provider's secret store (Vercel/Railway/Fly secrets, never plain env files on the host).

**Blast radius if leaked:** Full billing exposure for the leaked service. Potentially a provider-wide ban. Potentially a chain if the master encryption key is what leaks (Class C also compromised).

## Class B — User Integration Secrets

**What:** OAuth tokens and API keys that users provide when they connect Gmail, Slack, Notion, etc. in the Connections UI. These are **user-owned**, stored by us temporarily, and used to call external services on the user's behalf.

**Where they live:** Encrypted in the `user_integrations` Postgres table (column-encrypted with AES-256-GCM). Decrypted only at the moment of use, in memory only, in a dedicated resolver service. Never logged. Never returned to the frontend. Never echoed.

**Who holds them:** The database holds them encrypted. The running server holds them decrypted for milliseconds. No human ever reads them.

**Blast radius if leaked:** Access to a user's real Gmail or Notion or Slack. This is the most personally harmful leak class because real humans get harmed, not just billing.

## Class C — Public Configuration

**What:** Anything the frontend legitimately needs: the API base URL, the public Stripe publishable key (if ever used), the Sentry DSN (public half), the PostHog public key. Not actually secret, but sometimes confused with secrets.

**Where they live:** `.env.local` under `VITE_*` prefix, which **exposes them to the browser**. Safe only for values that would be in the client bundle regardless.

**Blast radius if leaked:** Zero. These are designed to be public.

## The Three Classes Rule

> **A secret's class determines its storage, its transport, and its visibility. Misclassifying a secret is the most common origin of a leak.**

A Class A secret must never appear as a `VITE_*` variable. A Class B secret must never be returned from an API endpoint. A Class C value must not be treated as a secret, which wastes rotation cycles on things that don't need protecting.

Every variable in `.env.example` has a comment declaring its class.

---

# Part III — Prevention (Pre-commit)

The first line of defense is never letting a secret enter git. Five layered controls.

## 3.1 Aggressive `.gitignore`

Full file in Part XIII. Key patterns:

```gitignore
# Environment files - NEVER commit
.env
.env.*
!.env.example
!.env.*.example

# Credential artifacts
*.pem
*.key
*.p12
*.pfx
*_rsa
*_dsa
*_ed25519
*.keystore

# Service account files
*service-account*.json
*credentials*.json
!**/credentials.example.json

# Agent CLI state that may contain keys
.claude/
.cursor/mcp.json
.aider.conf.yml
.cline/
.windsurfrules

# OS / editor detritus that sometimes holds secrets
.DS_Store
Thumbs.db
*.swp
```

The `!` negations re-allow `.env.example`-style templates. Never edit these negations loosely; a single wildcard slip opens the door.

## 3.2 Gitleaks pre-commit hook

[Gitleaks](https://github.com/gitleaks/gitleaks) scans every staged file for patterns matching known secret formats. Ships as a Husky pre-commit hook.

Installation (handled by `pnpm install` via the `prepare` script):

```bash
# .husky/pre-commit
pnpm exec gitleaks protect --staged --redact --verbose --config .gitleaks.toml
```

Full `.gitleaks.toml` in Part XIII. Includes standard rules plus project-specific patterns for Gemini, Anthropic, fal.ai, Replicate, Brave Search, and our internal JWT secret format.

Every student's first commit will hit this hook at some point. The failure message includes the file, the line, the kind of secret detected, and a suggested remediation. The commit is refused. The secret is still uncommitted (stayed only in the working directory), which is the intended behavior.

## 3.3 GitHub push protection

GitHub offers free push protection on public repos (and on private repos at higher plan tiers). It scans pushed commits for known secret patterns and refuses the push if any are found.

Enable at repo level:

- Repository → Settings → Code security and analysis
- Secret scanning: Enabled
- Push protection: Enabled
- Alerts: Enabled

Document enabling this as step 3 of the repo upgrade PR. It's a 30-second toggle that catches the class of leak where a student managed to bypass their local gitleaks hook (which is rare but happens, usually via `git commit --no-verify`).

## 3.4 TruffleHog in CI

[TruffleHog](https://github.com/trufflesecurity/trufflehog) is a second-layer scanner, stronger than gitleaks against entropy-based secret detection (finds secrets that don't match known patterns). Runs in CI on every PR.

`.github/workflows/security.yml`:

```yaml
name: security-scan

on:
  pull_request:
  push:
    branches: [main]

jobs:
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified
```

`--only-verified` reduces false positives by actually attempting the secret against its provider. This means a committed key is confirmed live before the CI fails. In incident response terms: if TruffleHog flags, you must rotate. No "probably not real" judgment calls.

## 3.5 The "no VITE\_ for secrets" lint rule

The most insidious leak pattern is prefixing a backend secret with `VITE_`. Vite bundles anything prefixed `VITE_` directly into the client-side bundle, where it is visible to anyone who opens browser dev tools on the deployed site.

A custom ESLint rule in `packages/core/eslint-rules/no-vite-secrets.js`:

```javascript
// Detects usage of VITE_*_KEY, VITE_*_TOKEN, VITE_*_SECRET, VITE_*_PASSWORD
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "VITE_ vars are exposed to browser. Never use for secrets.",
    },
  },
  create(context) {
    const forbidden = /^VITE_.*_(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)$/i;
    return {
      MemberExpression(node) {
        if (
          node.object?.object?.name === "import" &&
          node.object?.property?.name === "meta" &&
          node.property?.name === "env"
        ) {
          // Flagged by parent check
        }
        if (node.object?.name === "process" && node.property?.name === "env") {
          const parent = node.parent;
          if (
            parent.type === "MemberExpression" &&
            parent.property.type === "Identifier"
          ) {
            if (forbidden.test(parent.property.name)) {
              context.report({
                node: parent,
                message: `'${parent.property.name}' looks like a secret but has VITE_ prefix, which exposes it to the browser. Remove VITE_ and access it only from server code.`,
              });
            }
          }
        }
      },
    };
  },
};
```

Enabled in `.eslintrc.json` at the root. Any PR that adds `VITE_GEMINI_API_KEY` or similar fails lint before reaching CI.

---

# Part IV — Isolation (Runtime Architecture)

Even a perfectly protected secret becomes exposed if runtime code places it somewhere visible. The architecture enforces that Class A and Class B secrets **never touch the browser**.

## 4.1 The Proxy Pattern

**Rule:** The frontend never calls an external API directly. Ever. All external calls go through our Node backend.

```
Browser → Our Backend → External API (Gemini, Anthropic, Notion, etc.)
                  ↑
              API key lives here, never moves
```

This rule exists even when it would be "simpler" to call directly. A direct Gemini call from the browser requires the Gemini key to be present in the browser, which is catastrophic.

Concretely:

- The Chat Shell's streaming messages go to `POST /api/chat/stream` on our backend. The backend holds the Gemini key, forwards the request to Gemini, streams the response back. The browser never holds a Gemini key.
- The Conductor's Gmail blocks go through `POST /api/workflows/:id/run`. The backend resolves the user's Gmail OAuth token, makes the Gmail call, returns the result.
- Image generation through Reel goes to `POST /api/reel/generate`. The fal.ai key lives on the server.

**Why no exceptions:** Once an exception exists, the pattern of "I'll just put this key in the frontend because it's easier" spreads. The discipline works only when it's absolute.

## 4.2 Authentication on every API route

Every route under `/api/*` requires a valid JWT. No unauthenticated route leaks data, period. A middleware chain enforces:

```typescript
// apps/server/src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.access_token || extractBearer(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "unauthenticated" });
  try {
    const payload = verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    });
    req.user = payload as UserPayload;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
```

Applied globally:

```typescript
// apps/server/src/app.ts
app.use("/api", requireAuth); // every /api/* route requires auth
app.use("/public", publicRouter); // explicitly public: /health, /login, /signup
```

A new route inherits auth by default. Opting out requires explicit placement under `/public`.

## 4.3 CORS hardening

```typescript
// apps/server/src/middleware/cors.ts
import cors from "cors";

const allowlist = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow same-origin, curl, server-to-server
    if (allowlist.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not in allowlist`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
```

`CORS_ALLOWED_ORIGINS` in `.env.local`:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://iem.zachfoster.dev
```

Wildcard origins (`*`) are forbidden. The lint rule `no-cors-wildcard` catches attempts to add them.

## 4.4 Rate limiting

Rate limiting protects against two threats: a leaked key being abused quickly, and a compromised user session being abused quickly.

```typescript
// apps/server/src/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../redis";

// Strict limit for sensitive operations
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: "rate_limited", retryAfterSec: 900 },
  standardHeaders: true,
  legacyHeaders: false,
});

// Default limit for authenticated API
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Expensive-operation limit (AI calls)
export const aiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 1000,
  max: 15, // 15 AI calls per minute per user
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

Applied:

```typescript
app.use("/public/login", authLimiter);
app.use("/public/signup", authLimiter);
app.use("/api", apiLimiter);
app.use("/api/chat/stream", aiLimiter);
app.use("/api/reel/generate", aiLimiter);
app.use("/api/forge/run", aiLimiter);
```

Redis is required. If the team opts for a simpler path, the `rate-limiter-flexible` package can run on Postgres too. Either way, rate limiting is not optional.

## 4.5 Helmet

```typescript
// apps/server/src/app.ts
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // relaxed for Vite dev; tighten in prod
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.anthropic.com",
          "https://generativelanguage.googleapis.com",
          "https://queue.fal.run",
        ],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
```

The CSP `connectSrc` specifically allowlists the AI provider endpoints. Any new provider requires an explicit CSP update, which is a good forcing function for security review.

## 4.6 Cookie hardening

Auth cookies:

```typescript
res.cookie("access_token", jwt, {
  httpOnly: true, // not accessible to JavaScript
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
});

res.cookie("refresh_token", refreshJwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/public/refresh", // only sent to refresh endpoint
});
```

Never use `localStorage` or `sessionStorage` for tokens. The frontend _never has access to them_. Session is maintained entirely via httpOnly cookies.

## 4.7 Request body size limits

Prevent a 2GB payload from burning through AI credit:

```typescript
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
```

Routes that legitimately accept larger payloads (image upload blocks) get per-route overrides with explicit limits.

---

# Part V — Storage (At Rest)

Class B secrets (user integration credentials) must persist across sessions. They are encrypted in Postgres.

## 5.1 Column-level encryption with AES-256-GCM

The encryption happens in the application layer, not Postgres. The database sees only ciphertext. The master key never reaches the database.

`packages/core/src/crypto/secret-box.ts`:

```typescript
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";

const ALG = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function deriveKey(masterKey: string, service: string): Buffer {
  // Per-service subkey so leaking one service's wrapper doesn't leak all
  return createHash("sha256").update(`${masterKey}:${service}`).digest();
}

export function encrypt(plaintext: string, service: string): string {
  const masterKey = process.env.MASTER_ENCRYPTION_KEY;
  if (!masterKey) throw new Error("MASTER_ENCRYPTION_KEY not set");
  const key = deriveKey(masterKey, service);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Format: v1.<service>.<iv>.<tag>.<ciphertext> (base64url each part)
  return [
    "v1",
    service,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decrypt(encoded: string): string {
  const masterKey = process.env.MASTER_ENCRYPTION_KEY;
  if (!masterKey) throw new Error("MASTER_ENCRYPTION_KEY not set");
  const [version, service, ivB64, tagB64, ctB64] = encoded.split(".");
  if (version !== "v1")
    throw new Error(`unsupported secret version: ${version}`);
  const key = deriveKey(masterKey, service);
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const ct = Buffer.from(ctB64, "base64url");
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext.toString("utf8");
}
```

Three properties:

- **Per-service subkeys.** Deriving `deriveKey(master, 'gmail')` distinct from `deriveKey(master, 'notion')` means that if one service's wrapper ever leaks, it doesn't compromise the others.
- **Authenticated encryption.** GCM produces a tag that verifies the ciphertext wasn't tampered with. A modified ciphertext fails to decrypt rather than silently producing garbage.
- **Versioned format.** The `v1` prefix means we can roll key derivations forward without breaking stored secrets.

## 5.2 The `CredentialResolver` service

Nothing else in the codebase calls `decrypt()` directly. One service does:

```typescript
// packages/core/src/crypto/credential-resolver.ts
export class CredentialResolver {
  constructor(private db: DrizzleDB) {}

  async resolve(
    userId: string,
    service: string,
    label?: string,
  ): Promise<Credentials> {
    const row = await this.db.query.userIntegrations.findFirst({
      where: and(
        eq(userIntegrations.userId, userId),
        eq(userIntegrations.service, service),
        label ? eq(userIntegrations.displayLabel, label) : undefined,
      ),
    });
    if (!row) throw new CredentialsNotFoundError(service);

    if (row.expiresAt && row.expiresAt < new Date()) {
      return this.refreshAndStore(row);
    }

    const plaintext = decrypt(row.credentialsEncrypted);
    return { ...JSON.parse(plaintext), _meta: { id: row.id, service } };
  }

  async store(
    userId: string,
    service: string,
    credentials: Credentials,
    label?: string,
  ) {
    const plaintext = JSON.stringify(credentials);
    const encrypted = encrypt(plaintext, service);
    await this.db
      .insert(userIntegrations)
      .values({ /* ... */ credentialsEncrypted: encrypted });
  }

  private async refreshAndStore(row: UserIntegrationRow): Promise<Credentials> {
    // OAuth2 refresh flow; decrypt refresh token, call provider, store new access token
    // Full implementation in Part XIII.
  }
}
```

`resolve()` returns Credentials briefly. The caller (an integration MCP server) uses them immediately and does not persist them anywhere. Credentials never enter logs, never enter responses, never enter block outputs, never enter agent transcripts.

## 5.3 The master key

```
MASTER_ENCRYPTION_KEY=<32 random bytes, base64-encoded>
```

Generated with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**The master key cannot change.** Or rather, changing it requires rotating every encrypted row (decrypt with old, encrypt with new). Build the rotation script into `scripts/crypto/rotate-master-key.ts` from day one so the capability exists the moment it's needed.

**Production upgrade path.** For post-capstone deployment, move the master key from `.env` into AWS KMS, GCP KMS, or HashiCorp Vault. The application code changes minimally: `deriveKey()` becomes `await kms.decrypt()` with a wrapped data key. The interface stays the same.

## 5.4 Logging hygiene

Postgres does not log credentials because the application never passes credentials through log-emitting paths. But: logging configuration must redact even accidental leaks.

`apps/server/src/logging.ts`:

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.credentials",
      "req.body.apiKey",
      "req.body.token",
      "*.access_token",
      "*.refresh_token",
      "*.api_key",
      "*.apiKey",
      "*.credentials",
      "*.password",
      "*.secret",
      "*.privateKey",
      "*.clientSecret",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
});
```

Every known secret-shaped field is redacted. If a student adds a new integration with a field like `serviceAccountJson`, they must add it to this redaction list in the same PR. The `.agent/rules/security.md` rule catches this in review.

## 5.5 Ephemeral secrets

Some secrets are _only_ held in memory (the JWT signing secret, the master encryption key, session nonces). These live as environment variables at process start, read once into a config object, never re-read from env.

```typescript
// apps/server/src/config.ts
import { z } from "zod";

const ConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  MASTER_ENCRYPTION_KEY: z.string().min(32),
  GEMINI_API_KEY: z.string().startsWith("AIza"),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
  FAL_KEY: z.string().min(16),
  REPLICATE_API_TOKEN: z.string().startsWith("r8_").optional(),
  DATABASE_URL: z.string().startsWith("postgres"),
  CORS_ALLOWED_ORIGINS: z.string(),
  // ...
});

export const config = ConfigSchema.parse(process.env);

// Export a "safe config" for logging/display (no secrets)
export const safeConfig = {
  cors: config.CORS_ALLOWED_ORIGINS.split(","),
  databasePresent: Boolean(config.DATABASE_URL),
  aiProvidersPresent: {
    gemini: Boolean(config.GEMINI_API_KEY),
    anthropic: Boolean(config.ANTHROPIC_API_KEY),
    fal: Boolean(config.FAL_KEY),
    replicate: Boolean(config.REPLICATE_API_TOKEN),
  },
};
```

Never log `config`. Log `safeConfig` at startup to confirm providers are wired without exposing keys.

---

# Part VI — Transmission (In Flight)

Secrets in memory must stay in memory. Three controls.

## 6.1 HTTPS everywhere (production)

For the deployed environment, HTTPS is non-negotiable. Vercel, Railway, Fly.io, and similar platforms enforce this by default; verify the `Strict-Transport-Security` header is present:

```typescript
// enforced by helmet() above
// HSTS: max-age=31536000; includeSubDomains; preload
```

For local development, HTTP on localhost is acceptable. Never accept HTTP for any non-localhost deployment.

## 6.2 Sanitized error responses

Errors are the most common accidental leak channel. A student hits an error, the full error object (including the API key that was in the request) gets returned to the browser, gets logged to Sentry, gets pasted into a bug report.

Middleware:

```typescript
// apps/server/src/middleware/error-handler.ts
import type { ErrorRequestHandler } from "express";
import { logger } from "../logging";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id;
  const isProduction = process.env.NODE_ENV === "production";

  logger.error({ err, requestId, path: req.path }, "request failed");

  if (res.headersSent) return;

  // The client sees an opaque error with a request ID they can report.
  // The server has the full context in the log, keyed by that request ID.
  res.status(err.status || 500).json({
    error: isProduction ? "internal_error" : err.name,
    message: isProduction
      ? "An error occurred. Reference ID: " + requestId
      : err.message,
    requestId,
  });
};
```

The browser never sees the actual exception stack or message in production. Developers debug via the request ID in the server log. This costs five seconds of debugging time and prevents a whole class of leak.

## 6.3 No secrets in URLs

API keys go in headers or in encrypted request bodies. Never in query parameters. URLs appear in browser history, server access logs, referrer headers, CDN logs, and proxy logs. A key placed in `?apiKey=...` is leaked to at least five places you don't control.

ESLint rule `no-secrets-in-url` (custom, in our eslint config) flags patterns like:

```typescript
// ❌ DETECTED AND FAILED
fetch(`https://api.example.com?api_key=${apiKey}`);

// ✅ OK
fetch(`https://api.example.com`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
```

---

# Part VII — Rotation and Lifecycle

Secrets have a lifetime. Assume every key is eventually going to leak. Rotation is the control that limits the blast when it does.

## 7.1 Rotation schedule

| Secret                           | Rotation cadence    | Triggered by                         |
| -------------------------------- | ------------------- | ------------------------------------ |
| `JWT_SECRET`                     | Every 90 days       | Calendar + any session compromise    |
| `MASTER_ENCRYPTION_KEY`          | Every 180 days      | Calendar + any team-member departure |
| Gemini / Anthropic / fal.ai keys | Every 90 days       | Calendar + any usage anomaly         |
| Database password                | Every 90 days       | Calendar + any infrastructure change |
| OAuth tokens (user)              | Automatic (refresh) | Provider expiry                      |
| OAuth refresh tokens (user)      | Every 180 days      | Provider policy                      |

The calendar cadence is enforced by a GitHub Action that opens an issue 7 days before rotation is due:

```yaml
# .github/workflows/rotation-reminder.yml
on:
  schedule:
    - cron: "0 9 * * 1" # Monday 09:00 UTC
jobs:
  check-rotation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm iem:check-rotation-due
      # Script reads docs/security/rotation-log.md, compares to today, opens issues.
```

## 7.2 The rotation log

`docs/security/rotation-log.md`:

```markdown
# Rotation Log

## JWT_SECRET

- 2026-01-15 — Initial value set
- 2026-04-15 — Rotated (scheduled 90-day)
- (next due 2026-07-14)

## MASTER_ENCRYPTION_KEY

- 2026-01-15 — Initial value set
- (next due 2026-07-14 — 180-day)

## GEMINI_API_KEY

- 2026-01-15 — Created in console
- (next due 2026-04-15)

## ANTHROPIC_API_KEY

- 2026-01-15 — Created in console
- (next due 2026-04-15)
```

Every rotation appends an entry. The mentor reviews the log monthly.

## 7.3 OAuth token refresh

User integration tokens are short-lived by design. The `CredentialResolver.refreshAndStore()` method is the single code path that handles expiry:

```typescript
private async refreshAndStore(row: UserIntegrationRow): Promise<Credentials> {
  const service = SERVICES[row.service]
  if (!service?.refresh) {
    // Non-refreshable (API key, not OAuth). Surface to user.
    throw new CredentialsExpiredError(row.service, 're-connect required')
  }

  const oldCreds = JSON.parse(decrypt(row.credentialsEncrypted))
  const newCreds = await service.refresh(oldCreds.refreshToken)

  const encrypted = encrypt(JSON.stringify(newCreds), row.service)
  await this.db
    .update(userIntegrations)
    .set({
      credentialsEncrypted: encrypted,
      expiresAt: newCreds.expiresAt,
      lastUsedAt: new Date(),
    })
    .where(eq(userIntegrations.id, row.id))

  return newCreds
}
```

Refresh failures surface to the user in the Connections UI with a clear "reconnect this integration" CTA. They do _not_ fail silently.

## 7.4 Scoped keys always

When obtaining any API key or OAuth token:

- **Scope narrowly.** Gmail-send-only if only send is needed. Not full Gmail.
- **Use read-only if possible.** Notion reader scope is safer than full workspace.
- **Prefer short-lived.** Pick the shortest access token expiry the provider allows.

This is a key-issuance discipline, not a code pattern. The Connections UI's OAuth flow specifies minimum scopes. Review the scope list whenever adding a new integration.

## 7.5 Environment separation

Three environments, three sets of keys:

- **Dev:** Each student's personal free-tier keys. Never shared.
- **Staging** (if set up): Project keys, funded from project budget, restricted to staging environment.
- **Production:** Project keys, funded from project budget, stricter rate limits, monitored.

A Gemini key issued for dev has no rate limit or IP restriction. A Gemini key for production is IP-restricted to the production host. Leaking a dev key costs a student their own $5 of credit; leaking a production key costs the project.

---

# Part VIII — Detection

Prevention and isolation are the primary controls. Detection catches what prevention misses.

## 8.1 Continuous secret scanning

Already specified: gitleaks pre-commit (Section 3.2), GitHub push protection (3.3), TruffleHog in CI (3.4). Together they cover:

- Commits that would introduce a secret (gitleaks, local).
- Pushes that contain a secret (GitHub push protection, pre-receive).
- Merged PRs whose diff contains a secret (TruffleHog, CI).

## 8.2 Usage anomaly monitoring

Each AI provider shows usage dashboards:

- **Gemini:** Google Cloud Console → APIs & Services → Dashboard.
- **Anthropic:** Console → Usage.
- **fal.ai:** Dashboard → Usage.

The mentor (or a rotating student per-week) checks these weekly for anomalies. A 10x spike in usage within an hour is a leak signal. The check takes two minutes.

## 8.3 Authentication anomaly monitoring

Failed login attempts and unusual session patterns are logged and surfaced:

```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,       -- 'login_success', 'login_failure', 'session_refresh', 'logout', 'password_change'
  ip INET,
  user_agent TEXT,
  at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX ON auth_events (user_id, at DESC);
CREATE INDEX ON auth_events (event_type, at DESC);
```

A weekly dashboard:

```sql
-- Failed logins in last 7d, grouped by ip, sorted by count desc
SELECT ip, count(*) as attempts
FROM auth_events
WHERE event_type = 'login_failure' AND at > now() - interval '7 days'
GROUP BY ip ORDER BY attempts DESC LIMIT 20;
```

## 8.4 Dependency vulnerability monitoring

Dependabot is enabled at the repo level:

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      security:
        applies-to: security-updates
        patterns: ["*"]
    open-pull-requests-limit: 10
```

Combined with `pnpm audit --audit-level=high` in CI:

```yaml
- name: Audit dependencies
  run: pnpm audit --audit-level=high --prod
```

A high-severity vulnerability fails CI. Low/moderate are tracked but not blocking.

## 8.5 The weekly security rollup

Every Friday, alongside the demo tag, a security rollup runs:

```bash
pnpm iem:security-audit
```

The script produces `docs/security/audit/week-NN.md`:

```markdown
# Security Audit — Week NN

## Secret scanning

- Gitleaks: 0 findings this week.
- TruffleHog CI runs: 12 runs, 0 findings.
- GitHub push protection blocks: 0.

## Dependency health

- pnpm audit: 0 high, 2 moderate (see list below).
- Dependabot open PRs: 3 (groomed; 1 merged, 2 in review).

## Authentication health

- Total logins: 427.
- Failed logins: 8 (all same student debugging, not a pattern).
- New IPs: 3 (all expected).

## Rotation

- 0 keys rotated this week.
- Next rotation due: 2026-MM-DD (JWT_SECRET).

## Anomalies

- Gemini usage: 142k tokens. 18% above 4-week average. Within normal.
- Anthropic usage: 89k tokens. Consistent.
- fal.ai generations: 47. Consistent.

## Actions from this audit

- [ ] None.
```

Mentor reviews for 5 minutes. If any line says "anomaly detected," it becomes a triage item.

---

# Part IX — Incident Response

When a leak happens, speed matters more than diagnosis. The rule is **rotate first, investigate second.**

## 9.1 The 15-minute drill

Pin the playbook in Slack/Discord. When a leak is suspected:

```
1. Within 2 minutes: REVOKE the key at the provider.
   - Gemini: https://aistudio.google.com/apikey
   - Anthropic: https://console.anthropic.com/settings/keys
   - fal.ai: https://fal.ai/dashboard/keys
   - Replicate: https://replicate.com/account/api-tokens
   - GitHub: https://github.com/settings/tokens

2. Within 5 minutes: Issue a new key.
3. Within 8 minutes: Update the key in the deployment environment.
4. Within 10 minutes: Notify the team (Slack/Discord).
5. Within 15 minutes: Verify production is healthy with the new key.

Then, and only then:
6. Investigate how it leaked.
7. Document the incident in docs/security/incidents/YYYY-MM-DD-slug.md.
8. Write or update an ADR if the pattern requires a new rule.
```

The drill is practiced quarterly. "Simulated leak" is announced at 2pm; the team runs the full 15-minute flow against a designated-expendable dev key. The practice keeps the muscle memory fresh.

## 9.2 Git history scrubbing

If a secret reached the public repo (despite all prevention), the key is already compromised and rotation is the primary response. History scrubbing is a secondary measure, because the attacker already grabbed it.

Still, scrub to prevent re-compromise:

```bash
# Preferred: git-filter-repo
pip install git-filter-repo
git filter-repo --invert-paths --path path/to/leaked/file
# Or replace specific content:
git filter-repo --replace-text expressions.txt

# Force push to rewrite history
git push --force-with-lease origin main
# Notify all collaborators - their local clones are now invalid
```

Every student re-clones after a force push. Their old local repos are frozen in time at the compromise. This disruption is unavoidable and is a strong incentive to prevent the leak in the first place.

## 9.3 The incident record

`docs/security/incidents/2026-04-20-gemini-key-commit.md`:

```markdown
# Incident: Gemini API key committed to main

## Timeline

- 14:23 PDT — Key committed in PR #142 (squash-merged).
- 14:27 PDT — TruffleHog Action flagged the merge commit. Slack ping.
- 14:29 PDT — Key revoked on Google AI Studio.
- 14:31 PDT — New key issued; added to deployment.
- 14:34 PDT — Deployment validated with new key.
- 14:45 PDT — History scrubbed via git-filter-repo.
- 14:50 PDT — Force push; team notified to re-clone.

## Root cause

Student was testing locally, placed GEMINI_API_KEY in a file named
`test-config.json` instead of `.env.local`. The file matched no .gitignore
pattern because it was a .json not a .env. Committed as part of the
PR's test fixtures.

## What allowed it past prevention

- Gitleaks did not scan \*.json by default for Google API key patterns.
  The default config looks in text files for values but our config was
  missing the Google API key rule specifically.
- Pre-commit hook was skipped with --no-verify because the student was
  in a rush.

## Corrective actions

- [x] Added GEMINI_API_KEY pattern to .gitleaks.toml.
- [x] Added _config_.json to .gitignore (negated \*.example.json).
- [x] Husky hook now blocks --no-verify (config bypassable only with
      explicit admin override, not by individual students).
- [x] ADR-0014: Config-file naming convention prohibits API key
      storage in any .json file.

## Learnings

- Regex-based detection needs positive coverage across every file type
  a secret could plausibly live in, not just `.env`.
- `--no-verify` is a foot-gun under time pressure. Policy-level blocking
  is the right response.
```

The incident file is canonical. Faculty reading it six months later understand what happened and what changed. This is forensic hygiene.

---

# Part X — Agent CLI Security Protocol

Students pair with agent CLIs. Those CLIs can, if unguided, leak secrets in four ways:

1. Echo them in terminal output (which the student might screenshot).
2. Write them into files (which might get committed).
3. Include them in pasted-back transcripts (which might get shared).
4. Use them in generated code (hard-coding instead of referencing env).

The `.agent/rules/security.md` file, read by every CLI session per Part VI.3 of MASTER-01, governs these behaviors.

## 10.1 The rule file

`.agent/rules/security.md`:

```markdown
# Agent Security Rules

## Never echo secrets

If you need to show the user what environment variables are set, show
the _names_, never the values. `env | grep KEY` or `printenv GEMINI_API_KEY`
is forbidden in examples you generate.

Safe: "Check that GEMINI_API_KEY is set in your .env.local."
Unsafe: "Your GEMINI_API_KEY is AIza_MOCK_KEY"

## Never write secrets to files

If the user pastes a secret into chat and asks you to put it in a file:

1. Refuse to write the literal value.
2. Instead, instruct the user to put it in `.env.local` and show them
   the code that references `process.env.KEY_NAME`.
3. Warn them that the pasted message containing the literal value is
   now in your chat history.

## Never hard-code secrets in generated code

If the user describes an API they want to call, write code that references
environment variables. Never inline the key. If the user says "here's my
key, just use it," refuse the inline and provide the env-variable version.

## Detect and refuse paste of secrets

If the user's message contains a string matching a known secret pattern
(starts with `AIza`, `sk-ant-`, `sk-`, `r8_`, `ghp_`, `github_pat_`, etc.),
immediately respond:

"I detected what looks like an API key in your message. Please:

1. Revoke that key at the provider (it may be compromised now).
2. Issue a new one.
3. Put the new one in .env.local.
4. Delete this chat message.

I will not proceed with the original task until the key is rotated."

This applies even if the user says "this is a test key" or "ignore this."
Agent-facing paranoia is the correct default.

## Never assume config is safe

Before reading any .env file, warn that its contents will enter your
context. Ask the user to confirm they want you to proceed. Offer
redaction ("I can read only the variable names, not the values") as
the default.

## When asked to debug a production issue involving secrets

Do not ask for the secret. Ask for the request ID. Help the user
correlate logs. Logs are redacted (per Pino config); traces are not.

## When generating documentation

Never include sample values that look like real secrets. Use clearly
fake patterns: "YOUR_GEMINI_API_KEY_HERE" or "AIza...REDACTED...xyz".

## Redact from screenshots

If the user shares a screenshot that contains visible secrets, your
first response is: "I see a secret in that screenshot at [location].
Please revoke and reissue. Do not share that screenshot further."
```

## 10.2 The boot-sequence reminder

Section 24 of MASTER-00 specifies the agent session boot sequence. Add a line to Stage 3 (Rules): "Pay special attention to `.agent/rules/security.md`. Security rules override helpfulness. Refusing a request because it involves a leaked or pasted secret is always correct."

## 10.3 The reviewer's security check

Section 22 of MASTER-00 specifies the four-lens review rubric. Add a fifth lens for any PR that touches authentication, integration, or configuration code:

**Security.** Does this PR introduce or expand a code path that handles secrets? Are all secrets-touching lines accompanied by tests asserting no-leak behavior? Are logging/error paths audited for redaction? Are new env vars added to `.env.example` with class annotations?

The Adversary rotation role (MASTER-00 Section 22.2) has "secret leak" as one of its four mandatory hunt categories.

---

# Part XI — Student Security Onboarding

Every student, in their first week, completes this onboarding. It is tracked in `docs/security/onboarding/<student>.md`.

## 11.1 The checklist

```markdown
# Security Onboarding — [student name]

Completed on: YYYY-MM-DD

## Personal hygiene

- [ ] I have installed 1Password (or the team-approved alternative).
- [ ] I have a dedicated "iem" vault with a unique master password.
- [ ] I have 2FA enabled on my GitHub account.
- [ ] I have 2FA enabled on every provider account (Google, Anthropic, fal.ai).
- [ ] I have read IEM-MASTER-02 in full.

## Keys obtained

- [ ] Gemini API key, stored in 1Password "iem" vault.
- [ ] Anthropic API key, stored in 1Password.
- [ ] fal.ai API key, stored in 1Password.
- [ ] (Optional) Replicate API token, stored in 1Password.
- [ ] Each key copied to my local `.env.local` (never committed).
- [ ] I understand each of these is MY key, not a shared team key.

## Local setup verified

- [ ] `.env.local` exists, is gitignored, contains my keys.
- [ ] `.env.example` exists, is committed, contains only placeholders.
- [ ] `git status` shows no tracked `.env` files.
- [ ] Husky hooks run on commit (tested with a dummy commit).

## Agent CLI configured

- [ ] My agent CLI has `.agent/rules/security.md` in its context.
- [ ] I verified the CLI refuses to echo pasted secrets (tested).
- [ ] I verified the CLI refuses to hard-code keys in generated code (tested).

## Understood protocols

- [ ] I understand the 15-minute leak drill (Part IX.1).
- [ ] I understand "never in VITE\_\*" (Part III.5).
- [ ] I understand "backend proxies all external calls" (Part IV.1).
- [ ] I understand "rotate on suspicion" (Part IX.1).
- [ ] I know which channel to use to report a suspected leak.

## Signed by

- [ ] Student: [name]
- [ ] Mentor: [name]
```

The mentor countersigns only after watching the student complete the "tested with a dummy commit" items in a screen-share. This costs 15 minutes per student and is worth it.

## 11.2 Where to get keys

A one-page quick-reference:

```markdown
# How to get your own API keys

## Gemini (free tier)

1. Go to https://aistudio.google.com/apikey
2. Sign in with your personal Google account.
3. Click "Create API Key" -> "Create API key in new project".
4. Name the project "iem-<your-name>-dev".
5. Copy the key. Paste into 1Password "iem" vault.
6. Add to `.env.local`: GEMINI_API_KEY=AIza...

Free tier limits are generous. If you exceed, upgrade to pay-as-you-go
with a $5/month cap set in the GCP billing console.

## Anthropic ($5 trial credit)

1. Go to https://console.anthropic.com/
2. Sign in or create account.
3. Settings -> API Keys -> Create Key.
4. Name it "iem-<your-name>-dev".
5. Copy. 1Password. `.env.local`.

Set a billing alert at $5 so you know before you go over.

## fal.ai ($5 trial credit)

1. Go to https://fal.ai/dashboard/keys
2. Sign in with GitHub.
3. Create API Key.
4. Copy. 1Password. `.env.local`.

## Replicate (optional, for Reel)

1. Go to https://replicate.com/account/api-tokens
2. Create Token.
3. Copy. 1Password. `.env.local`.
```

Students obtain keys before Week 9. The mentor does not hold any student's keys and does not gift team-wide keys. This is a deliberate choice: each student bears full ownership of their own credentials, which teaches the habit that sticks.

## 11.3 Shared team keys — deliberately avoided

It would be easier to have one team-wide Gemini key. It would also mean any student's leak compromises everyone. And rotation disrupts everyone at once. And there's no way to know who leaked it.

**Rule: No shared team keys for cloud AI providers.** Every student has their own. The deployment environment has its own, distinct from any student's.

Shared keys are acceptable only for shared infrastructure (the production database password, the production master encryption key) where "shared" is reduced to "the two people with deploy access know it and it lives in the hosting provider's secret store."

---

# Part XII — CI/CD Security Gates

Every gate specified below is implemented in the first repo-upgrade PR. Every gate is required (no PR merges with a gate failing; no admin override without justification in an ADR).

| Gate                     | Implementation                        | Blocks                                           |
| ------------------------ | ------------------------------------- | ------------------------------------------------ |
| Gitleaks pre-commit      | Husky + gitleaks                      | Local commits with secrets                       |
| GitHub secret scanning   | Repo settings                         | Pushes with known-pattern secrets                |
| GitHub push protection   | Repo settings                         | Same, tighter                                    |
| TruffleHog CI            | `.github/workflows/security.yml`      | PR merges with secrets                           |
| VITE\_\*\_KEY lint       | Custom ESLint rule                    | PRs that expose secrets to browser               |
| No-secrets-in-url lint   | Custom ESLint rule                    | PRs that put keys in URLs                        |
| No-cors-wildcard lint    | Custom ESLint rule                    | PRs with CORS `*`                                |
| Dependency audit         | `pnpm audit --audit-level=high` in CI | PRs with high CVEs                               |
| Dependabot               | Repo config                           | Outdated deps unclosed                           |
| Helmet presence          | Integration test                      | Server start without helmet                      |
| CSP presence             | Integration test                      | CSP headers missing                              |
| httpOnly cookies         | Integration test                      | Auth cookies without httpOnly                    |
| HTTPS enforcement (prod) | Middleware + test                     | Non-HTTPS traffic in prod                        |
| Rate limiter presence    | Integration test                      | API routes without limiter                       |
| Auth middleware presence | Integration test                      | /api/\* routes missing auth                      |
| JWT secret entropy       | Startup check                         | JWT_SECRET < 32 chars                            |
| Master key entropy       | Startup check                         | MASTER_ENCRYPTION_KEY < 32 chars                 |
| Pino redaction config    | Integration test                      | New secret-shaped fields without redaction entry |
| `.env` in git history    | Pre-receive (manual check)            | Attempts to introduce tracked .env               |

A PR that fails any of these fails the merge, period. Admin bypass requires a one-line ADR justifying the exception.

---

# Part XIII — Known-Good Configurations

Full copy-paste-ready configurations. Every item below lands in the repo as part of the first upgrade PR.

## 13.1 `.env.example`

```bash
# ============================================================================
# Imagination Engine — Environment Configuration
# ============================================================================
# Copy this file to .env.local (gitignored) and fill in real values.
# Every variable has a class: A (backend-only), B (user-provided, N/A here),
# C (public, safe for browser via VITE_ prefix).
#
# CRITICAL: Never commit .env.local. Never add VITE_ prefix to Class A vars.
# ============================================================================

# ─── Class A — Backend-only secrets ──────────────────────────────────────────

# JWT signing. Generate with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=GENERATE_ME_MINIMUM_32_CHARS

# Master encryption key for user-integration credentials. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
# WARNING: Changing this invalidates every encrypted user credential.
MASTER_ENCRYPTION_KEY=GENERATE_ME_MINIMUM_32_CHARS

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iem

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# AI Providers (each student uses their own keys)
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
FAL_KEY=
REPLICATE_API_TOKEN=

# Optional (for integrations)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Development mock mode (set to 1 to run without external API calls)
IEM_MOCK_MODELS=0

# ─── Class C — Public configuration (safe for browser) ───────────────────────

VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=Imagination Engine
# ⚠️ DO NOT ADD API KEYS OR TOKENS UNDER VITE_ PREFIX. They will be bundled
# into the browser. Custom ESLint rule `no-vite-secrets` catches this.

# ─── CORS / Hosts ────────────────────────────────────────────────────────────

CORS_ALLOWED_ORIGINS=http://localhost:5173

# ─── Observability ───────────────────────────────────────────────────────────

LOG_LEVEL=info
NODE_ENV=development
```

## 13.2 `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment - Class A secrets MUST NEVER be committed
.env
.env.*
!.env.example
!.env.*.example

# Credential artifacts
*.pem
*.key
*.p12
*.pfx
*_rsa
*_dsa
*_ed25519
*.keystore
*service-account*.json
*credentials*.json
*config.local.json
!**/credentials.example.json

# Agent CLI state
.claude/
.cursor/mcp.json
.aider.conf.yml
.cline/
.windsurfrules.local

# Test / coverage
coverage/
.nyc_output/
playwright-report/
test-results/

# Logs
*.log
logs/

# OS / editor
.DS_Store
Thumbs.db
*.swp
*.swo
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json

# Local DB snapshots
*.sqlite
*.sqlite-journal
*.db
pgdata/

# Turbo
.turbo/

# Vite
.vite/
```

## 13.3 `.gitleaks.toml`

```toml
title = "Imagination Engine - Gitleaks Config"

[extend]
useDefault = true

# Add project-specific rules

[[rules]]
id = "gemini-api-key"
description = "Google Gemini / GCP API key"
regex = '''AIza[0-9A-Za-z\-_]{35}'''
keywords = ["AIza"]

[[rules]]
id = "anthropic-api-key"
description = "Anthropic API key"
regex = '''sk-ant-[a-zA-Z0-9\-_]{80,}'''
keywords = ["sk-ant-"]

[[rules]]
id = "fal-api-key"
description = "fal.ai API key"
regex = '''fal-[a-z0-9\-]{40,}'''
keywords = ["fal-"]

[[rules]]
id = "replicate-api-token"
description = "Replicate API token"
regex = '''r8_[a-zA-Z0-9]{37,}'''
keywords = ["r8_"]

[[rules]]
id = "github-pat-new"
description = "GitHub Personal Access Token (fine-grained)"
regex = '''github_pat_[a-zA-Z0-9_]{82}'''
keywords = ["github_pat_"]

[[rules]]
id = "iem-jwt-secret"
description = "Project JWT_SECRET in env-like context"
regex = '''(?i)(jwt_secret)[\s]*=[\s]*['"]?([A-Za-z0-9+/_\-]{32,})'''
keywords = ["jwt_secret"]

[[rules]]
id = "iem-master-key"
description = "Project MASTER_ENCRYPTION_KEY"
regex = '''(?i)(master_encryption_key)[\s]*=[\s]*['"]?([A-Za-z0-9+/_\-]{32,})'''
keywords = ["master_encryption_key"]

[allowlist]
description = "Allowlisted patterns"
paths = [
  '''\.env\.example$''',
  '''docs/specs/.*\.md$''',  # specs may reference placeholder keys
  '''packages/.*/test/fixtures/.*''',
]
regexes = [
  '''AIza[.]{3}REDACTED[.]{3}''',
  '''sk-ant-[.]{3}REDACTED''',
  '''YOUR_[A-Z_]+_HERE''',
]
```

## 13.4 Husky pre-commit

`.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "→ Running gitleaks..."
pnpm exec gitleaks protect --staged --redact --verbose --config .gitleaks.toml || {
  echo ""
  echo "✖ Gitleaks detected a secret in your staged changes."
  echo "  The commit was NOT created. The file with the secret is still staged."
  echo ""
  echo "  Remediation:"
  echo "  1. Remove the secret from the file."
  echo "  2. If the secret is real, revoke it at the provider and issue a new one."
  echo "  3. Put the new secret in .env.local (gitignored), not in any tracked file."
  echo "  4. Re-stage and commit."
  echo ""
  exit 1
}

echo "→ Running lint-staged..."
pnpm exec lint-staged || exit 1

echo "→ Running type check..."
pnpm exec tsc --noEmit || exit 1

echo "✓ Pre-commit checks passed."
```

`.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
pnpm exec commitlint --edit "$1"
```

Block `--no-verify`:

```javascript
// scripts/block-no-verify.js (registered as a repo policy, not a hook)
// Husky cannot itself block --no-verify; we add a CI check that
// compares the PR's commits against what the hooks would have flagged.
```

More robust: a pre-receive hook in the server-side GitHub config (requires GitHub Advanced Security or Enterprise) or a mandatory status check in branch protection. For capstone scope, the `--no-verify` incident is a teachable moment, not a hard block.

## 13.5 Express middleware stack

`apps/server/src/app.ts`:

```typescript
import express from "express";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { config } from "./config";
import { logger } from "./logging";
import { corsMiddleware } from "./middleware/cors";
import { helmetMiddleware } from "./middleware/helmet";
import { apiLimiter, authLimiter } from "./middleware/rate-limit";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { requestIdMiddleware } from "./middleware/request-id";
import { publicRouter } from "./routes/public";
import { apiRouter } from "./routes/api";

const app = express();

// Trust proxy for X-Forwarded-* headers from hosting platform
app.set("trust proxy", 1);

// Security headers
app.use(helmetMiddleware);

// Request ID for correlation
app.use(requestIdMiddleware);

// Logging with redaction
app.use(
  pinoHttp({
    logger,
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      censor: "[REDACTED]",
    },
  }),
);

// Body parsing with hard limit
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// CORS
app.use(corsMiddleware);

// Rate limiters (applied per-route below)
// Auth routes
app.use("/public/login", authLimiter);
app.use("/public/signup", authLimiter);

// Public routes (no auth required)
app.use("/public", publicRouter);

// Authenticated routes (all /api/* require auth)
app.use("/api", apiLimiter, requireAuth, apiRouter);

// Error handler must be last
app.use(errorHandler);

export { app };
```

## 13.6 `.eslintrc.json` security-relevant rules

```json
{
  "extends": ["@iem/eslint-config"],
  "plugins": ["@iem/security"],
  "rules": {
    "@iem/security/no-vite-secrets": "error",
    "@iem/security/no-secrets-in-url": "error",
    "@iem/security/no-cors-wildcard": "error",
    "@iem/security/no-insecure-cookies": "error",
    "@iem/security/require-error-sanitization": "warn",
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "fs",
            "importNames": ["readFileSync"],
            "message": "Do not synchronously read secret files. Use async fs/promises and sanitize."
          }
        ]
      }
    ]
  }
}
```

## 13.7 Pino logging with redaction

Already shown in Section 5.4. Reproduced here with the full redaction path list for reference.

## 13.8 GitHub workflow — full security job

`.github/workflows/security.yml`:

```yaml
name: security

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1" # Mondays 06:00 UTC, catches drift

jobs:
  secret-scan:
    name: Secret scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified

  dep-audit:
    name: Dependency audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - name: Audit
        run: pnpm audit --audit-level=high --prod

  codeql:
    name: CodeQL
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript-typescript }
      - uses: github/codeql-action/analyze@v3

  security-tests:
    name: Security integration tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - name: Run security integration tests
        run: pnpm test -- --project=security
        env:
          # Use dummy values in CI — tests verify shape, not real auth
          JWT_SECRET: ci_dummy_jwt_secret_must_be_32_characters_long
          MASTER_ENCRYPTION_KEY: ci_dummy_master_key_must_be_32_characters_long
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/iem
          IEM_MOCK_MODELS: "1"
```

---

# Part XIV — The Top Ten Student Leak Patterns

Known failure modes. Every student reads this list in onboarding.

1. **Pasting `.env` into Slack to help another student.** The message persists. Search finds it. Rotate.

2. **Prefixing `VITE_GEMINI_API_KEY` instead of `GEMINI_API_KEY`.** The key ships in the browser bundle. Anyone opens dev tools, has the key.

3. **Committing a test fixture JSON with a real key.** `.gitignore` does not cover arbitrary JSON. The file lands on public GitHub. Scrapers find it in minutes.

4. **`git commit --no-verify` under time pressure.** Bypasses gitleaks, the one control designed for this moment. Key enters repo.

5. **Pasting full terminal output including `printenv` into an issue comment or chat.** The entire env dumps. Every key leaks.

6. **Hard-coding a key in generated AI code that the student didn't read carefully.** Agent suggests `const apiKey = "AIza..."`, student approves without reading, ships.

7. **Using a personal key for production deployment.** Rotation affects dev; deploy keys should be separate and scoped.

8. **Logging a full request object including Authorization header.** Request logs contain JWT. JWT lives in log aggregator forever.

9. **Screenshot of a working feature that includes a key visible in browser dev tools or in the error toast.** Image is uploaded to Discord, Slack, or Twitter.

10. **`.env.backup` or `.env.old` created by an editor plugin, not matching `.env*` glob because it's `.env_backup`.** `.gitignore` misses it.

Every pattern has a specific mitigation in Parts III through XII. The knowledge that these are common is itself a mitigation, because the student thinks "is this pattern 5?" before pasting.

---

# Appendix A — The 5-Minute Hardening Checklist

If a student can only do five things, these five:

```
☐ 1. Ensure .env.local is gitignored. Run `git status` and verify.
☐ 2. Remove any VITE_*_KEY, VITE_*_TOKEN, VITE_*_SECRET from any .env file.
☐ 3. Verify pre-commit hooks run. Make a dummy commit with a fake
      AIza_MOCK_TEST_KEY and confirm gitleaks blocks it.
☐ 4. Verify your keys are in 1Password, not in any chat history.
☐ 5. Read Part IX.1 (15-minute leak drill). Memorize the first two steps:
      revoke, then reissue.
```

---

# Appendix B — Per-Provider Key Rotation Guides

## Gemini

- https://aistudio.google.com/apikey
- "Delete" the compromised key. Create new. Update `.env.local`.
- Billing impact takes effect within a minute.

## Anthropic

- https://console.anthropic.com/settings/keys
- "Disable" then "Delete". Issue new. Update.
- Billing impact immediate.

## fal.ai

- https://fal.ai/dashboard/keys
- Revoke. Issue new. Update.

## Replicate

- https://replicate.com/account/api-tokens
- Revoke. Issue new. Update.

## GitHub (PAT or fine-grained token)

- https://github.com/settings/tokens
- Revoke the compromised token. Issue new. Update any CI or local git config.

## Google OAuth (Gmail, Calendar, Drive)

- https://console.cloud.google.com/apis/credentials
- Delete the OAuth client. Create new. Update `.env.local`. Re-authorize in the Connections UI.

## Slack

- https://api.slack.com/apps
- Select app → Settings → Install App → Revoke Tokens. Reinstall. Update.

## Notion

- https://www.notion.so/my-integrations
- Regenerate token. Update.

Every provider's rotation is under two minutes. Practice once.

---

# Appendix C — The "Did You Leak?" Checklist

If you suspect you leaked, run this checklist in the next two minutes.

```
☐ 1. Revoke the key at the provider. Now. Reading the rest of this
      list comes after revocation.

☐ 2. Check git log for the file/commit containing the key.
      git log --all --oneline -S "AIza..." (replace with actual pattern)

☐ 3. If it was pushed:
      - Is the repo public? If yes, assume it's compromised.
      - Is it in main? Check `git log main -S "..."`.
      - If in main, rotate regardless — scrubbing history doesn't un-leak.

☐ 4. Notify the team in the #security channel with:
      - What leaked (redact the actual value, describe the class)
      - When
      - What you've done (revoked, reissued)
      - What you need from others (new deploy secrets, re-clone, etc.)

☐ 5. Within 24 hours, write the incident doc (Section IX.3 template).

☐ 6. Within 1 week, contribute a rule or improvement to prevent
      this pattern for everyone. This is how the system gets safer.
```

---

## Closing

Five students. Three API providers. Nine integrations. One public repo. One master key. The threat surface is not small.

What's small is the set of disciplines that protect it. `.gitignore` done once. Husky hook installed once. TruffleHog in CI set up once. The three-class taxonomy internalized once. The 15-minute drill memorized once. After that, the disciplines run themselves.

The cost of this document is a week of setup. The benefit is that at the end of six weeks, no one had to write an incident report, and the demo day conversation is about the engine, not about the leak.

— IEM-MASTER-02. Canonical. Enforced.
