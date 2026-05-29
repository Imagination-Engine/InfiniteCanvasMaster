# server

Hono API for the Imagination Engine: chat, blocks, canvas persistence, and generative media (Reel).

## Reel API (`/api/reel`)

Generated files are written under `apps/server/public/generated-media/` and served at `/generated-media/:filename`.

| Method | Path                                    | Body                                                                                        | Response                                                                                       |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `POST` | `/api/reel/generate-image`              | `{ "prompt": string }`                                                                      | `{ "imageUrl": "/generated-media/…" }`                                                         |
| `POST` | `/api/reel/generate-video`              | `{ "prompt": string, "referenceImages": [{ "url": string, "mimeType?": string }] }` (max 3) | `{ "operationId": string, "status": "pending" }`                                               |
| `GET`  | `/api/reel/generate-video/:operationId` | —                                                                                           | `{ "operationId", "status", "clipUrl?", "error?" }` — poll until `status` is `done` or `error` |
| `GET`  | `/api/reel/media/:filename`             | —                                                                                           | Serves a persisted PNG/JPG/MP4                                                                 |

### Environment

- **`GEMINI_API_KEY`** or **`GOOGLE_GENERATIVE_AI_API_KEY`** — required for image generation (Gemini Nano Banana) and Veo 3.1 video forge.
- **`IEM_MOCK_MODELS=1`** — skips live Veo calls; `generate-video` completes immediately with `clipUrl: "/generated-media/mock-reel.mp4"`.

### Veo implementation notes

- Service: `src/services/veoForge.ts` (model `veo-3.1-generate-preview`, long-running `predictLongRunning`).
- Reference images may be sent as `imageBytes`, `bytesBase64Encoded`, or `inlineData` depending on API acceptance (automatic fallback).
- With references attached, forge uses **8s** duration and **16:9** aspect ratio.

## Links

- [Agent Primer](../../AGENTS.md)
- [Reel Veo track](../../conductor/tracks/reel_veo_forge_20260520/)
- [Surface Reel package](../../packages/surface-reel/README.md)
