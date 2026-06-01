# Imagination Engine: Faculty Brief

## Project Summary

The Imagination Engine is a unified, agentic canvas substrate that transforms a standard node-based UI into a multi-surface studio. It supports five distinct interactive expressions (Playable, Conductor, Reel, Forge, Atlas), demonstrating how a single foundational architecture can dynamically adapt to highly specialized user intents.

## The Four Invariants

1. **MCP-Native Blocks:** All nodes are defined using the Model Context Protocol, allowing seamless integration with external LLMs and tools.
2. **Holonic Canvas:** The canvas is infinitely nestable and recursively scalable.
3. **Chat-Canvas Duality:** Equal emphasis on conversational and visual interactions, with bidirectional state synchronization.
4. **Relaunchable Creations:** Every workspace session exports into a standalone, runnable artifact.

## Technical Deep-Dive

### Model Context Protocol (MCP)

We implemented a strict adaptation of MCP to standardize node interactions. By defining `BlockProtocol`, we decoupled the visual representation of a node from its execution logic. This ensures that any LLM (acting as the Orchestrator) can autonomously sequence, parameterize, and execute tools across the canvas without hardcoded, brittle wrappers.

### Vercel AI SDK

The core routing and streaming mechanics rely on the Vercel AI SDK. We utilized `streamUI` and `streamText` to build the unified Chat Shell. This allows us to yield React components (like the `CanvasAffordance`) dynamically within the chat stream, bridging the gap between natural language prompts and the materialized React Flow canvas.

### pgvector & Knowledge Retrieval

For custom agent contexts (Surface E: Atlas), we integrated `pgvector` alongside Drizzle ORM. Content ingested into the engine is chunked and embedded via Gemini, then stored in Postgres. The retrieval MCP blocks use cosine similarity searches to dynamically populate the LLM's context window, ensuring grounded, accurate synthesis.

## Surface Architecture Diagram

_(Conceptual representation)_

```text
[ Chat Shell (Vercel AI) ] <===> [ Canvas Runtime (React Flow) ]
                                        |
      +-----------------+---------------+---------------+-----------------+
      |                 |               |               |                 |
  Surface A         Surface B       Surface C       Surface D         Surface E
 (Playable)        (Conductor)       (Reel)          (Forge)           (Atlas)
Phaser/Matter.js  DAG Scheduler   FFmpeg/Media   WebContainers/Code  pgvector/RAG
```

## Student Roster

- **Student A:** Surface A (Playable) & Physics Sync
- **Student B:** Surface B (Conductor) & DAG Scheduling
- **Student C:** Surface C (Reel) & Rendering Pipeline
- **Student D:** Surface D (Forge) & WebContainer Sandbox
- **Student E:** Surface E (Atlas) & Vector Search

## Live Deployment

- **Production:** [https://iem-master.pages.dev](https://iem-master.pages.dev)
