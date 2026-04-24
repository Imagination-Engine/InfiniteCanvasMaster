# Playbook: The Sidecar Strategy (LibreChat & Tldraw)

> **Document Status:** Adamantium.
> **Audience:** Engineering Team (Students C, D, E)
> **Goal:** How to integrate LibreChat and Tldraw without breaking the hardened `@iem/core` substrate.

## The Threat

You have been tasked with integrating two massive, monolithic ecosystems: **LibreChat** (for temporal chat history, reasoning, and multimodal inputs) and **Tldraw** (for infinite spatial canvas rendering).

If you try to `npm install` LibreChat into `apps/web` or embed Tldraw directly into a React Flow wrapper, the monorepo will choke. Dependencies will collide, builds will stall, and the `blockRegistry` we just hardened will be bypassed.

## The Strategy: "Subjugation by Interface"

We do not merge these tools into our core. We subjugate them. We force them to speak our language via MCP and strict adapters.

### Phase 1: LibreChat as the "Temporal Shell" (The Sidecar)

LibreChat runs as its own separate application (the "Sidecar"). It does not share our Postgres database, and it does not import `@iem/core`.

**How it connects:**

1. **The MCP Bridge:** In `packages/core/src/mcp/server.ts`, we have exposed the entire `blockRegistry` as a standard MCP server. Every magnificent block (Prose, Architect, Playable Spawner) is now an MCP tool.
2. **The LibreChat Config:** You will configure LibreChat's `librechat.yaml` to connect to our Imagination Engine MCP server (via `stdio` or `sse` depending on deployment).
3. **The Result:** When a user types into LibreChat, LibreChat's native reasoning engine decides to call a tool. It hits our MCP server. Our backend executes the strict, Zod-validated Block logic, interacts with the Canvas, and returns the result to LibreChat. LibreChat handles the UI; we handle the cognition.

### Phase 2: Tldraw as the "Spatial Renderer"

Tldraw replaces React Flow in `apps/web/src/Components/Canvas.tsx`.

**The Hard Rule:** Tldraw is a _renderer_, not a database. It does not own the shape of a block.

**The Implementation:**

1. Rip out `@xyflow/react`.
2. Install `tldraw`.
3. Build the `TldrawAdapter`: This adapter subscribes to the `blockRegistry` and our `canvasTypes` (nodes/edges).
4. For every node in the database, the adapter creates a custom `TLHTMLShape` on the Tldraw canvas.
5. When a user drags a shape in Tldraw, you intercept the `onChange` event and fire an API call to update the coordinates in our Postgres database.
6. The visual fluidity belongs to Tldraw. The topological reality belongs to the Imagination Engine.

## Your Orders for Tomorrow Morning

- **Student C:** Begin the React Flow teardown. Spin up a spike branch. Get a single Tldraw `<Tldraw />` component rendering, and map a `iem.scribe.prose` block onto it as a custom HTML shape.
- **Student D & E:** Boot up the LibreChat docker container alongside our backend. Connect it to the MCP server located at `pnpm --filter @iem/core run mcp`. Ask the LibreChat instance to list its tools. When it spits out the 50-60 magnificent blocks, the bridge is complete.

Do not break the substrate. Build the adapters. Execute.
