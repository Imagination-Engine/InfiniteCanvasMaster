# A2A Durable Persistence & Replay Implementation Plan

## Phase 1: Schema Updates

- **Task:** Define `a2a_event_logs` table schema in `@iem/db/src/schema.ts` (id, traceId, runId, topic, type, payload_json, timestamp).
- **Task:** Define `a2a_approvals` table for pending actions.
- **Task:** Generate and run Drizzle migrations.
- **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Postgres Event Log

- **Task:** Implement `PostgresEventLog` conforming to the `A2AEventLog` interface.
- **Task:** Ensure the `append` method only writes envelopes with `durable` or `replayable` classes.
- **Task:** Write unit/integration tests (TDD).
- **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Approval Semantics

- **Task:** Update `CoreMessageFabric` to intercept `approval_required` envelopes.
- **Task:** Emit `approval.required` events to the appropriate UI topics and pause standard delivery.
- **Task:** Implement resume logic upon receiving `approval.granted`.
- **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
