# A2A Durable Persistence & Replay Implementation Plan

## Phase 1: Schema Updates

- [x] **Task:** Define a2a_event_logs table schema in @iem/db/src/schema.ts (id, traceId, runId, topic, type, payload_json, timestamp).
- [x] **Task:** Define a2a_approvals table for pending actions.
- [x] **Task:** Generate and run Drizzle migrations.
- [x] **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Postgres Event Log

- [x] **Task:** Implement PostgresEventLog conforming to the A2AEventLog interface.
- [x] **Task:** Ensure the append method only writes envelopes with durable or replayable classes.
- [x] **Task:** Write unit/integration tests (TDD).
- [x] **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Approval Semantics

- [x] **Task:** Update CoreMessageFabric to intercept approval_required envelopes.
- [x] **Task:** Emit approval.required events to the appropriate UI topics and pause standard delivery.
- [x] **Task:** Implement resume logic upon receiving approval.granted.
- [x] **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
