# 20 — Agent Checklist

Planning: read specs; create summary, task list, repo map, ADRs, gap list.

Protocol: protocol/version, runId/traceId, source/target, event metadata, instruction metadata, context, policy, provenance placeholders, delivery class.

Transport: interface, EventEmitterTransport, typed internal envelopes, NDJSON boundary-only.

Compiler: injected fabric path, lifecycle events, adapters, failure events.

Policy: origin/trust, policy engine, approval required, policy blocked, redaction.

Tests: protocol, topics, transport, encoder, compiler, adapters, policy, replay.

Hardening: no unapproved mocks/stubs/placeholders, no fake durable transport, no hidden universal instruction injection, gap list updated.
