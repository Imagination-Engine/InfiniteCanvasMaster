# 12 — Durable Events and Provenance

## Durable events

Durable events are facts that must not vanish.

Examples:

- artifact created
- memory written
- approval required
- approval resolved
- workflow completed
- workflow failed
- offer accepted
- wallet action requested
- external message sent
- OpenClaw skill executed with sensitive permissions

## Durable event requirements

- persisted
- replayable
- idempotent where possible
- includes trace/causation
- includes actor/source
- includes policy state
- supports redaction for sensitive data

## Provenance events

Provenance events bind important outputs/actions to verifiable history.

Examples:

- content hash generated
- PLOG record created
- artifact source chain bound
- identity/VLAD-bound action recorded
- output signed

## Redaction

Sensitive values must be separated from metadata.

The durable/provenance layer should store safe summaries and content hashes where appropriate, not raw secrets.

## Acceptance criteria

- critical events are not EventEmitter-only
- critical events are not SSE-only
- important actions include trace and causation IDs
- sensitive actions have policy/provenance hooks
- replay/debug can reconstruct workflow facts
