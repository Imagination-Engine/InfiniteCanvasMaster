# CHANGES

## 2026-02-28 — Canvas Block Schema v2.0

### What Changed

Replaced the original lightweight `src/utils/canvasAdapter.ts` (35 lines, untyped `any`)
with a production-grade, fully-typed block schema system spanning four new modules:

| File | Purpose |
|------|---------|
| `src/canvas/types/block.types.ts` | All TypeScript types — 12 block types, discriminated content unions, React Flow wrappers |
| `src/canvas/adapters/jsonCanvas.adapter.ts` | Bidirectional adapter for JSON Canvas v1.0 import/export |
| `src/canvas/factories/block.factory.ts` | `createBlock()` factory with `DEFAULT_CONTENT` for all types |
| `migrations/002_canvas_blocks.sql` | PostgreSQL schema for `blocks` and `block_edges` tables |

### Why

The original adapter was a thin serialisation layer that:
- Used `any` throughout, providing no type safety
- Had no import capability (export-only)
- Used a custom "BALNCE Spec" format with no interoperability
- Had no concept of block content types, metadata, or permissions

The new system provides:
- **Strict TypeScript typing** with generic `BlockData<T>` and `BlockContentMap`
- **JSON Canvas v1.0 interop** — bidirectional import/export to the open `.canvas` format
- **Block factory** — single entry point for creating valid blocks (agents + UI)
- **PostgreSQL persistence** — JSONB storage with flat geometry columns for spatial queries

### Deleted Files

- `src/utils/canvasAdapter.ts` — superseded by `src/canvas/adapters/jsonCanvas.adapter.ts`

### Breaking Changes

- `SaveCanvasButton.tsx` imports `serializeCanvasToBalnceSpec` from the deleted adapter.
  It must be updated to use `exportCanvasToJsonCanvas` from the new adapter.

### Adding New Block Types

Update only these four locations:
1. `block.types.ts` — add to `BlockType`, define `Content` interface, add to `BlockContentMap`
2. `block.factory.ts` — add default content to `DEFAULT_CONTENT`
3. `jsonCanvas.adapter.ts` — add to `BLOCK_TYPE_TO_JC` map
4. React Flow — create the custom node component and register in `nodeTypes`
