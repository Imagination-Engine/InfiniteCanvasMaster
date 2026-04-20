-- ============================================================
-- 002_canvas_blocks.sql
-- Canvas Blocks Schema for the Imagination Canvas.
--
-- Stores React Flow nodes and edges in PostgreSQL.
-- The `data` JSONB column holds the full BlockData payload
-- (metadata, content, agentContext, permissions, status).
-- Geometry fields (pos_x, pos_y, z_index) are flat columns
-- for efficient spatial queries (e.g. find all blocks in viewport).
-- ============================================================

CREATE TABLE IF NOT EXISTS blocks (
  id            VARCHAR      NOT NULL PRIMARY KEY,           -- e.g. "code-abc123"
  project_id    UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type          VARCHAR      NOT NULL,                       -- BlockType enum value

  -- React Flow / JSON Canvas geometry (flat for query performance)
  pos_x         INTEGER      NOT NULL DEFAULT 0,
  pos_y         INTEGER      NOT NULL DEFAULT 0,
  z_index       INTEGER      NOT NULL DEFAULT 0,
  parent_id     VARCHAR      REFERENCES blocks(id),          -- for group/nested blocks

  -- Full block payload: BlockData<T> serialised as JSONB
  -- Includes: metadata, content, agentContext, permissions, status
  data          JSONB        NOT NULL,

  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  version       INTEGER      NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS block_edges (
  id                VARCHAR      NOT NULL PRIMARY KEY,
  project_id        UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_block_id   VARCHAR      NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  target_block_id   VARCHAR      NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,

  source_handle     VARCHAR,                                 -- "right" | "left" | "top" | "bottom"
  target_handle     VARCHAR,

  -- CanvasEdgeData fields
  connection_type   VARCHAR      NOT NULL DEFAULT 'dataflow',-- "dataflow" | "dependency" | "context" | "reference"
  label             VARCHAR,
  color             VARCHAR,
  directionality    VARCHAR      NOT NULL DEFAULT 'arrow',   -- "arrow" | "none"

  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────
-- Common query patterns: load all blocks for a project, filter by type,
-- spatial viewport queries, and traversal by edge source/target.

CREATE INDEX IF NOT EXISTS idx_blocks_project_id   ON blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_blocks_type         ON blocks(type);
CREATE INDEX IF NOT EXISTS idx_blocks_position     ON blocks(project_id, pos_x, pos_y);
CREATE INDEX IF NOT EXISTS idx_block_edges_project ON block_edges(project_id);
CREATE INDEX IF NOT EXISTS idx_block_edges_source  ON block_edges(source_block_id);
CREATE INDEX IF NOT EXISTS idx_block_edges_target  ON block_edges(target_block_id);

-- GIN index on the JSONB payload for arbitrary queries like:
-- WHERE data->'metadata'->>'createdBy' = 'BusinessStrategistAgent'
CREATE INDEX IF NOT EXISTS idx_blocks_data_gin ON blocks USING GIN(data);
