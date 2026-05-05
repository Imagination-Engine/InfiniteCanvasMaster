# 07 — Video Studio Manifest

## Product Role

Turns scripts, assets, voice, images, footage, and ideas into reels, trailers, shorts, explainers, and cinematic artifacts.

## Core Blocks

- Video Studio
- Reel Studio
- Storyboard
- Shot List
- Timeline Editor
- Clip
- Caption
- Voiceover
- Music
- Render Queue
- Video Artifact

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Twick
- ffmpeg.wasm
- Native FFmpeg Worker
- OpenMontage recipe source
- Remotion
- Veo
- Nano Banana

## Artifact Contracts

Produces:

- `video.asset`
- `audio.asset`
- `image.asset`
- `compiled.output`

Accepts:

- `script`
- `storyboard`
- `image.asset`
- `audio.asset`
- `research.brief`

## Required Surfaces

### Minimized Block

- clear purpose title,
- studio icon,
- runtime readiness,
- latest status or output cue,
- human-in-the-loop indicator when relevant.

### Expanded Surface

- studio-specific workspace,
- block chat/control panel,
- tools/capabilities panel,
- artifact output area,
- runtime readiness/status,
- activity timeline.

## Implementation Slice

Build timeline shell + asset bin + script panel + FFmpeg/OpenMontage readiness. OpenMontage is recipe_source until license review.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
