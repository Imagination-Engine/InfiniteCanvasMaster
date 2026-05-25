# surface-reel

Surface C — generative reel blocks, Gemini image generation, and the **Reel Forge** UI for Video Studio.

## Reel Forge (Veo reference video)

End-to-end flow on the infinite canvas:

1. Add one or more **`iem.reel.textToImage`** nodes (up to three references into the forge).
2. Enter a full image prompt per node and run **Generate Media** (stores `imageUrl` on the block).
3. Add **`iem.studio.video`** (Video Studio) and connect each image node → studio (source → target).
4. Open Video Studio (fullscreen): confirm the **reference tray**, enter a **motion prompt**, click **Forge**.
5. Poll until the clip is ready; play the MP4 in the panel.

Shorthand block IDs (`reel.textToImage`, `reel.forge`) are normalized to canonical `iem.*` IDs via `@iem/core`.

### Key modules

| Module                              | Role                                                |
| ----------------------------------- | --------------------------------------------------- |
| `src/blocks/mediaBlocks.ts`         | `textToImageBlock` and other reel block definitions |
| `src/ui/ReelForgePanel.tsx`         | Reference tray, forge controls, video player        |
| `@iem/core` `collectReelReferences` | Resolves connected upstream `imageUrl` values       |

### Server API

The web app calls `apps/server` routes documented in [apps/server/README.md](../../apps/server/README.md):

- `POST /api/reel/generate-image`
- `POST /api/reel/generate-video` + `GET /api/reel/generate-video/:operationId`

## Links

- [Agent Primer](../../AGENTS.md)
- [Conductor track: Reel Veo Reference Forge](../../conductor/tracks/reel_veo_forge_20260520/)
- [Server Reel API](../../apps/server/README.md)
