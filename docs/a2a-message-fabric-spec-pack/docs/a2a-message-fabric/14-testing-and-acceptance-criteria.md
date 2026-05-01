# 14 — Testing and Acceptance Criteria

Tests: protocol schema, envelope creation, topic helpers, EventEmitterTransport, publish/subscribe/unsubscribe, NDJSON encode/decode, compiler event emission, node input adapters, policy/trust handling, redaction, event log/replay, and canvas state mapping.

Phase 1 hardening is accepted when EventEmitter is a transport, internals use typed envelopes, NDJSON is boundary-only, envelope includes source/target/event/delivery/policy/provenance placeholders, topic helpers exist, compiler has injected fabric path, Node Input Adapter interface exists, legacy injection is isolated, replay log exists, and policy/trust fields exist.
