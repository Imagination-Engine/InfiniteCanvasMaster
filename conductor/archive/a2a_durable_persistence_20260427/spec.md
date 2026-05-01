# A2A Durable Persistence & Replay Specification

## Overview

This track implements the persistent layer of the Balnce A2A Message Fabric. It transitions the `InMemoryEventLog` to a durable storage mechanism (Postgres via Drizzle) and implements the `approval_required` delivery semantics.

## Objectives

1.  **Durable Event Log:** Implement `PostgresEventLog` using `@iem/db` to permanently store envelopes marked as `replayable` or `durable`.
2.  **Approval Queues:** Implement the logic to pause DAG execution and queue envelopes with `approval_required` class until an explicit `approval.granted` event is received.
3.  **Durable Transport (Optional/Prep):** Scaffold the architecture for cross-instance messaging (e.g., Redis PubSub or Postgres LISTEN/NOTIFY).

## Architecture

- **Database:** New schema tables in `@iem/db` for `a2a_event_logs` and `a2a_approvals`.
- **Interfaces:** Implementation of the `A2AEventLog` interface using Drizzle ORM.
- **Semantics:** Ensure ephemeral messages are skipped by the logger, reducing DB load.
