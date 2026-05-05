# Balnce Message Fabric Refactor Pack

This package upgrades the existing local A2A Message Bus / EventEmitter bridge into the **Balnce Message Fabric**: a lane-aware, policy-aware, transport-abstracted event system for Mastra DAG execution, Imagination Canvas state, real-time agent streaming, command/control, runtime/game surfaces, durable workflow facts, and provenance.

This is a refactor pack, not a rewrite mandate. The current implementation should be preserved as a working in-process adapter while the architecture is promoted into a formal fabric.

## Core thesis

Balnce should not have seven unrelated realtime systems, and it should not force every message through one universal pipe. The correct system is:

> One Balnce Message Fabric. Multiple typed lanes. Plane-specific semantics. Transport adapters selected by delivery physics.

## Critical files

Start with:

- `docs/balnce-message-fabric-refactor/00-master-kickoff.md`
- `docs/balnce-message-fabric-refactor/18-master-implementation-prompt.md`
- `AGENTS_BALNCE_MESSAGE_FABRIC.md`

Then implement using:

- `16-implementation-slices-cadence.md`
- `20-contract-appendix.typescript.md`
- `templates/INTEGRATION_TASK_LIST_TEMPLATE.md`
- `templates/GAP_LIST_TEMPLATE.md`
- `templates/ARCHITECTURE_DECISIONS_TEMPLATE.md`

## Implementation target

The suggested target package path is:

```txt
packages/core/src/fabric/
```

The existing `packages/core/src/bus/MessageBus.ts` should become, or wrap, the new `InProcessTransport` rather than remaining the full system boundary.
