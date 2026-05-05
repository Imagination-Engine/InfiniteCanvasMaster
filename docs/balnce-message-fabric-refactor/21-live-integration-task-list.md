# Balnce Message Fabric: Live Integration Task List

## Slice 0 — Preserve and Test Current Behavior

- [x] **Task T01:** Ensure unit tests for `InProcessTransport` and current A2A logic pass.
  - Files: `packages/core/src/bus/fabric.test.ts`, `packages/core/src/bus/protocol.test.ts`
  - Acceptance: 100% green baseline.

## Slice 1 — Introduce Fabric Lanes and Envelope v2

- [x] **Task T02:** Finalize `v0.2.0` schema in `packages/core/src/fabric/envelope.ts`.
  - Goal: Enforce `lane` and `delivery` fields.
  - Tests: `packages/core/src/fabric/tests/envelope.test.ts`

## Slice 2 — Wrap Current MessageBus as InProcessTransport

- [x] **Task T03:** Promote legacy bus to `InProcessTransport`.
  - Files: `packages/core/src/fabric/transports/InProcessTransport.ts`
  - Adapter: `InProcessTransport`
  - Tests: Verify `messageBus` backward compatibility.

## Slice 3 — Add FabricRouter

- [x] **Task T04:** Implement lane-aware routing in `packages/core/src/fabric/router.ts`.
  - Goal: Reject invalid lane/delivery combinations.
  - Tests: `packages/core/src/fabric/tests/router.test.ts`

## Slice 4 — Add Topic Grammar and Routing Helpers

- [x] **Task T05:** Standardize all topics in `packages/core/src/fabric/topics.ts`.
  - Goal: Eliminate hand-built strings in `compiler.ts` and `a2a.ts`.

## Slice 5 — Add MastraDagFabricAdapter

- [x] **Task T06:** Refactor compiler to use the dedicated Mastra adapter.
  - Files: `packages/agents/src/workflows/compiler.ts`
  - Goal: Separate `agent_stream` (partial deltas) from `workflow_trace` (status events).

## Slice 6 — Add SSEProjectionTransport

- [x] **Task T07:** Refactor SSE endpoint to use projection-only transport.
  - Files: `apps/server/src/routes/a2a.ts`
  - Goal: Enforce read-only boundary for UI streaming.

## Slice 7 — Add Node Input Adapters

- [x] **Task T08:** Replace universal mutation with explicit `NodeInputAdapter` registry.
  - Goal: Policy-gated instruction promotion.

## Slice 8 — Wire Canvas Subscriptions

- [ ] **Task T09:** Update React hooks to filter by lane.
  - Files: `apps/web/src/hooks/useA2A.ts`
  - Goal: Canvas only receives `ui_projection` and `agent_stream`.

## Slice 9 — Wire Durable/Provenance Candidates

- [x] **Task T10:** Promote approval gating and event logging to the fabric level.
  - Goal: `approval_required` delivery class triggers persistent queueing.

## Slice 10 — Remove Unsafe Direct Schema Mutation

- [x] **Task T11:** Audit and refactor any `(node as any)` or `(input as any)` hacks.

## Slice 11 — Add Tests and Hardening

- [ ] **Task T12:** Final E2E verify with Playwright.
