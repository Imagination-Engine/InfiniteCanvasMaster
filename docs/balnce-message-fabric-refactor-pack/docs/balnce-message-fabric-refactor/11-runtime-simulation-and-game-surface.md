# 11 — Runtime Simulation and Game Surface

## Purpose

The canvas can host runtime surfaces such as games, simulations, dynamic mini-apps, or agentic execution worlds.

These are not normal document-state blocks while running.

## Runtime lane owns

- game loop events
- player input
- entity updates
- physics/collision events
- simulation ticks
- animation/control events
- live multiplayer updates

## Rule

Do not use Yjs document sync or SSE as the per-frame game runtime network.

Use:

- local runtime loop for single-player/local simulation
- WebSocket for bidirectional interactive runtime control
- WebTransport where advanced reliable/unreliable stream support is required
- ZeroMQ behind the device/edge/backend boundary for high-control process messaging

## Commit boundary

Runtime state should periodically or explicitly snapshot into document_state:

```txt
runtime_simulation live state
  ↓
checkpoint/snapshot/save
  ↓
document_state commit
  ↓
durable_event if important milestone
```

## Game block lifecycle

```txt
created
configured
loaded
running
paused
checkpointed
completed
failed
archived
```

## Acceptance criteria

- runtime events are lane-separated
- per-frame updates do not pollute document_state
- snapshots can persist meaningful state
- stop/pause controls use command_control
- important outcomes can emit durable/provenance events
