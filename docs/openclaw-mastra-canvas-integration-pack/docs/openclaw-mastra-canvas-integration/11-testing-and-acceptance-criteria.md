# 11 — Testing and Acceptance Criteria

## Required Test Categories

### Type Tests / Contract Tests

Test:

- OpenClawBlock type
- runtime binding
- policy types
- approval request types
- event types
- group types
- adapter interfaces

### Unit Tests

Test:

- state transitions
- event reducers
- policy evaluation helpers
- approval queue logic
- model routing decision logic
- output conversion helpers
- error handling
- redaction utilities

### Component Tests

Test:

- OpenClawBlockCompact
- OpenClawBlockInspector
- OpenClawBlockExpanded
- OpenClawRuntimeStatus
- OpenClawTaskTimeline
- OpenClawApprovalQueue
- OpenClawPolicyPanel
- OpenClawSkillPanel
- OpenClawGroupBlock

### Interaction Tests

Test:

- create OpenClaw Block
- bind runtime
- start task
- pause task
- resume task
- stop task
- approval request appears
- approve action
- deny action
- output created
- output converted to canvas object
- error state displayed
- revoke binding
- group blocks
- start group task
- stop group task

### Security Tests

Test:

- shell denied by default
- external send requires approval
- file write requires approval
- skill install denied or approval-gated
- sensitive data redacted in compact view
- cloud routing for sensitive memory requires approval
- policy violation state appears
- kill switch works

### Integration Tests

Test:

- canvas can render OpenClaw Block
- Mastra can invoke adapter boundary
- adapter can stream typed events
- events update canvas block state
- group orchestration path works with test adapter
- missing real runtime produces safe degraded state

### Performance Tests

Test:

- 1 OpenClaw Block running
- 20 OpenClaw Blocks idle
- 20 OpenClaw Blocks with event streams
- group timeline updates
- compact rendering does not re-render entire canvas unnecessarily
- event stream batching/throttling

## No-Stub Audit

Search for:

```txt
mock
stub
placeholder
dummy
fake
TODO
FIXME
demo
sample
simplified
for now
in production
not implemented
```

Every occurrence must be either removed, limited to a test-only/dev-only path, or documented in the gap list with severity and closure criteria.

## Definition of Done: Single OpenClaw Block

A single OpenClaw Block is done when:

- typed contract exists
- renderer exists
- compact state works
- inspector works
- expanded state works or is explicitly scheduled
- adapter interface exists
- runtime binding state exists
- task lifecycle exists
- event stream path exists
- approval path exists
- policy panel exists
- stop/pause/revoke controls exist
- output conversion path exists
- tests exist
- gaps are documented

## Definition of Done: Mastra Integration

Mastra integration is done when:

- Mastra can treat OpenClaw block as a tool, agent, workflow step, or supervised worker
- task invocation uses typed adapter
- workflow/human checkpoint path exists
- model route and policy are passed explicitly
- events return to canvas
- errors are structured
- no raw ungoverned runtime bypass exists

## Definition of Done: Group Orchestration

Group orchestration is done when:

- multiple blocks can be grouped
- group contract exists
- supervisor binding exists
- subtasks can be assigned
- group event timeline exists
- group policy exists
- group stop/pause exists
- outputs are attributable
- tests cover at least one group task path

## Definition of Done: Security

Security is done when:

- restrictive default policy exists
- dangerous tools are denied or approval-gated
- permissions are visible
- sensitive compact UI is redacted
- approval requests are specific
- stop/kill exists
- skill risk is represented
- sandbox mode is explicit
- cloud routing for sensitive data is approval-gated
- policy violations are visible
