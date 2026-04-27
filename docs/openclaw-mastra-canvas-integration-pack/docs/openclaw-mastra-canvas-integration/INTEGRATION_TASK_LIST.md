# Integration Task List — OpenClaw + Mastra + Imagination Canvas

This task list tracks the implementation of the OpenClaw + Mastra integration through sequential slices.

## Slice 0: Discovery and Repo Scan [COMPLETED]

- [x] Scan frontend packages
- [x] Scan canvas package
- [x] Scan existing Mastra usage
- [x] Scan existing agent system
- [x] Scan existing model routing
- [x] Scan existing Edge Twin/device mesh code
- [x] Scan design system
- [x] Scan test framework
- [x] Scan security/provenance primitives
- [x] Create `REPO_INTEGRATION_MAP.md`
- [x] Create `IMPLEMENTATION_READING_SUMMARY.md`

## Slice 1: Contracts Only [COMPLETED]

- [x] Define `OpenClawBlock` and sub-interfaces in `@iem/imagination-canvas-kit`.
- [x] Define `OpenClawBlockEvent` and `OpenClawApprovalRequest`.
- [x] Define `OpenClawBlockAdapter` interface.
- [x] Export contracts from proper package.
- [x] Add type tests.

## Slice 2: Canvas Registration and Static Renderer [COMPLETED]

- [x] Add `openclaw.block` to `BalnceBlockKindSchema`.
- [x] Implement `OpenClawBlock` renderer (Compact View).
- [x] Register `OpenClawBlock` in `ObjectRenderer` registry.
- [x] Implement unconfigured/binding visual states.
- [x] Verify block appears on canvas.

## Slice 3: Inspector and Policy UI [COMPLETED]

- [x] Implement `OpenClawBlockInspector`.
- [x] Create Skills/Tools panel.
- [x] Create Security Policy panel.
- [x] Create Runtime Binding panel.
- [x] Create Approval Queue shell.
- [x] Expose cost/model route info.

## Slice 4: Adapter Interface and Test Adapter [COMPLETED]

- [x] Implement `OpenClawBlockAdapter` provider.
- [x] Create `TestOpenClawAdapter` with mock behaviors (test-only).
- [x] Create `NoRuntimeOpenClawAdapter` for degraded state.
- [x] Bind UI to adapter interface.

## Slice 5: Event Stream Plumbing [COMPLETED]

- [x] Implement event reducer for `OpenClawBlock`.
- [x] Create `TaskTimeline` component.
- [x] Implement event stream hook for real-time updates.
- [x] Add redaction utilities for sensitive event data.

## Slice 6: Task Lifecycle [COMPLETED]

- [x] Implement `startTask`, `pauseTask`, `resumeTask`, `stopTask` in adapter.
- [x] Add task status state machine transitions.
- [x] Implement Start/Stop/Pause controls in UI.
- [x] Verify lifecycle with test adapter.

## Slice 7: Approval and Policy Enforcement [COMPLETED]

- [x] Implement Approval Request store.
- [x] Create `ApprovalQueue` component with Approve/Deny actions.
- [x] Add policy evaluation helpers for sensitive actions.
- [x] Implement policy violation UI state.

## Slice 8: Mastra Binding [COMPLETED]

- [x] Create `OpenClawMastraTool` boundary.
- [x] Implement Block-to-Agent binding logic.
- [x] Implement Block-to-Workflow-Step binding logic.
- [x] Integrate Mastra human checkpoints with canvas approval queue.

## Slice 9: Model Routing and Compute Policy [COMPLETED]

- [x] Implement `ModelRoutePolicy` contract.
- [x] Add routing decision helper (Local vs Edge vs Cloud).
- [x] Update inspector to show compute route and latency/cost.
- [x] Implement approval for sensitive cloud routing.

## Slice 10: Real OpenClaw Runtime Binding [COMPLETED]

- [x] Implement `LocalOpenClawGatewayAdapter`.
- [x] Implement session/workspace binding.
- [x] Map real skills/tools from OpenClaw gateway.
- [x] Stream real events from gateway.

## Slice 11: Multiple Blocks on Canvas [COMPLETED]

- [x] Verify independent state management for multiple blocks.
- [x] Optimize event stream batching for performance.
- [x] Verify approval attribution for concurrent tasks.

## Slice 12: Group Orchestration [COMPLETED]

- [x] Implement `OpenClawAgentGroup` contract and UI.
- [x] Bind Mastra Supervisor to groups.
- [x] Implement subtask assignment and group timeline.
- [x] Verify group stop/pause behavior.

## Slice 13: Provenance, Outputs, and Canvas Conversion [COMPLETED]

- [x] Implement Output Panel.
- [x] Create conversion helpers (Output -> Artifact/Note/Workflow block).
- [x] Integrate with `plog-provenance` for verified action history.

## Slice 14: Security Hardening [COMPLETED]

- [x] Perform No-Stub Audit.
- [x] Audit dangerous permissions and skill risks.
- [x] Verify kill switch effectiveness.
- [x] Harden secret redaction.

## Slice 15: Production Integration [COMPLETED] [COMPLETED]

- [x] Align with Main App routing and design system.
- [x] Finalize observability hooks.
- [x] Complete build/typecheck/test pass.
