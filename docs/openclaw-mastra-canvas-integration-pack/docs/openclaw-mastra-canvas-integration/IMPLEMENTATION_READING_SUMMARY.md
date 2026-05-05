# Implementation Reading Summary — OpenClaw + Mastra + Imagination Canvas

This document summarizes the foundational reading for the OpenClaw + Mastra + Imagination Canvas integration.

## 1. The Imagination Canvas Vision

The Imagination Canvas is a spatial operating surface for thought, intent, artifacts, memory, agents, goals, workflows, and applications. It is not just a note-taking tool; it is a command center where agentic cells (blocks) can be placed, grouped, and orchestrated.

## 2. The OpenClaw Block Vision

An OpenClaw Block is a live, managed, permissioned, and inspectable agent runtime cell. It represents a self-hosted assistant runtime, skill environment, and tool-using agent system. It is Balnce-native, meaning it integrates with Intent, Memory, PLOG/Provenance, AURA (budgets), and VLAD (identity).

## 3. Why Mastra is the Orchestration Substrate

Mastra provides the control plane for deciding how work moves between users, canvas, blocks, tools, models, and workflows. It handles task decomposition, agent supervision, model/tool invocation, and human-in-the-loop controls. It offers three patterns:

- **Agents:** For open-ended, exploratory work.
- **Workflows:** For explicit, multi-step, auditable work.
- **Supervisor/Network:** For coordinating multiple blocks.

## 4. The Target Architecture

The architecture is layered:

- **Canvas Shell:** Visual placement and user interaction.
- **OpenClaw Block Runtime Layer:** Typed contracts, adapters, and event streams.
- **Mastra Substrate:** Orchestration, memory, and observability.
- **Balnce Policy + Runtime Router:** Sandboxing, permissions, and model routing.
- **Execution Targets:** Local gateway, device mesh, Edge Twin, and cloud models.

## 5. The OpenClaw Block Contract

A dedicated `OpenClawBlock` type includes:

- **Runtime Binding:** IDs for session, workspace, and connection status.
- **Runtime State:** Status (thinking, running, etc.), current task, progress, and model route.
- **Capabilities:** List of available skills and tools.
- **Policy:** Sandbox mode, approval requirements, and tool/skill allow/deny lists.
- **UI State:** Display mode (compact, inspect, expanded) and panel visibility.

## 6. The OpenClaw Adapter Boundary

The UI and Mastra interact with OpenClaw through a stable `OpenClawBlockAdapter` interface. This prevents the UI from directly calling privileged host tools and ensures all actions pass through the policy engine and approval gates.

## 7. The Mastra Binding Strategy

Mastra binds to OpenClaw blocks as tools, specialist agents, or workflow steps. A `MastraOpenClawBinding` tracks these relationships, and an `OpenClawMastraTool` interface allows Mastra to invoke tasks on specific blocks.

## 8. The Security and Sandboxing Model

Default policy is **restrictive**. Approval is required for:

- Shell execution (high risk).
- Filesystem writes/deletes.
- External messaging/email/calendar.
- Browser automation with credentials/payments.
- Sensitive cloud model routing.
- Identity/Wallet/Provenance actions.
- Skill installation.

## 9. The Model Routing and Compute Policy

Tasks are routed across Local, Device Mesh, Edge Twin, and Cloud targets based on privacy, complexity, modality, and budget. Sensitive tasks default to local or approval-gated routes.

## 10. The Event/State Model

Every meaningful behavior maps to a typed event (e.g., `openclaw.task.started`, `openclaw.approval.required`). Events update block state and feed the task timeline, provenance hooks, and observability layers.

## 11. The Group Orchestration Model

Multiple blocks can be grouped into an `OpenClawAgentGroup`, orchestrated by a Mastra supervisor. The supervisor assigns subtasks, maintains group memory, and enforces group-level policies while respecting individual block boundaries.

## 12. The Implementation Slices

Implementation follows 16 slices, starting from Discovery and Contracts, moving through UI and Adapters, and ending with Group Orchestration, Provenance, and Production Integration.

## 13. The Testing and Acceptance Criteria

Verification covers Type, Unit, Component, Interaction, Security, Integration, and Performance tests. A "No-Stub Audit" ensures no unauthorized mocks remain in production paths.

## 14. The Biggest Risks

- **Security Escapement:** Unauthorized host access or silent cloud routing.
- **Complexity:** Managing state and events across many blocks and group orchestrators.
- **Performance:** Event stream storms or heavy rendering overhead.
- **User Experience:** "Twenty Chatbots" fatigue instead of a cohesive command center.

## 15. The No-Stub Rules

Final code must not contain `mock`, `stub`, `placeholder`, `TODO`, or `dummy` in production paths. Test-only mocks are allowed only in test files or explicit development adapters.
