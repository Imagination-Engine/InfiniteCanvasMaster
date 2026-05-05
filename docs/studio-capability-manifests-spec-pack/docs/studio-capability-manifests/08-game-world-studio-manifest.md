# 08 — Game & World Studio Manifest

## Product Role

Turns lore, mechanics, assets, and scripts into playable runtime surfaces, worlds, game specs, simulations, and builds.

## Core Blocks

- Game Studio
- World Builder
- Game Runtime
- Scene
- Level
- Character
- Mechanics
- Physics
- Asset Generator
- Quest
- Simulation
- Playtest

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Phaser
- PixiJS
- Babylon.js
- Matter.js
- Godot future candidate

## Artifact Contracts

Produces:

- `game.spec`
- `game.build`
- `image.asset`
- `audio.asset`
- `script`

Accepts:

- `story bible`
- `script`
- `image.asset`
- `audio.asset`
- `app.code`

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

Build runtime_simulation boundary and simple Phaser/Pixi runtime block. Save snapshots to document_state; live ticks stay runtime_simulation.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
