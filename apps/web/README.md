# web

Vite/React client: infinite canvas (`@iem/imagination-canvas-kit`), workflow nodes, and dual-view chat.

## Reel / Video Studio (canvas)

- **Text to Image** blocks: `ReelMediaView` + `POST /api/reel/generate-image` (prompts from block description/inputs, verbatim to Gemini).
- **Video Studio** (`iem.studio.video`): `VideoStudioBlock` on the spatial canvas reads connections from Zustand stores; React Flow workflow uses `VideoStudioForgeView` with explicit edges.
- Canvas persistence merges server documents with local generated `imageUrl` / forge state (`DualViewContainer` + `spatialDocumentBridge`).

See [packages/surface-reel/README.md](../../packages/surface-reel/README.md) and [apps/server/README.md](../server/README.md).

## Links

- [Agent Primer](../../AGENTS.md)
- [Reel Veo conductor track](../../conductor/tracks/reel_veo_forge_20260520/)
