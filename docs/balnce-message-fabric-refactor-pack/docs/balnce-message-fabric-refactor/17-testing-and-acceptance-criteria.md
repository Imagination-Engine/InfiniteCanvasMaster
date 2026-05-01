# 17 — Testing and Acceptance Criteria

## Unit tests

Required:

- envelope creation
- envelope validation
- lane validation
- delivery validation
- topic helper output
- route selection
- transport subscription
- legacy envelope upgrade
- NDJSON encode/decode at boundary
- node input adapter trust behavior

## Integration tests

Required:

- Mastra DAG node output emits workflow_trace and/or agent_stream
- downstream input adapter receives envelope batch
- SSE projection receives selected events only
- command/control path is not sent through SSE
- approval-required event is durable-classed
- agent_stream token delta does not commit document_state

## Canvas behavior tests

Required when canvas integration exists:

- multiple blocks receive distinct stream events over one multiplexed stream
- final agent output commits as document_state only after completion/acceptance
- collaboration/presence events are not durable document facts
- runtime/game events do not pollute document state

## Security tests

Required:

- untrusted instruction cannot become privileged instruction
- retrieved content cannot override system/user intent
- sensitive payload redaction works for UI projection
- approval-required actions cannot bypass approval state

## Acceptance criteria

The refactor is acceptable only when:

- current behavior remains intact or intentionally migrated
- EventEmitter bus is reframed as InProcessTransport
- envelopes include lanes and delivery class
- topic strings are generated through helpers
- Mastra DAG integration publishes lane-aware events
- universal arbitrary input mutation is replaced by node input adapters
- SSE is projection-only
- document_state is separate from agent_stream
- command_control is bidirectional/acknowledged, not SSE-only
- durable/provenance boundaries exist
- tests prove lane separation
- gap list honestly captures missing backend transports
