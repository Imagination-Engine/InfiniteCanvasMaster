# Imagination Canvas

Minimal full-stack baseline for:
- Auth (signup/login/logout/refresh) with PostgreSQL-backed sessions
- Per-user projects
- Two canvases per project (`creativity`, `work`)
- Canvas JSON persisted in PostgreSQL `jsonb`
- React Flow UI that can load/save canvas documents

## Stack
- Frontend: React + Vite + React Router + React Flow
- Backend: Express + TypeScript
- DB: PostgreSQL
- Auth: bcrypt password hashing + JWT access token + rotating refresh-token sessions

## Data model (PostgreSQL)

### `users`
- `id uuid pk`
- `username text unique`
- `password_hash text`
- `created_at timestamptz`

### `sessions`
- `id uuid pk`
- `user_id uuid fk users`
- `refresh_token_hash text unique`
- `expires_at timestamptz`
- `revoked_at timestamptz null`
- `user_agent`, `ip_address`, `created_at`

### `projects`
- `id uuid pk`
- `user_id uuid fk users`
- `name text`
- `created_at`, `updated_at`
- unique constraint: `(user_id, name)`

### `canvases`
- `id uuid pk`
- `project_id uuid fk projects`
- `kind enum('creativity','work')`
- `name text`
- `document jsonb`
- `created_at`, `updated_at`
- unique constraint: `(project_id, kind)`

`document` stores the complete canvas JSON:

```json
{
  "nodes": [
    {
      "id": "content-123",
      "type": "content",
      "position": { "x": 120, "y": 80 },
      "data": {
        "status": "idle",
        "metadata": {
          "title": "My Block",
          "createdAt": "2026-03-01T00:00:00.000Z",
          "lastModifiedAt": "2026-03-01T00:00:00.000Z",
          "createdBy": "user",
          "version": 1,
          "tags": []
        },
        "content": { "document": "", "format": "markdown" },
        "agentContext": null,
        "permissions": { "ownerId": "", "sharedWith": [], "readOnly": false }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "content-123",
      "target": "image-456",
      "label": "next"
    }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

## API endpoints

### Auth
- `POST /api/auth/signup` `{ username, password }`
- `POST /api/auth/login` `{ username, password }`
- `POST /api/auth/refresh` (uses refresh cookie)
- `POST /api/auth/logout`
- `GET /api/auth/me` (Bearer access token)

### Projects
- `GET /api/projects`
- `POST /api/projects` `{ name }`
- `DELETE /api/projects/:projectId`

### Canvases
- `GET /api/projects/:projectId/canvases`
- `GET /api/projects/:projectId/canvases/:kind`
- `PUT /api/projects/:projectId/canvases/:kind` `{ document }`

## Run locally

1. Install deps:
```bash
npm install
```

2. Create env file:
```bash
cp .env.example .env
```

3. Create PostgreSQL DB (example):
```sql
CREATE DATABASE imagination_canvas;
```

4. Start backend (runs SQL migrations automatically):
```bash
npm run server
```

5. In another terminal, start frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`, API at `http://localhost:3001`.

## Notes
- This baseline uses HTTP-only refresh cookie + short-lived access token.
- For production, add HTTPS, stricter cookie policy, rate limiting, CSRF strategy, and account recovery flows.
- Existing `/api/analyze` (Ollama) route remains available.
