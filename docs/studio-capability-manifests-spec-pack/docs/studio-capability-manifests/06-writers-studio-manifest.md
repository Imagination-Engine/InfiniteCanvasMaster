# 06 — Writer's Studio Manifest

## Product Role

Turns ideas into scripts, stories, books, launch narratives, app copy, and artifact-ready text.

## Core Blocks

- Writer's Studio
- Rich Document
- Script
- Outline
- Story Bible
- Character
- Scene
- Critique Agent
- Style Guide
- Export

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Tiptap
- BlockNote
- Lexical
- Monaco/CodeMirror

## Artifact Contracts

Produces:

- `script`
- `outline`
- `manuscript`
- `research.brief`
- `knowledge.card`

Accepts:

- `intent.summary`
- `research.brief`
- `source.bundle`

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

Build first vertical slice if repo lacks media/runtime dependencies: real editor substrate, AI suggestion panel, script artifact export.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
