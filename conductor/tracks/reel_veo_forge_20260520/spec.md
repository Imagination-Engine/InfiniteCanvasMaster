# Specification: Reel Veo Reference Forge

## Overview

Surface C delivers a **reference forge**: upstream canvas nodes supply images (≤3); the Video Studio block (`iem.studio.video`) calls Google Veo 3.1 via the Gemini API and produces a single playable MP4.

## Functional Requirements

1. **Reference collector** — Walk edges into `iem.studio.video`; resolve `imageUrl` from node metadata/inputs/outputs; cap at 3 references (`collectReelReferences` in `@iem/core`).
2. **Veo API** — `POST /api/reel/generate-video` starts a long-running job; `GET /api/reel/generate-video/:operationId` polls until `clipUrl` is ready.
3. **Artifact v2** — `video-project` includes `references[]` and `forge` (prompt, status, clipUrl, operationId).
4. **UI** — Reference tray, motion prompt, Forge button, inline `<video>` player (`ReelForgePanel` in `@iem/surface-reel`; `VideoStudioBlock` in `@iem/imagination-canvas-kit`).

## Canvas wiring

- One `iem.reel.textToImage` (or `iem.reel.character` / `iem.reel.scene`) per keyframe still.
- Connect each image node → `iem.studio.video` (source → target).
- Put the **motion / Veo prompt** on the Video Studio block; put **image prompts** on each Text to Image node.

## Acceptance Criteria

- [x] User connects 1–3 image nodes to Video Studio, enters prompt, forges, and plays MP4.
- [x] `GEMINI_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`) drives image + Veo; `IEM_MOCK_MODELS=1` returns a mock clip in dev.
- [x] `google-veo` tool mount registered on video-studio manifest.
