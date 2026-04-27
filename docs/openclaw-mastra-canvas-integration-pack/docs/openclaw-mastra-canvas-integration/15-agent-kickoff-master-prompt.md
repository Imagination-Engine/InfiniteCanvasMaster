# 15 — Agent Kickoff Master Prompt

Copy/paste this prompt into your agentic coding system.

---

You are operating inside the Balnce codebase.

Your mission is to implement the OpenClaw + Mastra + Imagination Canvas integration with production-grade depth.

## Critical Instruction

Do not implement from this prompt alone.

Before writing code, recursively read:

```txt
/docs/imagination-canvas-extraction/
/docs/openclaw-mastra-canvas-integration/
```

These folders are the source of truth.

The OpenClaw Block is a live, managed, permissioned, inspectable, stoppable, provenance-aware agent runtime cell inside the Balnce Imagination Canvas.

Mastra is the general agent substrate and orchestration/control plane.

The canvas is the spatial command surface.

Balnce policies govern sandboxing, permissions, memory, model routing, Edge Twin/device mesh/cloud routes, AURA budgets, human checkpoints, and provenance.

## You Must Create First

Before implementation, create:

```txt
/docs/openclaw-mastra-canvas-integration/IMPLEMENTATION_READING_SUMMARY.md
/docs/openclaw-mastra-canvas-integration/REPO_INTEGRATION_MAP.md
/docs/openclaw-mastra-canvas-integration/INTEGRATION_TASK_LIST.md
/docs/openclaw-mastra-canvas-integration/ARCHITECTURE_DECISIONS.md
/docs/openclaw-mastra-canvas-integration/UPDATED_GAP_LIST.md
```

Do not code until those exist.

## Required Reading Summary

`IMPLEMENTATION_READING_SUMMARY.md` must summarize:

1. The Imagination Canvas vision.
2. The OpenClaw Block vision.
3. Why Mastra is the orchestration substrate.
4. The target architecture.
5. The OpenClaw Block contract.
6. The OpenClaw adapter boundary.
7. The Mastra binding strategy.
8. The security and sandboxing model.
9. The model routing and compute policy.
10. The event/state model.
11. The group orchestration model.
12. The implementation slices.
13. The testing and acceptance criteria.
14. The biggest risks.
15. The no-stub rules.

## Required Repo Scan

`REPO_INTEGRATION_MAP.md` must identify:

- frontend framework
- canvas package or surface
- state management
- routing/app shell
- design system
- test framework
- existing agents
- existing Mastra usage
- existing OpenClaw usage
- existing model routing/local inference
- existing Edge Twin/device mesh code
- existing security/provenance primitives
- recommended integration path

## Implementation Slicing

Implement in slices. Do not attempt the whole system at once.

Use this order:

1. Discovery and repo scan
2. Contracts only
3. Canvas registration and static renderer
4. Inspector and policy UI
5. Adapter interface and test adapter
6. Event stream plumbing
7. Task lifecycle
8. Approval and policy enforcement
9. Mastra binding
10. Model routing and compute policy
11. Real OpenClaw runtime binding
12. Multiple blocks on canvas
13. Group orchestration
14. Provenance, outputs, and canvas conversion
15. Security hardening
16. Production integration

Each slice must update:

- `INTEGRATION_TASK_LIST.md`
- `UPDATED_GAP_LIST.md`
- `ARCHITECTURE_DECISIONS.md` if decisions are made
- tests

## No-Stub Rule

Do not commit final code containing:

- mock
- stub
- placeholder
- dummy
- fake
- TODO: real implementation
- FIXME
- demo-only production path
- “for now”
- “in production this would”
- hardcoded runtime status
- fake OpenClaw events
- fake Mastra orchestration
- fake security approval

Test-only mocks are allowed only in test files or explicit dev adapters that cannot be mistaken for production behavior.

## OpenClaw Block Must Not Be Generic

Do not represent OpenClaw as a generic card or generic app block.

It must have:

- dedicated type
- dedicated renderer
- compact state
- inspector state
- expanded state
- runtime binding
- adapter interface
- event stream
- task lifecycle
- policy
- approvals
- security panel
- model route display
- output conversion
- provenance hooks
- tests

## Security Defaults

Default policy must be restrictive.

Require approval for:

- shell execution
- file writes/deletes
- external messages
- calendar modification
- email sends
- browser credential flows
- purchases
- skill installation
- sensitive cloud routing
- identity/wallet/provenance actions

Every running block must be stoppable.

No block may run with unlimited host access by default.

## Mastra Role

Mastra should handle:

- agent invocation
- workflow orchestration
- human-in-the-loop checkpoints
- supervisor/group orchestration
- model routing
- memory/context
- observability

Use Mastra Agent for open-ended work.
Use Mastra Workflow for explicit, controlled, resumable, approval-gated work.
Use Mastra Supervisor/Network for multiple OpenClaw blocks.

## Runtime Adapter

The UI must call an OpenClaw Block Adapter, not raw OpenClaw internals.

Implement an adapter interface first.

Real runtime connection comes later.

## Definition of Done

The integration is not done unless:

1. OpenClaw Block contract exists.
2. OpenClaw Block renders on canvas.
3. OpenClaw Block inspector exists.
4. Runtime adapter exists.
5. Task lifecycle exists.
6. Event stream updates state.
7. Approval queue exists.
8. Policy enforcement exists.
9. Mastra binding exists.
10. Model routing policy exists.
11. Real OpenClaw runtime path exists or is explicitly documented as a gap.
12. Multiple blocks can exist independently.
13. Groups can be orchestrated.
14. Outputs convert to canvas blocks.
15. Sensitive data is redacted.
16. Kill switch exists.
17. Tests cover critical flows.
18. No unapproved mocks/stubs/placeholders remain.
19. Gaps are documented honestly.

Proceed slice by slice.
Do not rush.
Do not build a shallow demo.
Build the runtime foundation for an agentic spatial operating system.
