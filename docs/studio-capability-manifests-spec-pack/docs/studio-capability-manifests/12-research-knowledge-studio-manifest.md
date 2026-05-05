# 12 — Research & Knowledge Studio Manifest

## Product Role

Grounds every other studio with collection, organization, synthesis, citations, sources, and reusable knowledge.

## Core Blocks

- Research Studio
- Research Stream
- Knowledge Card
- Source/Citation
- Dataset
- Transcript
- Memory Cluster
- Knowledge Pod
- RAG Query
- Research Brief

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- LlamaIndex.TS
- Haystack
- LangChain reference
- Docling/LlamaParse candidates

## Artifact Contracts

Produces:

- `research.brief`
- `source.bundle`
- `knowledge.card`
- `dataset`
- `transcript`

Accepts:

- `intent.summary`
- `uploaded files`
- `URLs`
- `transcripts`
- `workspace artifacts`

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

Build Research Brief, Source Bundle, Citation card UI, and RAG adapter boundary. Do not hallucinate source claims.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
