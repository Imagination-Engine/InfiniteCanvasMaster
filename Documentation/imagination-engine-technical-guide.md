# Imagination Engine: Technical Implementation Guide

**Supplemental Engineering Playbook for Phase 1**
**Date: March 2, 2026**

---

## Table of Contents

1. Repository Structure & Monorepo Setup
2. Git Workflow, Branch Strategy & PR Protocol
3. Environment Setup & Toolchain
4. Database Schema, Migrations & Seeding
5. Backend API Architecture
6. The Block System: Registry, Validation & Execution
7. The Edge System: Connection Contracts & Data Flow
8. Canvas Spec: Serialization, Storage & Round-Trip Integrity
9. LLM Service Layer: Hybrid Routing & Federated Security
10. Frontend Architecture: React Flow, Chat Panel & Block Renderers
11. Chat-Canvas Synchronization
12. Authentication & Session Management
13. Testing Strategy, Evals & CI/CD
14. Daily Coordination Protocol
15. Appendix: Full Type Definitions

---

## 1. Repository Structure & Monorepo Setup

Use a single monorepo. This eliminates cross-repo versioning headaches and makes atomic commits across backend + frontend possible. Use workspaces (npm/pnpm) to manage packages.

```
imagination-engine/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # lint, typecheck, test on every PR
│   │   └── integration.yml           # full build + e2e on merge to main
│   └── PULL_REQUEST_TEMPLATE.md
├── packages/
│   ├── shared/                       # shared types, schemas, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── block.ts          # Block interface & base types
│   │   │   │   ├── edge.ts           # Edge interface & types
│   │   │   │   ├── canvas.ts         # Canvas document spec
│   │   │   │   ├── user.ts           # User & auth types
│   │   │   │   ├── chat.ts           # Conversation & message types
│   │   │   │   └── index.ts          # barrel export
│   │   │   ├── schemas/
│   │   │   │   ├── block.schema.json # JSON Schema for block validation
│   │   │   │   ├── edge.schema.json  # JSON Schema for edge validation
│   │   │   │   └── canvas.schema.json
│   │   │   ├── validators/
│   │   │   │   ├── block-validator.ts
│   │   │   │   ├── edge-validator.ts
│   │   │   │   ├── canvas-validator.ts
│   │   │   │   └── connection-validator.ts  # validates edge type compatibility
│   │   │   ├── constants/
│   │   │   │   ├── block-categories.ts
│   │   │   │   ├── data-types.ts     # canonical data type registry
│   │   │   │   └── execution-modes.ts
│   │   │   └── utils/
│   │   │       ├── id-generator.ts   # uuid v4 generation
│   │   │       └── schema-utils.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── server/                       # backend API
│   │   ├── src/
│   │   │   ├── index.ts              # entry point
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── llm.ts            # model routing config
│   │   │   │   └── env.ts
│   │   │   ├── db/
│   │   │   │   ├── migrations/       # numbered SQL migrations
│   │   │   │   ├── seeds/            # seed data (block registry, test users)
│   │   │   │   └── connection.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── project.routes.ts
│   │   │   │   ├── canvas.routes.ts
│   │   │   │   ├── chat.routes.ts
│   │   │   │   └── blocks.routes.ts  # block registry CRUD
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── project.controller.ts
│   │   │   │   ├── canvas.controller.ts
│   │   │   │   ├── chat.controller.ts
│   │   │   │   └── blocks.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── llm/
│   │   │   │   │   ├── llm-service.ts        # abstract interface
│   │   │   │   │   ├── ollama-provider.ts     # local model provider
│   │   │   │   │   ├── gemini-provider.ts     # external model provider
│   │   │   │   │   ├── router.ts             # hybrid routing logic
│   │   │   │   │   └── security.ts           # context minimization, audit
│   │   │   │   ├── canvas-service.ts
│   │   │   │   ├── block-registry.ts
│   │   │   │   ├── validation-pipeline.ts     # 5-step LLM output validation
│   │   │   │   └── chat-service.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   └── request-logger.ts
│   │   │   └── websocket/
│   │   │       └── canvas-sync.ts    # real-time canvas updates
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── client/                       # frontend React app
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── api/
│       │   │   ├── client.ts         # axios/fetch wrapper
│       │   │   ├── auth.api.ts
│       │   │   ├── canvas.api.ts
│       │   │   ├── chat.api.ts
│       │   │   └── project.api.ts
│       │   ├── components/
│       │   │   ├── canvas/
│       │   │   │   ├── CanvasView.tsx         # React Flow wrapper
│       │   │   │   ├── CanvasToolbar.tsx
│       │   │   │   └── MiniMap.tsx
│       │   │   ├── blocks/
│       │   │   │   ├── BlockRenderer.tsx      # dynamic block type router
│       │   │   │   ├── BlockWrapper.tsx       # shared chrome (drag, resize, ports)
│       │   │   │   ├── registry/
│       │   │   │   │   ├── TextBlock.tsx
│       │   │   │   │   ├── FileUploadBlock.tsx
│       │   │   │   │   ├── LLMAgentBlock.tsx
│       │   │   │   │   ├── ImageGenBlock.tsx
│       │   │   │   │   ├── CodeSandboxBlock.tsx
│       │   │   │   │   ├── ChatBlock.tsx
│       │   │   │   │   ├── APIIntegrationBlock.tsx
│       │   │   │   │   └── index.ts          # block component registry
│       │   │   │   └── shared/
│       │   │   │       ├── InputPort.tsx
│       │   │   │       ├── OutputPort.tsx
│       │   │   │       └── BlockStatusBadge.tsx
│       │   │   ├── chat/
│       │   │   │   ├── ChatPanel.tsx
│       │   │   │   ├── MessageBubble.tsx
│       │   │   │   ├── ChatInput.tsx
│       │   │   │   └── CanvasPreview.tsx      # inline canvas diff in chat
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   ├── RegisterForm.tsx
│       │   │   │   └── AuthGuard.tsx
│       │   │   ├── projects/
│       │   │   │   ├── ProjectList.tsx
│       │   │   │   └── ProjectCard.tsx
│       │   │   └── landing/
│       │   │       └── LandingPage.tsx
│       │   ├── hooks/
│       │   │   ├── useCanvas.ts       # canvas state management
│       │   │   ├── useChat.ts         # chat state & streaming
│       │   │   ├── useAuth.ts
│       │   │   └── useBlockRegistry.ts
│       │   ├── stores/
│       │   │   ├── canvas-store.ts    # zustand or context
│       │   │   ├── chat-store.ts
│       │   │   └── auth-store.ts
│       │   ├── utils/
│       │   │   ├── canvas-serializer.ts
│       │   │   └── block-factory.ts   # creates block instances from registry
│       │   └── styles/
│       │       └── globals.css
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml                # postgres + ollama + app
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json                      # root workspace config
└── README.md
```

### Workspace Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
```

**Root package.json:**
```json
{
  "name": "imagination-engine",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter server dev\" \"pnpm --filter client dev\"",
    "build": "pnpm --filter shared build && pnpm --filter server build && pnpm --filter client build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "db:migrate": "pnpm --filter server db:migrate",
    "db:seed": "pnpm --filter server db:seed",
    "validate:schemas": "pnpm --filter shared validate"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### Why This Structure

The `packages/shared` directory is the contract layer. Every type, schema, and validator lives here. Both server and client import from it. When a student adds a new block type, they add the type definition in shared, the backend handler in server, and the React component in client. The shared package ensures both sides agree on the shape of data at compile time.

---

## 2. Git Workflow, Branch Strategy & PR Protocol

### Branch Model

```
main                          # always deployable, always builds
  └── develop                 # integration branch, PRs merge here first
        ├── foundation/db-schema          # initial migrations
        ├── foundation/api-skeleton       # route/controller scaffolding
        ├── foundation/react-flow-setup   # canvas component shell
        ├── foundation/llm-service        # hybrid routing layer
        ├── feature/block-text            # individual block implementations
        ├── feature/block-llm-agent
        ├── feature/block-image-gen
        ├── feature/block-file-upload
        ├── feature/chat-panel
        ├── feature/auth-flow
        ├── feature/canvas-export-import
        ├── fix/edge-validation-null-check
        └── ...
```

### The Foundation Phase (Days 1-2)

These branches are created and merged sequentially by the team lead (or pair-programmed). They establish the skeleton that everyone builds on:

1. `foundation/db-schema` - database tables, migrations, connection pool
2. `foundation/shared-types` - all TypeScript types and JSON schemas in packages/shared
3. `foundation/api-skeleton` - Express/Fastify routes, controllers (empty bodies with correct types), middleware
4. `foundation/react-flow-setup` - Vite + React + React Flow + Tailwind, rendering a hardcoded test canvas
5. `foundation/llm-service` - the LLMService interface, Ollama provider, Gemini provider, router skeleton
6. `foundation/auth` - registration, login, JWT middleware

Each of these merges to `develop`, then `develop` merges to `main` once all six are in and the build passes. At this point, every student has a working local dev environment with the full skeleton running.

### Feature Branch Protocol

After foundation is merged, parallel development begins.

**Branch naming:** `feature/block-[type-name]`, `feature/[area]-[description]`, `fix/[description]`

**Before creating a branch:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/block-text
```

**Before pushing / creating a PR:**
```bash
# Rebase onto latest develop to catch conflicts early
git fetch origin
git rebase origin/develop

# Run the full validation suite locally
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter shared validate  # JSON schema validation

# If rebase had conflicts, resolve them, then:
git rebase --continue
git push origin feature/block-text --force-with-lease
```

The `--force-with-lease` is critical. It prevents you from accidentally overwriting someone else's pushed changes while still allowing the rebased push.

### PR Template

Every PR must use this template. Create it at `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What This Does
<!-- One to three sentences. What does this PR add or change? -->

## Block Types Affected
<!-- List any block types this touches, or "None" -->

## Schema Changes
<!-- Does this modify any types in packages/shared? If yes, describe. -->
<!-- CRITICAL: Schema changes require team-wide review before merge. -->

## How to Test
<!-- Step by step instructions to verify this works -->
1.
2.
3.

## Checklist
- [ ] Rebased on latest `develop`
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm --filter shared validate` passes
- [ ] No console.log statements left in code
- [ ] New block types registered in both server and client registries

## Screenshots / Demo
<!-- If UI changes, include screenshots or a short recording -->
```

### Merge Rules

**To `develop`:**
- Requires 1 approval from another team member
- All CI checks must pass
- No direct pushes. Ever.

**To `main`:**
- Only the integration lead merges develop into main
- Requires full build + e2e eval pass
- Done at end of each day or before major milestones

**Schema change protocol (CRITICAL):**
Any PR that modifies files in `packages/shared/src/types/` or `packages/shared/src/schemas/` requires:
1. A Slack/Discord message to the team channel: "Schema change incoming: [description]"
2. ALL team members must review and approve
3. The person merging must verify no other in-flight PRs will break

This is the single most important coordination rule. A schema change that merges while three other people have branches based on the old schema creates merge hell. Communicate first, merge second.

### Conflict Resolution Playbook

**When you hit a merge conflict on rebase:**

1. `git status` to see which files conflict
2. If the conflict is in `packages/shared/` (types or schemas), STOP. Do not resolve alone. Pull in the other author.
3. If the conflict is in a block component you own, resolve it yourself (your code, your block).
4. If the conflict is in server routes or controllers, check if the other PR added a new route. If so, both changes likely coexist. Accept both.
5. After resolving: `pnpm typecheck` immediately. Type errors after conflict resolution are the #1 source of bugs.

**When two students modify the same file:**
This will happen most often in:
- `packages/client/src/components/blocks/registry/index.ts` (the block component registry)
- `packages/server/src/services/block-registry.ts` (the server-side registry)
- `packages/shared/src/types/block.ts` (if adding new type unions)

Design these files to be append-only where possible. The block registry files should be structured so each student adds a line, and additions never conflict:

```typescript
// packages/client/src/components/blocks/registry/index.ts
// Each student adds their import and registry entry.
// Alphabetical order by type name to minimize conflicts.

import { ChatBlock } from './ChatBlock';
import { CodeSandboxBlock } from './CodeSandboxBlock';
import { FileUploadBlock } from './FileUploadBlock';
import { ImageGenBlock } from './ImageGenBlock';
import { LLMAgentBlock } from './LLMAgentBlock';
import { TextBlock } from './TextBlock';

export const BLOCK_COMPONENT_REGISTRY: Record<string, React.ComponentType<BlockProps>> = {
  'chat': ChatBlock,
  'code-sandbox': CodeSandboxBlock,
  'file-upload': FileUploadBlock,
  'image-gen': ImageGenBlock,
  'llm-agent': LLMAgentBlock,
  'text': TextBlock,
};
```

Alphabetical ordering means two students adding different blocks will almost never touch the same line.

---

## 3. Environment Setup & Toolchain

### Prerequisites

Every team member needs:
- Node.js 20+ (LTS)
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 16+ (local or Docker)
- Ollama installed with at least one model pulled
- Docker & Docker Compose (recommended for consistent environments)
- Git configured with their GitHub account

### Docker Compose (Recommended Dev Setup)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: imagination_engine
      POSTGRES_USER: ie_dev
      POSTGRES_PASSWORD: ie_dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # After first run: docker exec -it <container> ollama pull mistral

volumes:
  pgdata:
  ollama_data:
```

### Environment Variables

```bash
# .env.example (copy to .env, never commit .env)

# Database
DATABASE_URL=postgresql://ie_dev:ie_dev_password@localhost:5432/imagination_engine

# LLM - Local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=mistral

# LLM - External
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-3.1-pro

# Auth
JWT_SECRET=generate-a-random-64-char-string-here
JWT_EXPIRY=24h

# Server
PORT=3001
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### First Run Script

Create a setup script so any team member can go from clone to running in under 5 minutes:

```bash
#!/bin/bash
# scripts/setup.sh

set -e

echo "=== Imagination Engine Setup ==="

# 1. Install dependencies
echo "Installing dependencies..."
pnpm install

# 2. Start infrastructure
echo "Starting PostgreSQL and Ollama..."
docker-compose up -d

# 3. Wait for postgres
echo "Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready; do
  sleep 1
done

# 4. Run migrations
echo "Running database migrations..."
pnpm db:migrate

# 5. Seed data
echo "Seeding block registry and test data..."
pnpm db:seed

# 6. Pull Ollama model (if not already present)
echo "Ensuring Ollama model is available..."
docker-compose exec ollama ollama pull mistral 2>/dev/null || true

# 7. Build shared types
echo "Building shared package..."
pnpm --filter shared build

echo ""
echo "=== Setup Complete ==="
echo "Run 'pnpm dev' to start the development servers"
```

---

## 4. Database Schema, Migrations & Seeding

Use a migration tool. Knex.js (if Node backend) or a raw SQL migration runner. Each migration is a numbered SQL file that runs in order. Never edit a migration after it's been merged. Always create a new one.

### Migration 001: Core Tables

```sql
-- packages/server/src/db/migrations/001_core_tables.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Canvases
CREATE TABLE canvases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    canvas_type VARCHAR(20) NOT NULL CHECK (canvas_type IN ('creativity', 'work', 'hybrid')),
    document JSONB NOT NULL DEFAULT '{
        "canvas": {},
        "blocks": [],
        "edges": [],
        "viewport": {"x": 0, "y": 0, "zoom": 1}
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_canvases_project_id ON canvases(project_id);
-- GIN index for fast JSONB queries into the canvas document
CREATE INDEX idx_canvases_document ON canvases USING GIN (document);

-- Conversations (one per canvas)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_canvas_id ON conversations(canvas_id);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    -- Snapshot of canvas state at time of this message (for replay/undo)
    canvas_snapshot JSONB,
    -- Metadata: which blocks were created/modified by this message
    affected_blocks UUID[] DEFAULT '{}',
    token_count INTEGER,
    model_used VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Block Type Registry (source of truth for available block types)
CREATE TABLE block_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    -- The full capabilities schema for this block type
    capabilities JSONB NOT NULL,
    -- Default configuration when a new instance is created
    default_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Default dimensions
    default_width INTEGER DEFAULT 300,
    default_height INTEGER DEFAULT 200,
    -- Routing preference
    llm_routing VARCHAR(20) DEFAULT 'none' CHECK (llm_routing IN ('local', 'external', 'prefer_local', 'none')),
    version VARCHAR(20) NOT NULL DEFAULT '0.1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_block_registry_type_name ON block_registry(type_name);
CREATE INDEX idx_block_registry_category ON block_registry(category);

-- Canvas Snapshots (for undo/redo and version history)
CREATE TABLE canvas_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    document JSONB NOT NULL,
    triggered_by UUID REFERENCES messages(id),
    snapshot_type VARCHAR(20) DEFAULT 'auto' CHECK (snapshot_type IN ('auto', 'manual', 'llm_generation')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_canvas_snapshots_canvas_id ON canvas_snapshots(canvas_id);

-- Audit log for external LLM calls (federated security)
CREATE TABLE llm_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    canvas_id UUID REFERENCES canvases(id),
    block_id UUID,  -- the block that triggered this call (null if chat-level)
    provider VARCHAR(50) NOT NULL,  -- 'ollama', 'gemini', etc.
    model VARCHAR(100) NOT NULL,
    routing_type VARCHAR(20) NOT NULL,  -- 'local', 'external'
    context_scope VARCHAR(20) NOT NULL, -- 'minimal', 'block_only', 'full_canvas'
    prompt_token_count INTEGER,
    completion_token_count INTEGER,
    latency_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_llm_audit_user_id ON llm_audit_log(user_id);
CREATE INDEX idx_llm_audit_created_at ON llm_audit_log(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_canvases_updated_at BEFORE UPDATE ON canvases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_block_registry_updated_at BEFORE UPDATE ON block_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Migration 002: Indexes for Phase 2 Readiness

```sql
-- packages/server/src/db/migrations/002_phase2_prep.sql

-- Prepare for vector search (Phase 2: when you add pgvector)
-- For now, just add a column to messages for future embedding storage
ALTER TABLE messages ADD COLUMN embedding_vector BYTEA;

-- Prepare for composable canvases (a canvas can be a block in another canvas)
ALTER TABLE canvases ADD COLUMN parent_canvas_id UUID REFERENCES canvases(id);
ALTER TABLE canvases ADD COLUMN is_composable BOOLEAN DEFAULT FALSE;

-- User preferences / memory (Phase 2: full memory system)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Seed Data: Block Registry

```sql
-- packages/server/src/db/seeds/001_block_registry.sql

INSERT INTO block_registry (type_name, display_name, category, description, capabilities, default_config, llm_routing) VALUES

-- === CONTAINER / PASSIVE BLOCKS ===

('text', 'Text Block', 'container', 'Rich text content block with markdown support', '{
    "inputs": [
        {"name": "content", "type": "text/markdown", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "content", "type": "text/markdown", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "placeholder": {"type": "string", "default": "Start typing..."},
            "max_length": {"type": "integer", "default": 10000}
        }
    },
    "supported_triggers": ["manual", "upstream"],
    "execution_mode": "sync"
}', '{"placeholder": "Start typing...", "max_length": 10000}', 'none'),

('file-upload', 'File Upload', 'container', 'Upload and store files (images, documents, audio, video)', '{
    "inputs": [
        {"name": "file", "type": "file/*", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "file_url", "type": "text/uri", "schema": null},
        {"name": "file_metadata", "type": "application/json", "schema": null},
        {"name": "file_content", "type": "text/plain", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "accepted_types": {"type": "array", "items": {"type": "string"}, "default": ["*/*"]},
            "max_size_mb": {"type": "integer", "default": 50}
        }
    },
    "supported_triggers": ["manual"],
    "execution_mode": "sync"
}', '{"accepted_types": ["*/*"], "max_size_mb": 50}', 'none'),

('document', 'Document Container', 'container', 'Embedded document viewer and editor (PDF, DOCX, MD)', '{
    "inputs": [
        {"name": "document", "type": "file/document", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "text_content", "type": "text/plain", "schema": null},
        {"name": "document_metadata", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "editable": {"type": "boolean", "default": true},
            "format": {"type": "string", "enum": ["markdown", "pdf", "docx"], "default": "markdown"}
        }
    },
    "supported_triggers": ["manual", "upstream"],
    "execution_mode": "sync"
}', '{"editable": true, "format": "markdown"}', 'none'),

-- === GENERATIVE / AGENT BLOCKS ===

('llm-agent', 'LLM Agent', 'agent', 'Configurable language model agent for text generation, analysis, and reasoning', '{
    "inputs": [
        {"name": "prompt", "type": "text/plain", "required": true, "schema": null},
        {"name": "context", "type": "text/plain", "required": false, "schema": null},
        {"name": "system_prompt", "type": "text/plain", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "response", "type": "text/plain", "schema": null},
        {"name": "structured_output", "type": "application/json", "schema": null},
        {"name": "token_usage", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "model": {"type": "string", "default": "auto"},
            "temperature": {"type": "number", "minimum": 0, "maximum": 2, "default": 0.7},
            "max_tokens": {"type": "integer", "default": 2048},
            "output_format": {"type": "string", "enum": ["text", "json", "markdown"], "default": "text"},
            "system_prompt": {"type": "string", "default": "You are a helpful assistant."}
        }
    },
    "supported_triggers": ["manual", "upstream", "event"],
    "execution_mode": "streaming"
}', '{"model": "auto", "temperature": 0.7, "max_tokens": 2048, "output_format": "text"}', 'prefer_local'),

('image-gen', 'Image Generator', 'agent', 'Generate images from text descriptions', '{
    "inputs": [
        {"name": "prompt", "type": "text/plain", "required": true, "schema": null},
        {"name": "reference_image", "type": "image/*", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "image", "type": "image/png", "schema": null},
        {"name": "generation_metadata", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "width": {"type": "integer", "default": 1024},
            "height": {"type": "integer", "default": 1024},
            "style": {"type": "string", "default": "natural"},
            "num_variations": {"type": "integer", "minimum": 1, "maximum": 4, "default": 1}
        }
    },
    "supported_triggers": ["manual", "upstream"],
    "execution_mode": "async"
}', '{"width": 1024, "height": 1024, "style": "natural", "num_variations": 1}', 'external'),

('summarizer', 'Summarizer', 'agent', 'Summarize text, documents, or conversation threads', '{
    "inputs": [
        {"name": "content", "type": "text/*", "required": true, "schema": null}
    ],
    "outputs": [
        {"name": "summary", "type": "text/plain", "schema": null},
        {"name": "key_points", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "max_length": {"type": "integer", "default": 500},
            "style": {"type": "string", "enum": ["bullet_points", "paragraph", "executive"], "default": "paragraph"},
            "preserve_quotes": {"type": "boolean", "default": false}
        }
    },
    "supported_triggers": ["manual", "upstream"],
    "execution_mode": "async"
}', '{"max_length": 500, "style": "paragraph"}', 'local'),

('code-sandbox', 'Code Sandbox', 'agent', 'Write, execute, and iterate on code', '{
    "inputs": [
        {"name": "code", "type": "text/code", "required": false, "schema": null},
        {"name": "instruction", "type": "text/plain", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "code", "type": "text/code", "schema": null},
        {"name": "execution_result", "type": "text/plain", "schema": null},
        {"name": "errors", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "language": {"type": "string", "enum": ["python", "javascript", "typescript", "rust"], "default": "python"},
            "auto_execute": {"type": "boolean", "default": false},
            "ai_assist": {"type": "boolean", "default": true}
        }
    },
    "supported_triggers": ["manual", "upstream"],
    "execution_mode": "async"
}', '{"language": "python", "auto_execute": false, "ai_assist": true}', 'prefer_local'),

-- === CHAT / INTERACTIVE BLOCKS ===

('chat', 'Chat Interface', 'interactive', 'Persistent conversational interface with an LLM', '{
    "inputs": [
        {"name": "context", "type": "text/plain", "required": false, "schema": null},
        {"name": "system_prompt", "type": "text/plain", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "last_response", "type": "text/plain", "schema": null},
        {"name": "conversation_history", "type": "application/json", "schema": null},
        {"name": "extracted_data", "type": "application/json", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "model": {"type": "string", "default": "auto"},
            "system_prompt": {"type": "string", "default": "You are a helpful assistant."},
            "memory_enabled": {"type": "boolean", "default": true},
            "max_history": {"type": "integer", "default": 50}
        }
    },
    "supported_triggers": ["manual", "event"],
    "execution_mode": "streaming"
}', '{"model": "auto", "memory_enabled": true, "max_history": 50}', 'prefer_local'),

-- === INTEGRATION BLOCKS (Work Canvas) ===

('api-integration', 'API Integration', 'integration', 'Generic REST API connector', '{
    "inputs": [
        {"name": "request_body", "type": "application/json", "required": false, "schema": null},
        {"name": "trigger_data", "type": "application/json", "required": false, "schema": null}
    ],
    "outputs": [
        {"name": "response", "type": "application/json", "schema": null},
        {"name": "status_code", "type": "text/plain", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "url": {"type": "string"},
            "method": {"type": "string", "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"], "default": "GET"},
            "headers": {"type": "object", "default": {}},
            "auth_type": {"type": "string", "enum": ["none", "bearer", "api_key", "oauth2"], "default": "none"}
        }
    },
    "supported_triggers": ["manual", "upstream", "event", "schedule"],
    "execution_mode": "async"
}', '{"method": "GET", "headers": {}, "auth_type": "none"}', 'none'),

-- === TRANSFORM BLOCKS ===

('transformer', 'Data Transformer', 'transform', 'Transform data between formats using configurable rules or AI', '{
    "inputs": [
        {"name": "input_data", "type": "*/*", "required": true, "schema": null}
    ],
    "outputs": [
        {"name": "output_data", "type": "*/*", "schema": null}
    ],
    "config_schema": {
        "type": "object",
        "properties": {
            "transform_type": {"type": "string", "enum": ["ai", "template", "code"], "default": "ai"},
            "output_type": {"type": "string", "default": "text/plain"},
            "transform_instruction": {"type": "string", "default": ""}
        }
    },
    "supported_triggers": ["upstream"],
    "execution_mode": "async"
}', '{"transform_type": "ai", "output_type": "text/plain"}', 'prefer_local')

ON CONFLICT (type_name) DO UPDATE SET
    capabilities = EXCLUDED.capabilities,
    default_config = EXCLUDED.default_config,
    updated_at = NOW();
```

### Adding New Block Types (Student Workflow)

When a student wants to add a new block type:

1. Add the seed SQL entry to a new seed file: `002_block_[name].sql`
2. Add the TypeScript type extension in `packages/shared/src/types/block.ts`
3. Add the server-side handler (if the block has execution logic) in `packages/server/src/services/blocks/`
4. Add the React component in `packages/client/src/components/blocks/registry/`
5. Register in both client and server registries
6. All in one PR, one feature branch

---

## 5. Backend API Architecture

Use Express with TypeScript. Keep it simple, consistent, and strongly typed.

### Route Structure

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/projects/:projectId/canvases
POST   /api/projects/:projectId/canvases
GET    /api/canvases/:id
PUT    /api/canvases/:id                    # full document update
PATCH  /api/canvases/:id/blocks             # add/update/remove individual blocks
PATCH  /api/canvases/:id/edges              # add/update/remove individual edges
POST   /api/canvases/:id/export             # export as JSON file
POST   /api/canvases/:id/import             # import from JSON file
POST   /api/canvases/:id/snapshot           # create manual snapshot

GET    /api/canvases/:canvasId/conversation
POST   /api/canvases/:canvasId/conversation/messages    # send message, get AI response
GET    /api/canvases/:canvasId/conversation/messages     # message history

GET    /api/blocks/registry                 # list all available block types
GET    /api/blocks/registry/:typeName       # get specific block type details
POST   /api/blocks/validate                 # validate a block JSON against schema

POST   /api/llm/generate                    # direct LLM call (for testing/admin)
```

### Controller Pattern

Every controller follows the same structure. This makes code review fast because reviewers know exactly where to look:

```typescript
// packages/server/src/controllers/canvas.controller.ts

import { Request, Response, NextFunction } from 'express';
import { CanvasService } from '../services/canvas-service';
import { CanvasValidator } from '@imagination-engine/shared/validators';
import { Canvas, CanvasDocument } from '@imagination-engine/shared/types';

export class CanvasController {
    constructor(private canvasService: CanvasService) {}

    getCanvas = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const canvas = await this.canvasService.getById(req.params.id, req.user.id);
            if (!canvas) return res.status(404).json({ error: 'Canvas not found' });
            res.json(canvas);
        } catch (err) {
            next(err);
        }
    };

    updateCanvas = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const document: CanvasDocument = req.body.document;

            // Validate the entire canvas document before saving
            const validation = CanvasValidator.validate(document);
            if (!validation.valid) {
                return res.status(400).json({
                    error: 'Invalid canvas document',
                    details: validation.errors
                });
            }

            const updated = await this.canvasService.update(
                req.params.id,
                req.user.id,
                document
            );
            res.json(updated);
        } catch (err) {
            next(err);
        }
    };

    addBlock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { block } = req.body;

            // Validate block against schema and registry
            const validation = await this.canvasService.validateBlock(block);
            if (!validation.valid) {
                return res.status(400).json({
                    error: 'Invalid block',
                    details: validation.errors
                });
            }

            const updated = await this.canvasService.addBlock(
                req.params.id,
                req.user.id,
                block
            );
            res.json(updated);
        } catch (err) {
            next(err);
        }
    };

    exportCanvas = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const canvas = await this.canvasService.getById(req.params.id, req.user.id);
            if (!canvas) return res.status(404).json({ error: 'Canvas not found' });

            res.setHeader('Content-Type', 'application/json');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${canvas.name}.canvas.json"`
            );
            res.json(canvas.document);
        } catch (err) {
            next(err);
        }
    };

    importCanvas = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const document: CanvasDocument = req.body;

            // Full validation pipeline on imported document
            const validation = CanvasValidator.validateComplete(document);
            if (!validation.valid) {
                return res.status(400).json({
                    error: 'Invalid canvas file',
                    details: validation.errors
                });
            }

            const canvas = await this.canvasService.importDocument(
                req.params.id,
                req.user.id,
                document
            );
            res.json(canvas);
        } catch (err) {
            next(err);
        }
    };
}
```

---

## 6. The Block System: Registry, Validation & Execution

### Block Validator (packages/shared)

This runs on both client and server. It's the single source of truth for "is this block valid?"

```typescript
// packages/shared/src/validators/block-validator.ts

import Ajv from 'ajv';
import blockSchema from '../schemas/block.schema.json';
import { Block, BlockRegistryEntry } from '../types/block';

const ajv = new Ajv({ allErrors: true });
const validateBlockJSON = ajv.compile(blockSchema);

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    path: string;
    message: string;
    severity: 'error' | 'warning';
}

export class BlockValidator {
    /**
     * Step 1: JSON Schema validation (structure)
     */
    static validateStructure(block: unknown): ValidationResult {
        const valid = validateBlockJSON(block);
        if (valid) return { valid: true, errors: [] };

        return {
            valid: false,
            errors: (validateBlockJSON.errors || []).map(err => ({
                path: err.instancePath || '/',
                message: err.message || 'Unknown validation error',
                severity: 'error' as const
            }))
        };
    }

    /**
     * Step 2: Registry validation (does this block type exist?)
     */
    static validateAgainstRegistry(
        block: Block,
        registry: Map<string, BlockRegistryEntry>
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const entry = registry.get(block.type);

        if (!entry) {
            errors.push({
                path: '/type',
                message: `Unknown block type: "${block.type}". Available types: ${Array.from(registry.keys()).join(', ')}`,
                severity: 'error'
            });
            return { valid: false, errors };
        }

        if (!entry.is_active) {
            errors.push({
                path: '/type',
                message: `Block type "${block.type}" is registered but not currently active`,
                severity: 'error'
            });
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Step 3: Capability validation (do inputs/outputs match the registry definition?)
     */
    static validateCapabilities(
        block: Block,
        registryEntry: BlockRegistryEntry
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const regCaps = registryEntry.capabilities;

        // Check that required inputs are satisfiable
        for (const input of regCaps.inputs) {
            if (input.required && !block.state?.data?.[input.name]) {
                errors.push({
                    path: `/capabilities/inputs/${input.name}`,
                    message: `Required input "${input.name}" is not provided`,
                    severity: 'warning' // warning because it might be connected via edge
                });
            }
        }

        return { valid: !errors.some(e => e.severity === 'error'), errors };
    }

    /**
     * Full validation pipeline
     */
    static validate(
        block: unknown,
        registry: Map<string, BlockRegistryEntry>
    ): ValidationResult {
        // Step 1: Structure
        const structureResult = this.validateStructure(block);
        if (!structureResult.valid) return structureResult;

        const typedBlock = block as Block;

        // Step 2: Registry
        const registryResult = this.validateAgainstRegistry(typedBlock, registry);
        if (!registryResult.valid) return registryResult;

        // Step 3: Capabilities
        const entry = registry.get(typedBlock.type)!;
        const capResult = this.validateCapabilities(typedBlock, entry);

        return {
            valid: capResult.valid,
            errors: [...registryResult.errors, ...capResult.errors]
        };
    }
}
```

### Connection Validator

This validates that edges connect compatible types:

```typescript
// packages/shared/src/validators/connection-validator.ts

import { Edge, Block, BlockRegistryEntry } from '../types';

export class ConnectionValidator {
    /**
     * Check if an edge connects compatible output -> input types.
     * Type compatibility rules:
     *   - Exact match: "text/plain" -> "text/plain"
     *   - Wildcard match: "text/plain" -> "text/*"
     *   - Universal accept: anything -> "*/*"
     *   - Subtype match: "image/png" -> "image/*"
     */
    static validateConnection(
        edge: Edge,
        sourceBlock: Block,
        targetBlock: Block,
        registry: Map<string, BlockRegistryEntry>
    ): ValidationResult {
        const errors: ValidationError[] = [];

        const sourceEntry = registry.get(sourceBlock.type);
        const targetEntry = registry.get(targetBlock.type);

        if (!sourceEntry || !targetEntry) {
            errors.push({
                path: '/edge',
                message: 'Source or target block type not found in registry',
                severity: 'error'
            });
            return { valid: false, errors };
        }

        // Find the output on the source block
        const sourceOutput = sourceEntry.capabilities.outputs
            .find(o => o.name === edge.source.output_name);

        if (!sourceOutput) {
            errors.push({
                path: '/source/output_name',
                message: `Output "${edge.source.output_name}" not found on block type "${sourceBlock.type}"`,
                severity: 'error'
            });
            return { valid: false, errors };
        }

        // Find the input on the target block
        const targetInput = targetEntry.capabilities.inputs
            .find(i => i.name === edge.target.input_name);

        if (!targetInput) {
            errors.push({
                path: '/target/input_name',
                message: `Input "${edge.target.input_name}" not found on block type "${targetBlock.type}"`,
                severity: 'error'
            });
            return { valid: false, errors };
        }

        // Type compatibility check
        if (!this.typesCompatible(sourceOutput.type, targetInput.type)) {
            errors.push({
                path: '/type_mismatch',
                message: `Type mismatch: output "${sourceOutput.name}" produces "${sourceOutput.type}" but input "${targetInput.name}" expects "${targetInput.type}"`,
                severity: 'error'
            });
        }

        return { valid: errors.length === 0, errors };
    }

    private static typesCompatible(outputType: string, inputType: string): boolean {
        if (inputType === '*/*') return true;
        if (outputType === inputType) return true;

        const [outCategory] = outputType.split('/');
        const [inCategory, inSubtype] = inputType.split('/');

        if (outCategory === inCategory && inSubtype === '*') return true;

        return false;
    }
}
```

### Block Factory

Creates new block instances from the registry with proper defaults:

```typescript
// packages/shared/src/utils/block-factory.ts

import { v4 as uuidv4 } from 'uuid';
import { Block, BlockRegistryEntry } from '../types';

export class BlockFactory {
    static create(
        registryEntry: BlockRegistryEntry,
        overrides?: Partial<Block>
    ): Block {
        const now = new Date().toISOString();

        return {
            id: uuidv4(),
            type: registryEntry.type_name,
            version: registryEntry.version,
            meta: {
                name: overrides?.meta?.name || registryEntry.display_name,
                description: overrides?.meta?.description || registryEntry.description || '',
                icon: null,
                tags: [],
                created_at: now,
                updated_at: now,
                author: 'user'
            },
            capabilities: registryEntry.capabilities,
            state: {
                status: 'idle',
                data: {},
                last_run: null
            },
            position: {
                x: overrides?.position?.x ?? 0,
                y: overrides?.position?.y ?? 0,
                width: registryEntry.default_width || 300,
                height: registryEntry.default_height || 200,
                z_index: 0
            },
            extensions: {
                config: { ...registryEntry.default_config, ...overrides?.extensions?.config }
            },
            ...overrides
        };
    }
}
```

---

## 7. LLM Service Layer: Hybrid Routing & Federated Security

This is the core abstraction. Every LLM call in the system goes through this layer.

```typescript
// packages/server/src/services/llm/llm-service.ts

export interface LLMConfig {
    model?: string;               // specific model or "auto"
    routing: 'local' | 'external' | 'prefer_local';
    temperature?: number;
    max_tokens?: number;
    output_format: 'json' | 'text' | 'streaming';
    context_scope: 'minimal' | 'block_only' | 'full_canvas';
    response_schema?: object;     // JSON Schema the output must conform to
}

export interface LLMRequest {
    prompt: string;
    system_prompt?: string;
    config: LLMConfig;
    // Metadata for audit logging
    user_id: string;
    canvas_id?: string;
    block_id?: string;
}

export interface LLMResponse {
    content: string;
    model_used: string;
    provider: string;
    token_usage: {
        prompt_tokens: number;
        completion_tokens: number;
    };
    latency_ms: number;
}

export interface LLMProvider {
    name: string;
    generate(prompt: string, system_prompt: string, config: LLMConfig): Promise<LLMResponse>;
    isAvailable(): Promise<boolean>;
}
```

### Ollama Provider

```typescript
// packages/server/src/services/llm/ollama-provider.ts

import { LLMProvider, LLMConfig, LLMResponse } from './llm-service';

export class OllamaProvider implements LLMProvider {
    name = 'ollama';
    private baseUrl: string;
    private defaultModel: string;

    constructor(baseUrl: string, defaultModel: string) {
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
    }

    async generate(prompt: string, system_prompt: string, config: LLMConfig): Promise<LLMResponse> {
        const startTime = Date.now();
        const model = config.model === 'auto' ? this.defaultModel : config.model || this.defaultModel;

        const body: any = {
            model,
            messages: [
                ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
                { role: 'user', content: prompt }
            ],
            options: {
                temperature: config.temperature ?? 0.7,
                num_predict: config.max_tokens ?? 2048
            },
            stream: false
        };

        // Force JSON output if requested
        if (config.output_format === 'json') {
            body.format = 'json';
        }

        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        return {
            content: data.message.content,
            model_used: model,
            provider: 'ollama',
            token_usage: {
                prompt_tokens: data.prompt_eval_count || 0,
                completion_tokens: data.eval_count || 0
            },
            latency_ms: latency
        };
    }

    async isAvailable(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`);
            return res.ok;
        } catch {
            return false;
        }
    }
}
```

### Gemini Provider

```typescript
// packages/server/src/services/llm/gemini-provider.ts

import { LLMProvider, LLMConfig, LLMResponse } from './llm-service';

export class GeminiProvider implements LLMProvider {
    name = 'gemini';
    private apiKey: string;
    private defaultModel: string;

    constructor(apiKey: string, defaultModel: string) {
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
    }

    async generate(prompt: string, system_prompt: string, config: LLMConfig): Promise<LLMResponse> {
        const startTime = Date.now();
        const model = config.model === 'auto' ? this.defaultModel : config.model || this.defaultModel;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: system_prompt ? { parts: [{ text: system_prompt }] } : undefined,
                    generationConfig: {
                        temperature: config.temperature ?? 0.7,
                        maxOutputTokens: config.max_tokens ?? 2048,
                        responseMimeType: config.output_format === 'json' ? 'application/json' : 'text/plain'
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        return {
            content: data.candidates[0].content.parts[0].text,
            model_used: model,
            provider: 'gemini',
            token_usage: {
                prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
                completion_tokens: data.usageMetadata?.candidatesTokenCount || 0
            },
            latency_ms: latency
        };
    }

    async isAvailable(): Promise<boolean> {
        return !!this.apiKey;
    }
}
```

### The Router: Hybrid Decision Logic

```typescript
// packages/server/src/services/llm/router.ts

import { LLMProvider, LLMRequest, LLMResponse, LLMConfig } from './llm-service';
import { SecurityService } from './security';
import { AuditLogger } from './audit';

export class LLMRouter {
    private localProvider: LLMProvider;
    private externalProvider: LLMProvider;
    private security: SecurityService;
    private audit: AuditLogger;

    constructor(
        localProvider: LLMProvider,
        externalProvider: LLMProvider,
        security: SecurityService,
        audit: AuditLogger
    ) {
        this.localProvider = localProvider;
        this.externalProvider = externalProvider;
        this.security = security;
        this.audit = audit;
    }

    async route(request: LLMRequest): Promise<LLMResponse> {
        const provider = await this.selectProvider(request.config);

        // Apply context minimization for external calls
        let prompt = request.prompt;
        let systemPrompt = request.system_prompt || '';

        if (provider.name !== 'ollama') {
            const sanitized = this.security.minimizeContext(
                prompt,
                systemPrompt,
                request.config.context_scope
            );
            prompt = sanitized.prompt;
            systemPrompt = sanitized.system_prompt;
        }

        const startTime = Date.now();
        let response: LLMResponse;

        try {
            response = await provider.generate(prompt, systemPrompt, request.config);

            // Log the call
            await this.audit.log({
                user_id: request.user_id,
                canvas_id: request.canvas_id,
                block_id: request.block_id,
                provider: provider.name,
                model: response.model_used,
                routing_type: provider.name === 'ollama' ? 'local' : 'external',
                context_scope: request.config.context_scope,
                prompt_token_count: response.token_usage.prompt_tokens,
                completion_token_count: response.token_usage.completion_tokens,
                latency_ms: response.latency_ms,
                success: true
            });

            return response;
        } catch (error) {
            // Log failure
            await this.audit.log({
                user_id: request.user_id,
                canvas_id: request.canvas_id,
                block_id: request.block_id,
                provider: provider.name,
                model: request.config.model || 'auto',
                routing_type: provider.name === 'ollama' ? 'local' : 'external',
                context_scope: request.config.context_scope,
                prompt_token_count: 0,
                completion_token_count: 0,
                latency_ms: Date.now() - startTime,
                success: false,
                error_message: (error as Error).message
            });

            // Fallback: if prefer_local failed on local, try external
            if (request.config.routing === 'prefer_local' && provider.name === 'ollama') {
                return this.route({
                    ...request,
                    config: { ...request.config, routing: 'external' }
                });
            }

            throw error;
        }
    }

    private async selectProvider(config: LLMConfig): Promise<LLMProvider> {
        switch (config.routing) {
            case 'local':
                if (!(await this.localProvider.isAvailable())) {
                    throw new Error('Local LLM provider is not available');
                }
                return this.localProvider;

            case 'external':
                if (!(await this.externalProvider.isAvailable())) {
                    throw new Error('External LLM provider is not available');
                }
                return this.externalProvider;

            case 'prefer_local':
                if (await this.localProvider.isAvailable()) {
                    return this.localProvider;
                }
                if (await this.externalProvider.isAvailable()) {
                    return this.externalProvider;
                }
                throw new Error('No LLM provider available');

            default:
                return this.localProvider;
        }
    }
}
```

### Security Service: Context Minimization

```typescript
// packages/server/src/services/llm/security.ts

export class SecurityService {
    /**
     * Strips context to minimum needed for the external call.
     * This prevents sending the user's full conversation/canvas to external APIs.
     */
    minimizeContext(
        prompt: string,
        systemPrompt: string,
        scope: 'minimal' | 'block_only' | 'full_canvas'
    ): { prompt: string; system_prompt: string } {
        switch (scope) {
            case 'minimal':
                // Only the immediate instruction. Strip any embedded context.
                return {
                    prompt: this.extractCoreInstruction(prompt),
                    system_prompt: this.stripUserSpecificContext(systemPrompt)
                };

            case 'block_only':
                // Include block config and immediate input, but not canvas-wide context
                return {
                    prompt: prompt,
                    system_prompt: this.stripCanvasContext(systemPrompt)
                };

            case 'full_canvas':
                // Send everything (used sparingly, only for complex reasoning tasks)
                return { prompt, system_prompt: systemPrompt };

            default:
                return {
                    prompt: this.extractCoreInstruction(prompt),
                    system_prompt: this.stripUserSpecificContext(systemPrompt)
                };
        }
    }

    private extractCoreInstruction(prompt: string): string {
        // Remove any [CONTEXT: ...] blocks that may have been injected
        return prompt.replace(/\[CONTEXT:[\s\S]*?\]/g, '').trim();
    }

    private stripUserSpecificContext(systemPrompt: string): string {
        // Remove user-specific identifiers and conversation history references
        return systemPrompt
            .replace(/user[_\s]?id\s*[:=]\s*\S+/gi, '')
            .replace(/conversation[_\s]?history\s*[:=][\s\S]*?(?=\n\n|\z)/gi, '')
            .trim();
    }

    private stripCanvasContext(systemPrompt: string): string {
        return systemPrompt
            .replace(/\[CANVAS_STATE:[\s\S]*?\]/g, '')
            .trim();
    }
}
```

---

## 8. The LLM Validation Pipeline

This is the 5-step pipeline that validates every LLM-generated canvas structure before it touches the UI.

```typescript
// packages/server/src/services/validation-pipeline.ts

import { CanvasDocument, Block, Edge } from '@imagination-engine/shared/types';
import { BlockValidator, ConnectionValidator, CanvasValidator } from '@imagination-engine/shared/validators';
import { BlockRegistryService } from './block-registry';

export interface PipelineResult {
    valid: boolean;
    step_failed?: string;
    errors: Array<{ step: string; message: string }>;
    corrected_document?: CanvasDocument;
}

export class ValidationPipeline {
    constructor(private registryService: BlockRegistryService) {}

    async validate(raw: string): Promise<PipelineResult> {
        const errors: PipelineResult['errors'] = [];

        // STEP 1: JSON Syntax
        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            return {
                valid: false,
                step_failed: 'json_syntax',
                errors: [{ step: 'json_syntax', message: `Invalid JSON: ${(e as Error).message}` }]
            };
        }

        // STEP 2: Canvas Schema Validation
        const schemaResult = CanvasValidator.validate(parsed);
        if (!schemaResult.valid) {
            return {
                valid: false,
                step_failed: 'schema_validation',
                errors: schemaResult.errors.map(e => ({
                    step: 'schema_validation',
                    message: `${e.path}: ${e.message}`
                }))
            };
        }

        const document = parsed as CanvasDocument;
        const registry = await this.registryService.getRegistryMap();

        // STEP 3: Block Type Registry Validation
        for (const block of document.blocks) {
            const blockResult = BlockValidator.validateAgainstRegistry(block, registry);
            if (!blockResult.valid) {
                errors.push(...blockResult.errors.map(e => ({
                    step: 'registry_validation',
                    message: `Block "${block.id}" (type: ${block.type}): ${e.message}`
                })));
            }
        }

        if (errors.some(e => e.step === 'registry_validation')) {
            return { valid: false, step_failed: 'registry_validation', errors };
        }

        // STEP 4: Connection Compatibility
        const blockMap = new Map(document.blocks.map(b => [b.id, b]));
        for (const edge of document.edges) {
            const sourceBlock = blockMap.get(edge.source.block_id);
            const targetBlock = blockMap.get(edge.target.block_id);

            if (!sourceBlock || !targetBlock) {
                errors.push({
                    step: 'connection_validation',
                    message: `Edge "${edge.id}" references non-existent block(s)`
                });
                continue;
            }

            const connResult = ConnectionValidator.validateConnection(
                edge, sourceBlock, targetBlock, registry
            );
            if (!connResult.valid) {
                errors.push(...connResult.errors.map(e => ({
                    step: 'connection_validation',
                    message: `Edge "${edge.id}": ${e.message}`
                })));
            }
        }

        if (errors.length > 0) {
            return { valid: false, step_failed: 'connection_validation', errors };
        }

        // STEP 5: Completeness & Uniqueness
        const blockIds = document.blocks.map(b => b.id);
        const duplicateIds = blockIds.filter((id, i) => blockIds.indexOf(id) !== i);
        if (duplicateIds.length > 0) {
            errors.push({
                step: 'completeness',
                message: `Duplicate block IDs: ${duplicateIds.join(', ')}`
            });
        }

        const edgeIds = document.edges.map(e => e.id);
        const duplicateEdgeIds = edgeIds.filter((id, i) => edgeIds.indexOf(id) !== i);
        if (duplicateEdgeIds.length > 0) {
            errors.push({
                step: 'completeness',
                message: `Duplicate edge IDs: ${duplicateEdgeIds.join(', ')}`
            });
        }

        return {
            valid: errors.length === 0,
            step_failed: errors.length > 0 ? 'completeness' : undefined,
            errors,
            corrected_document: errors.length === 0 ? document : undefined
        };
    }
}
```

---

## 9. Frontend Architecture: React Flow Integration

### Canvas View (Core Component)

```typescript
// packages/client/src/components/canvas/CanvasView.tsx

import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Node,
    Edge as RFEdge,
    NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { BlockRenderer } from '../blocks/BlockRenderer';
import { BLOCK_COMPONENT_REGISTRY } from '../blocks/registry';
import { useCanvas } from '../../hooks/useCanvas';
import { Block, Edge, CanvasDocument } from '@imagination-engine/shared/types';

/**
 * Converts our Block schema to React Flow Node format.
 * This is the bridge between our data model and the rendering library.
 */
function blockToNode(block: Block): Node {
    return {
        id: block.id,
        type: 'blockRenderer',  // all blocks use the same wrapper
        position: { x: block.position.x, y: block.position.y },
        data: {
            block,  // pass the full block object to the renderer
        },
        style: {
            width: block.position.width,
            height: block.position.height,
        },
    };
}

/**
 * Converts our Edge schema to React Flow Edge format.
 */
function edgeToRFEdge(edge: Edge): RFEdge {
    return {
        id: edge.id,
        source: edge.source.block_id,
        sourceHandle: edge.source.output_name,
        target: edge.target.block_id,
        targetHandle: edge.target.input_name,
        label: edge.label || undefined,
        animated: true,
        type: 'smoothstep',
    };
}

export function CanvasView({ canvasId }: { canvasId: string }) {
    const { document, updateBlock, addBlock, addEdge: addCanvasEdge, removeBlock } = useCanvas(canvasId);

    const initialNodes = useMemo(
        () => document.blocks.map(blockToNode),
        [document.blocks]
    );

    const initialEdges = useMemo(
        () => document.edges.map(edgeToRFEdge),
        [document.edges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // All block types render through BlockRenderer, which dynamically
    // selects the correct component from the registry
    const nodeTypes: NodeTypes = useMemo(() => ({
        blockRenderer: BlockRenderer,
    }), []);

    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                addCanvasEdge({
                    source: {
                        block_id: connection.source,
                        output_name: connection.sourceHandle || 'default'
                    },
                    target: {
                        block_id: connection.target,
                        input_name: connection.targetHandle || 'default'
                    }
                });
            }
            setEdges((eds) => addEdge(connection, eds));
        },
        [addCanvasEdge, setEdges]
    );

    const onNodeDragStop = useCallback(
        (_: any, node: Node) => {
            // Persist position change back to canvas document
            updateBlock(node.id, {
                position: {
                    x: node.position.x,
                    y: node.position.y,
                    width: node.data.block.position.width,
                    height: node.data.block.position.height,
                    z_index: node.data.block.position.z_index
                }
            });
        },
        [updateBlock]
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[16, 16]}
            >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap zoomable pannable />
            </ReactFlow>
        </div>
    );
}
```

### Block Renderer (Dynamic Component Selection)

```typescript
// packages/client/src/components/blocks/BlockRenderer.tsx

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BLOCK_COMPONENT_REGISTRY } from './registry';
import { Block } from '@imagination-engine/shared/types';
import { BlockWrapper } from './BlockWrapper';

interface BlockRendererData {
    block: Block;
}

/**
 * BlockRenderer is the universal node component for React Flow.
 * It receives the block data, looks up the correct component from
 * the registry, and renders it inside a standard wrapper (chrome).
 */
export const BlockRenderer = memo(({ data, selected }: NodeProps<BlockRendererData>) => {
    const { block } = data;
    const Component = BLOCK_COMPONENT_REGISTRY[block.type];

    if (!Component) {
        return (
            <BlockWrapper block={block} selected={selected}>
                <div className="p-4 text-red-500 text-sm">
                    Unknown block type: {block.type}
                </div>
            </BlockWrapper>
        );
    }

    return (
        <BlockWrapper block={block} selected={selected}>
            {/* Input handles - one per declared input */}
            {block.capabilities.inputs.map((input, i) => (
                <Handle
                    key={`in-${input.name}`}
                    type="target"
                    position={Position.Left}
                    id={input.name}
                    style={{ top: `${((i + 1) / (block.capabilities.inputs.length + 1)) * 100}%` }}
                    title={`${input.name} (${input.type})`}
                />
            ))}

            {/* The actual block content */}
            <Component block={block} />

            {/* Output handles - one per declared output */}
            {block.capabilities.outputs.map((output, i) => (
                <Handle
                    key={`out-${output.name}`}
                    type="source"
                    position={Position.Right}
                    id={output.name}
                    style={{ top: `${((i + 1) / (block.capabilities.outputs.length + 1)) * 100}%` }}
                    title={`${output.name} (${output.type})`}
                />
            ))}
        </BlockWrapper>
    );
});
```

### Example Block Component (TextBlock)

Each student creates block components following this pattern:

```typescript
// packages/client/src/components/blocks/registry/TextBlock.tsx

import { useState, useCallback } from 'react';
import { Block } from '@imagination-engine/shared/types';
import { useCanvas } from '../../../hooks/useCanvas';

interface TextBlockProps {
    block: Block;
}

export function TextBlock({ block }: TextBlockProps) {
    const { updateBlock } = useCanvas(block.id);
    const [content, setContent] = useState(block.state.data?.content || '');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Debounced save to canvas state
        updateBlock(block.id, {
            state: {
                ...block.state,
                data: { ...block.state.data, content: newContent },
                status: 'idle'
            }
        });
    }, [block.id, block.state, updateBlock]);

    const config = block.extensions?.config || {};

    return (
        <div className="p-3 h-full">
            <textarea
                className="w-full h-full resize-none border-none outline-none bg-transparent text-sm font-mono"
                value={content}
                onChange={handleChange}
                placeholder={config.placeholder || 'Start typing...'}
                maxLength={config.max_length || 10000}
            />
        </div>
    );
}
```

### Block Component Contract

Every block component must:

1. Accept `{ block: Block }` as its only prop
2. Read its configuration from `block.extensions.config`
3. Read its current state from `block.state.data`
4. Write state changes through the `useCanvas` hook's `updateBlock` method
5. Never modify the block's `capabilities`, `type`, or `id`
6. Handle the `idle`, `running`, `completed`, and `error` states appropriately
7. Be a default or named export registered in the `BLOCK_COMPONENT_REGISTRY`

This contract means any student can build any block component independently, and it will plug into the system without coordination beyond the registry file.

---

## 10. Chat-Canvas Synchronization

### The Chat Service and System Prompt Construction

```typescript
// packages/server/src/services/chat-service.ts

import { LLMRouter } from './llm/router';
import { ValidationPipeline } from './validation-pipeline';
import { BlockRegistryService } from './block-registry';
import { CanvasDocument, Message } from '@imagination-engine/shared/types';

export class ChatService {
    constructor(
        private llmRouter: LLMRouter,
        private validationPipeline: ValidationPipeline,
        private registryService: BlockRegistryService
    ) {}

    /**
     * Build the system prompt that gives the LLM full awareness of:
     * - What it is and what it can do
     * - The current canvas state
     * - The available block types
     * - The exact JSON schema it must produce
     */
    private async buildSystemPrompt(
        canvasDocument: CanvasDocument,
        conversationHistory: Message[]
    ): Promise<string> {
        const registry = await this.registryService.getActiveBlockTypes();

        const blockTypeDescriptions = registry.map(bt =>
            `- ${bt.type_name} (${bt.category}): ${bt.description}
               Inputs: ${bt.capabilities.inputs.map((i: any) => `${i.name}:${i.type}`).join(', ')}
               Outputs: ${bt.capabilities.outputs.map((o: any) => `${o.name}:${o.type}`).join(', ')}
               Routing: ${bt.llm_routing}`
        ).join('\n');

        return `You are the Imagination Engine assistant. You help users build creative and
automated workflows by constructing canvas structures from their natural language descriptions.

AVAILABLE BLOCK TYPES:
${blockTypeDescriptions}

CURRENT CANVAS STATE:
${JSON.stringify(canvasDocument, null, 2)}

CONVERSATION HISTORY (last 10 messages):
${conversationHistory.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

RESPONSE FORMAT:
When the user describes something they want to build or modify on their canvas, respond with:
1. A brief natural language explanation of what you're creating/modifying
2. A JSON block wrapped in \`\`\`canvas-update markers containing the changes

The canvas-update JSON must follow this exact structure:
{
    "action": "add_blocks" | "remove_blocks" | "update_blocks" | "add_edges" | "remove_edges" | "replace_canvas",
    "blocks": [...],   // for add/update/replace actions
    "edges": [...],    // for edge actions
    "block_ids": [...]  // for remove actions
}

Every block must conform to the registered schema. Every edge must connect valid output->input pairs.
If the user's request is conversational (not requesting canvas changes), respond conversationally without canvas-update markers.

CRITICAL: Only use block types from the AVAILABLE BLOCK TYPES list. Never invent new types.
CRITICAL: Ensure all block IDs are unique UUIDs.
CRITICAL: Ensure edge connections reference valid block IDs and port names.`;
    }

    /**
     * Process a user message: send to LLM, parse response, validate any
     * canvas updates, return both the chat response and validated updates.
     */
    async processMessage(
        userMessage: string,
        canvasDocument: CanvasDocument,
        conversationHistory: Message[],
        userId: string,
        canvasId: string
    ): Promise<{
        chatResponse: string;
        canvasUpdate?: any;
        validationErrors?: string[];
    }> {
        const systemPrompt = await this.buildSystemPrompt(canvasDocument, conversationHistory);

        const llmResponse = await this.llmRouter.route({
            prompt: userMessage,
            system_prompt: systemPrompt,
            config: {
                routing: 'prefer_local',
                output_format: 'text',
                context_scope: 'full_canvas',
                temperature: 0.7,
                max_tokens: 4096
            },
            user_id: userId,
            canvas_id: canvasId
        });

        // Parse response: extract chat text and any canvas-update JSON
        const { text, canvasUpdateJson } = this.parseResponse(llmResponse.content);

        if (!canvasUpdateJson) {
            return { chatResponse: text };
        }

        // Validate the canvas update through the pipeline
        const validation = await this.validationPipeline.validate(canvasUpdateJson);

        if (!validation.valid) {
            // Return the chat response but flag the validation errors
            // The frontend can show these as warnings
            return {
                chatResponse: text,
                validationErrors: validation.errors.map(e => `${e.step}: ${e.message}`)
            };
        }

        return {
            chatResponse: text,
            canvasUpdate: JSON.parse(canvasUpdateJson)
        };
    }

    private parseResponse(content: string): { text: string; canvasUpdateJson: string | null } {
        const canvasUpdateMatch = content.match(/```canvas-update\s*([\s\S]*?)```/);

        if (!canvasUpdateMatch) {
            return { text: content, canvasUpdateJson: null };
        }

        const text = content.replace(/```canvas-update[\s\S]*?```/, '').trim();
        const canvasUpdateJson = canvasUpdateMatch[1].trim();

        return { text, canvasUpdateJson };
    }
}
```

---

## 11. Authentication

Keep it simple and secure. Do not roll your own crypto.

```typescript
// packages/server/src/controllers/auth.controller.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { db } from '../db/connection';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const SALT_ROUNDS = 12;

export class AuthController {
    register = async (req: Request, res: Response) => {
        const { email, password, display_name } = req.body;

        if (!email || !password || !display_name) {
            return res.status(400).json({ error: 'Email, password, and display name required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at',
            [email.toLowerCase(), passwordHash, display_name]
        );

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        res.status(201).json({ user, token });
    };

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const result = await db.query(
            'SELECT id, email, display_name, password_hash FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        const { password_hash, ...safeUser } = user;
        res.json({ user: safeUser, token });
    };
}
```

---

## 12. Testing Strategy & CI/CD

### Test Structure

```
packages/shared/src/__tests__/
    block-validator.test.ts        # schema validation
    connection-validator.test.ts   # edge type compatibility
    canvas-validator.test.ts       # full canvas validation
    block-factory.test.ts          # factory creates valid blocks

packages/server/src/__tests__/
    validation-pipeline.test.ts    # 5-step pipeline
    llm-router.test.ts             # routing logic
    chat-service.test.ts           # response parsing & canvas update extraction
    canvas.integration.test.ts     # API endpoint tests

packages/client/src/__tests__/
    block-renderer.test.tsx        # renders correct component per type
    canvas-view.test.tsx           # React Flow integration
```

### Critical Eval Scenarios

Create a file `evals/scenarios.json` with test cases:

```json
[
    {
        "id": "eval-001",
        "name": "Simple two-block workflow",
        "input": "I want to upload a document and summarize it",
        "expected_blocks": ["file-upload", "summarizer"],
        "expected_edges": 1,
        "expected_connection": {
            "source_type": "file-upload",
            "source_output": "file_content",
            "target_type": "summarizer",
            "target_input": "content"
        }
    },
    {
        "id": "eval-002",
        "name": "Three-block creative chain",
        "input": "Take some text I write, generate an image from it, and put both side by side",
        "expected_blocks": ["text", "image-gen", "document"],
        "expected_edges": 2
    },
    {
        "id": "eval-003",
        "name": "Invalid block rejection",
        "input_json": "{\"blocks\": [{\"type\": \"nonexistent-block\"}]}",
        "should_fail_at_step": "registry_validation"
    },
    {
        "id": "eval-004",
        "name": "Type mismatch detection",
        "description": "Edge connecting image output to code input should fail",
        "should_fail_at_step": "connection_validation"
    },
    {
        "id": "eval-005",
        "name": "Round-trip serialization",
        "description": "Generate canvas, export JSON, import JSON, verify identical rendering"
    },
    {
        "id": "eval-006",
        "name": "Chat generates valid canvas",
        "input": "Create a workspace where I can brainstorm ideas with AI and save the best ones",
        "validation": "LLM output passes all 5 pipeline steps on first attempt"
    },
    {
        "id": "eval-007",
        "name": "Hybrid routing verification",
        "description": "Summarizer block uses Ollama. Image-gen block uses Gemini. Verify audit log entries.",
        "expected_local_calls": 1,
        "expected_external_calls": 1
    }
]
```

### CI Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Shared package must build first (others depend on it)
      - name: Build shared types
        run: pnpm --filter shared build

      - name: Lint
        run: pnpm -r lint

      - name: Type check
        run: pnpm -r typecheck

      - name: Schema validation
        run: pnpm --filter shared validate

      - name: Unit tests
        run: pnpm -r test

  integration:
    runs-on: ubuntu-latest
    needs: validate
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ie_test
          POSTGRES_USER: ie_test
          POSTGRES_PASSWORD: ie_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter shared build

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://ie_test:ie_test@localhost:5432/ie_test
        run: pnpm db:migrate

      - name: Seed test data
        env:
          DATABASE_URL: postgresql://ie_test:ie_test@localhost:5432/ie_test
        run: pnpm db:seed

      - name: Integration tests
        env:
          DATABASE_URL: postgresql://ie_test:ie_test@localhost:5432/ie_test
          JWT_SECRET: test-secret-do-not-use-in-production
        run: pnpm --filter server test:integration
```

---

## 13. Daily Coordination Protocol

### The 15-Minute Standup

Every day, same time, 15 minutes max.

Each person answers three questions:
1. What did I merge yesterday?
2. What am I working on today?
3. Is anything blocked, and does anyone need to coordinate with me?

### The Integration Lead Role

One person is the integration lead for the sprint. Their additional responsibilities:

- Monitor the `develop` branch. If CI breaks, fixing it is top priority.
- Merge `develop` into `main` at end of each working day (if CI passes).
- Resolve any merge conflicts that involve multiple people's code.
- Run the eval scenarios against `develop` every other day.
- Post a daily status in the team channel: "develop is green/red, X PRs pending review, Y blocks integrated"

### The Schema Guardian Role

One person is the schema guardian. Their job:

- Any PR that touches `packages/shared/src/types/` or `packages/shared/src/schemas/` must have their approval.
- They verify that schema changes don't break existing block types.
- They maintain the JSON Schema files in sync with the TypeScript types.
- They run the schema validation suite before approving any schema PR.

These two roles can be the same person if the team is small enough. Rotate weekly if the sprint extends.

### Communication Protocol for Emergencies

If you need to make a breaking change (rename a field, change a type, modify the block contract):

1. Post in the team channel immediately: "BREAKING: I need to change X because Y"
2. Everyone acknowledges
3. Everyone pushes or stashes their current work
4. The change is made, merged, and everyone rebases
5. Total downtime: 30 minutes max

Never surprise the team with a breaking change in a PR. The cost of a 5-minute heads-up is nothing compared to the cost of 4 people debugging type errors independently.

---

## 14. Appendix: Full TypeScript Type Definitions

These go in `packages/shared/src/types/` and are the definitive contract for the entire system.

```typescript
// packages/shared/src/types/block.ts

export interface Block {
    id: string;                    // UUID v4
    type: string;                  // matches block_registry.type_name
    version: string;               // semver of the block type

    meta: BlockMeta;
    capabilities: BlockCapabilities;
    state: BlockState;
    position: BlockPosition;
    extensions: Record<string, any>;  // type-specific data
}

export interface BlockMeta {
    name: string;
    description: string;
    icon: string | null;
    tags: string[];
    created_at: string;            // ISO 8601
    updated_at: string;
    author: string;                // user ID or 'system'
}

export interface BlockCapabilities {
    inputs: BlockPort[];
    outputs: BlockPort[];
    config_schema: object;          // JSON Schema for block-specific config
    supported_triggers: TriggerType[];
    execution_mode: ExecutionMode;
    llm_routing: LLMRouting;
}

export interface BlockPort {
    name: string;
    type: string;                   // MIME-like: "text/plain", "image/*", "*/*"
    required: boolean;
    schema: object | null;          // optional JSON Schema for the port's data
}

export type TriggerType = 'manual' | 'event' | 'schedule' | 'upstream';
export type ExecutionMode = 'sync' | 'async' | 'streaming';
export type LLMRouting = 'local' | 'external' | 'prefer_local' | 'none';

export interface BlockState {
    status: 'idle' | 'running' | 'completed' | 'error';
    data: Record<string, any>;      // runtime state, type-specific
    last_run: string | null;        // ISO 8601
    error?: string;
}

export interface BlockPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    z_index: number;
}

export interface BlockRegistryEntry {
    id: string;
    type_name: string;
    display_name: string;
    category: string;
    description: string | null;
    capabilities: BlockCapabilities;
    default_config: Record<string, any>;
    default_width: number;
    default_height: number;
    llm_routing: LLMRouting;
    version: string;
    is_active: boolean;
}
```

```typescript
// packages/shared/src/types/edge.ts

export interface Edge {
    id: string;                     // UUID v4

    source: {
        block_id: string;
        output_name: string;        // matches a capabilities.outputs[].name
    };

    target: {
        block_id: string;
        input_name: string;         // matches a capabilities.inputs[].name
    };

    transform: EdgeTransform | null;
    condition: EdgeCondition | null;
    label: string | null;
}

export interface EdgeTransform {
    type: 'mapping' | 'template' | 'code';
    spec: any;                      // transform-type-specific configuration
}

export interface EdgeCondition {
    type: 'expression' | 'status' | 'value_match';
    spec: any;                      // condition-type-specific configuration
}
```

```typescript
// packages/shared/src/types/canvas.ts

import { Block } from './block';
import { Edge } from './edge';

export interface CanvasDocument {
    canvas: CanvasMeta;
    blocks: Block[];
    edges: Edge[];
    viewport: Viewport;
}

export interface CanvasMeta {
    id: string;
    name: string;
    type: 'creativity' | 'work' | 'hybrid';
    version: string;
    created_at: string;
    updated_at: string;
    owner: string;
}

export interface Viewport {
    x: number;
    y: number;
    zoom: number;
}

export type CanvasType = 'creativity' | 'work' | 'hybrid';
```

```typescript
// packages/shared/src/types/chat.ts

export interface Conversation {
    id: string;
    canvas_id: string;
    created_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    canvas_snapshot_id: string | null;
    affected_blocks: string[];
    token_count: number | null;
    model_used: string | null;
    created_at: string;
}

export interface CanvasUpdate {
    action: 'add_blocks' | 'remove_blocks' | 'update_blocks' | 'add_edges' | 'remove_edges' | 'replace_canvas';
    blocks?: Block[];
    edges?: Edge[];
    block_ids?: string[];
}
```

```typescript
// packages/shared/src/types/user.ts

export interface User {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}
```

---

## Quick Reference: Who Builds What

| Area | Owner | Key Files |
|------|-------|-----------|
| Database + Migrations | Lead/Pair | `packages/server/src/db/` |
| Shared Types + Schemas | Schema Guardian | `packages/shared/src/` |
| API Routes + Controllers | Backend Dev | `packages/server/src/routes/`, `controllers/` |
| LLM Service + Router | Backend Dev | `packages/server/src/services/llm/` |
| Validation Pipeline | Backend Dev | `packages/server/src/services/validation-pipeline.ts` |
| React Flow Canvas | Frontend Dev | `packages/client/src/components/canvas/` |
| Chat Panel | Frontend Dev | `packages/client/src/components/chat/` |
| Auth Flow (both ends) | Any Dev | `auth.controller.ts`, `LoginForm.tsx`, `RegisterForm.tsx` |
| Landing Page | Frontend Dev | `packages/client/src/components/landing/` |
| Block: [type] | Individual | One PR per block, touches shared + server + client |
| CI/CD Pipeline | Integration Lead | `.github/workflows/` |
| Eval Scenarios | Team | `evals/scenarios.json` |

Every student should own at least 3 to 5 block type implementations. Block development is the parallelizable work. Everything else in this table is either foundation (Days 1-2) or coordination infrastructure.

---

*This document is the engineering contract. If it's not in here, discuss it before building it. If it is in here, build it exactly as specified unless you have a better approach, in which case, propose it in a PR description and get team consensus before diverging.*
