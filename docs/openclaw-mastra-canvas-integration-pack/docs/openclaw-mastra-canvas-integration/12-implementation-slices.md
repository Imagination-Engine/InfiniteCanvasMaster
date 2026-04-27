# 12 — Implementation Slices

## Rule

Do not implement the entire integration in one pass.

Each slice must produce a reviewable, testable increment. Each slice must update:

- `INTEGRATION_TASK_LIST.md`
- `ARCHITECTURE_DECISIONS.md`, if relevant
- `UPDATED_GAP_LIST.md`
- tests
- implementation notes

## Slice 0 — Discovery and Repo Scan

Goal: Understand the existing codebase before changing it.

Deliverables:

- `REPO_INTEGRATION_MAP.md`
- initial `INTEGRATION_TASK_LIST.md`
- initial `UPDATED_GAP_LIST.md`

Tasks:

- scan frontend packages
- scan canvas package
- scan existing Mastra usage
- scan existing agent system
- scan existing model routing
- scan existing Edge Twin/device mesh code
- scan design system
- scan test framework
- scan security/provenance primitives

Acceptance:

- no code changes required
- integration path proposed
- unknowns documented

## Slice 1 — Contracts Only

Goal: Introduce types without runtime behavior.

Implement:

- `OpenClawBlock`
- `OpenClawRuntimeBinding`
- `OpenClawBlockPolicy`
- `OpenClawBlockEvent`
- `OpenClawApprovalRequest`
- `OpenClawOutput`
- `OpenClawAgentGroup`
- `OpenClawBlockAdapter`

Acceptance:

- contracts compile
- exported from proper package
- tests/type checks exist
- no UI yet

## Slice 2 — Canvas Registration and Static Renderer

Goal: Register `openclaw.block` as a real canvas object type.

Implement:

- block registry entry
- `OpenClawBlockCompact`
- safe empty/unconfigured state
- selected/hover/error visual state

Acceptance:

- block appears on canvas
- no fake runtime
- unconfigured state is honest
- compact UI is safe

## Slice 3 — Inspector and Policy UI

Goal: Expose operational detail and policy boundaries.

Implement:

- `OpenClawBlockInspector`
- skills/tools panel
- security policy panel
- runtime binding panel
- approval queue shell
- cost/model route panel

Acceptance:

- inspector opens
- policies visible
- dangerous capabilities represented
- no raw secrets displayed

## Slice 4 — Adapter Interface and Test Adapter

Goal: Create runtime boundary.

Implement:

- adapter interface
- adapter provider/registry
- test-only development adapter
- safe no-runtime adapter

Acceptance:

- UI calls adapter interface only
- no raw OpenClaw internals in UI
- test adapter marked test/dev only
- no fake production runtime

## Slice 5 — Event Stream Plumbing

Goal: Connect typed events to block state.

Implement:

- event reducer
- event timeline
- event stream hook
- structured errors
- redaction utilities

Acceptance:

- events update block state
- timeline displays events
- sensitive payloads redacted
- tests cover event reducer

## Slice 6 — Task Lifecycle

Goal: Start, pause, resume, stop tasks through adapter.

Implement:

- `startTask`
- `pauseTask`
- `resumeTask`
- `stopTask`
- task status states
- controls in UI

Acceptance:

- task lifecycle works with test adapter
- stop always available while running
- error path visible
- no uncontrolled execution

## Slice 7 — Approval and Policy Enforcement

Goal: Human checkpoints become real.

Implement:

- approval request store
- approval queue
- approve/deny actions
- policy evaluation helper
- policy violation state

Acceptance:

- dangerous action creates approval request
- deny blocks action
- approve resumes/continues action
- policy violation visible
- tests cover approval flow

## Slice 8 — Mastra Binding

Goal: Allow Mastra to invoke and supervise OpenClaw Blocks.

Implement:

- OpenClaw as Mastra tool boundary
- block-to-agent binding
- block-to-workflow-step binding
- task invocation through Mastra
- human checkpoint integration

Acceptance:

- Mastra can call adapter boundary
- workflow can pause for approval
- events return to canvas
- missing real Mastra APIs documented

## Slice 9 — Model Routing and Compute Policy

Goal: Route tasks across local/device mesh/Edge Twin/cloud.

Implement:

- model route policy contract
- routing decision helper
- inspector display
- approval for sensitive cloud routing
- budget display

Acceptance:

- compute route visible
- route decisions explainable
- cloud sensitive approval works
- budget cap represented

## Slice 10 — Real OpenClaw Runtime Binding

Goal: Connect to real OpenClaw runtime where available.

Implement:

- local gateway adapter
- session binding
- list skills/tools
- start real task if safe
- stream real events if supported
- handle disconnected runtime

Acceptance:

- connects to local OpenClaw in controlled environment
- no host-level broad access by default
- errors degrade safely
- security controls remain active

## Slice 11 — Multiple Blocks on Canvas

Goal: Support many OpenClaw Blocks.

Implement:

- multiple runtime bindings
- independent states
- independent approvals
- event stream batching
- performance protections

Acceptance:

- 20 blocks can render
- independent state updates
- no re-render storm
- approvals remain attributable

## Slice 12 — Group Orchestration

Goal: Group blocks into Mastra-supervised task force.

Implement:

- `OpenClawAgentGroup`
- group UI
- group supervisor binding
- subtask assignment
- group timeline
- group stop/pause
- output attribution

Acceptance:

- group can be created
- group task can run through test path
- subtasks assigned
- group policy enforced
- outputs attributable

## Slice 13 — Provenance, Outputs, and Canvas Conversion

Goal: Outputs become Balnce-native artifacts.

Implement:

- output panel
- convert output to ArtifactBlock
- convert output to NoteBlock
- convert output to WorkflowBlock
- provenance hook
- source attribution

Acceptance:

- outputs are not trapped in logs
- output-to-canvas works
- provenance metadata attached
- sensitive output handled safely

## Slice 14 — Security Hardening

Goal: Audit and harden.

Implement:

- no-stub audit
- dangerous permission audit
- skill risk audit
- secret redaction audit
- external action approval audit
- kill switch test

Acceptance:

- security checklist passes
- no unapproved broad access
- gaps documented
- tests pass

## Slice 15 — Production Integration

Goal: Integrate with main product experience.

Implement:

- route/surface access
- design system alignment
- actual canvas package integration
- real app shell
- mobile/responsive state
- observability hooks

Acceptance:

- not a demo route only
- product integration works
- build/typecheck/tests pass
- implementation ready for human review
