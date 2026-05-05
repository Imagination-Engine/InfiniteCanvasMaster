# 11 — Agent & Automation Studio Manifest

## Product Role

Creates, configures, supervises, and saves agents/workflows that can work across any other studio.

## Core Blocks

- Agent Studio
- Blank Agent Template
- Agent
- Supervisor Agent
- Agent Swarm
- ImagiClaw Agent
- ImagiClaw Sandbox
- Tool Runner
- MCP Tool
- Mastra Workflow
- Approval Queue

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Mastra
- MCP
- ImagiClaw sandbox
- n8n recipe source
- Temporal future

## Artifact Contracts

Produces:

- `agent.recipe`
- `tool.recipe`
- `dag.plan`
- `workflow_trace`
- `compiled.output`

Accepts:

- `any studio artifact`
- `intent.summary`
- `dag.plan`
- `research.brief`
- `app.code`
- `script`

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

Build Blank Agent Template, ImagiClaw Sandbox, local/draft save-to-library, and strict security/readiness labels.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
