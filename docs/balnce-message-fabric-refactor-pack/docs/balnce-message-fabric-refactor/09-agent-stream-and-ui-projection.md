# 09 — Agent Stream and UI Projection

## Purpose

The agent-stream lane carries live agent activity without committing every intermediate thought/delta to canonical canvas state.

## Examples

- token delta
- block generation started
- block generation delta
- tool started
- tool progress
- agent status update
- model route chosen
- Edge Twin delegation status
- OpenClaw block task progress

## Projection model

The fabric may project selected agent-stream events to the UI via SSE or WebSocket.

Recommended UI shape:

```txt
GET /fabric/stream?canvasId=<id>&lanes=agent_stream,workflow_trace,ui_projection
```

Single stream, multiplexed events.

Do not open one SSE connection per block.

## Event shape example

```json
{
  "lane": "agent_stream",
  "event": { "type": "block.generation.delta" },
  "target": { "type": "block", "id": "block_123" },
  "payload": { "delta": "Next piece of text..." }
}
```

## UI rules

- UI may render live deltas.
- UI must not treat a delta as durable truth.
- UI should reconcile final completion events into block state.
- UI should show running, paused, waiting-for-approval, failed, completed states.
- UI must support stop/pause/approve actions through command_control, not SSE.
