# Updated Gap List — OpenClaw + Mastra + Imagination Canvas

This document tracks implementation gaps, technical debt, and missing infrastructure during the OpenClaw + Mastra integration.

## 1. Runtime Infrastructure

- **Gap:** Real OpenClaw Local Gateway integration is not yet available in the main branch.
- **Severity:** Medium (Blocked Slice 10)
- **Mitigation:** Use `TestOpenClawAdapter` and `NoRuntimeOpenClawAdapter` to develop the UI and orchestration logic in isolation.

## 2. Orchestration Gaps

- **Gap:** Mastra Supervisor/Network support for dynamic block grouping is in early stages.
- **Severity:** Low (Blocked Slice 12)
- **Mitigation:** Implement manual subtask assignment first, then formalize the supervisor binding.

## 3. Compute Routing

- **Gap:** Edge Twin and Device Mesh routing logic is currently a document-only spec.
- **Severity:** Medium (Blocked Slice 9)
- **Mitigation:** Represent these as "Capability Gaps" in the UI; show them as unavailable routes until the underlying infrastructure is ready.

## 4. Security & Provenance

- **Gap:** PLOG/Provenance write-back to the block is partially implemented.
- **Severity:** Low (Blocked Slice 13)
- **Mitigation:** Log provenance events locally; implement real blockchain/immutable write-back in a future hardening phase.

## 5. UI/UX

- **Gap:** Expanded (Immersive) view for OpenClaw blocks is not yet designed.
- **Severity:** Low (Blocked Slice 3)
- **Mitigation:** Prioritize Compact and Inspect views; use a generic expanded shell for initial task streams.

## 6. Budget & AURA

- **Gap:** Real-time credit/budget tracking for OpenClaw tool usage is missing.
- **Severity:** Medium (Blocked Slice 9)
- **Mitigation:** Use estimated costs based on tool type and model route; allow setting "Simulated Budgets" in the policy panel.
