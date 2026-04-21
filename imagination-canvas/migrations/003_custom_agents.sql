CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS custom_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  avatar_url TEXT,
  story TEXT,
  persona JSONB NOT NULL,
  skills TEXT[] NOT NULL,
  context_sources JSONB,
  capabilities JSONB NOT NULL,
  purpose TEXT NOT NULL,
  block_definition JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_agents_owner_id_idx ON custom_agents (owner_id);

-- Table for storing context chunks with embeddings
CREATE TABLE IF NOT EXISTS custom_agent_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES custom_agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_agent_context_embedding_idx ON custom_agent_context USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
