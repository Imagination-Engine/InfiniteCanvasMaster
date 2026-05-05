# 02 — Studio Runtime Architecture

## Thesis

Each studio has a manifest, but the canvas can mix any block from any studio. A studio is not a separate app. A studio is a capability domain: block types, model aliases, tool mounts, artifact contracts, runtime adapters, permissions, and UI surfaces.

## Core Architecture

```txt
Imagination Canvas
  ├── Block Library
  ├── Block Registry
  ├── Studio Manifest Registry
  ├── Capability Registry
  ├── Tool Mount Registry
  ├── Artifact Registry
  ├── Model Policy Router
  ├── Runtime Adapter Registry
  ├── Message Fabric
  ├── Mastra Orchestration
  └── Canvas Orchestrator Agent
```

## The Rule

Studios define capabilities. Blocks consume capabilities. The canvas composes capabilities.

## Runtime Readiness

Every studio/block runtime reports one of:

- `live`
- `demo`
- `adapter_ready`
- `not_connected`
- `blocked_by_policy`

## Message Fabric Lanes

Use:

- `document_state` for final canonical block/canvas state.
- `ui_projection` for live UI state.
- `agent_stream` for agent/tool deltas.
- `command_control` for start/stop/approve/run/spawn.
- `workflow_trace` for DAG/workflow history.
- `durable_event` for artifacts/completions/approvals.
- `provenance` for future origin trail/static demo now.
- `runtime_simulation` for games/simulations/live app surfaces.

## Non-Negotiable

Do not create direct ad hoc integrations in block components. Every tool/runtime must mount through a manifest and adapter boundary.
