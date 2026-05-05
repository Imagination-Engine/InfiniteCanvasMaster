# 09 — App Creation Studio Manifest

## Product Role

Turns intent, requirements, designs, data, APIs, and agents into running apps, SaaS prototypes, dashboards, and previews.

## Core Blocks

- App Creation Studio
- Code Agent
- Code Workspace
- Live Preview
- Web App
- Iframe
- Terminal
- API Tester
- Database View
- Component Builder
- Test Runner

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Sandpack
- WebContainers
- E2B
- Daytona
- Monaco/CodeMirror
- ImagiClaw

## Artifact Contracts

Produces:

- `app.spec`
- `app.code`
- `app.preview`
- `compiled.output`

Accepts:

- `intent.summary`
- `requirement`
- `design.asset`
- `script`
- `commerce.offer`
- `checkout.flow`
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

Build sandboxed preview boundary. No host shell. Use Sandpack first if available; WebContainers/E2B/Daytona as candidates.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
