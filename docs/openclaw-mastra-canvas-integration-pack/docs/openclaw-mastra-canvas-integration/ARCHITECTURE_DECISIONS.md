# Architecture Decisions — OpenClaw + Mastra + Imagination Canvas

This document records the architectural decisions made during the OpenClaw + Mastra integration.

## AD 01: Adapter Boundary for Runtime Isolation

- **Status:** Approved
- **Context:** The canvas UI needs to interact with OpenClaw runtimes (local, edge, cloud) without direct dependency on privileged host tools or unstable internal APIs.
- **Decision:** Introduce a formal `OpenClawBlockAdapter` interface. All UI interactions and Mastra tool calls must use this adapter.
- **Consequence:** Provides a clean boundary for security policy enforcement, event streaming, and multi-runtime support (local gateway vs Edge Twin).

## AD 02: Restrictive Security Defaults

- **Status:** Approved
- **Context:** Agent blocks with tool access (shell, files, browser) present significant security risks.
- **Decision:** All OpenClaw blocks default to a "Strict" sandbox mode with mandatory human approval for any sensitive external or host-modifying action.
- **Consequence:** Ensures user trust and prevents accidental or malicious escapement from the agent runtime.

## AD 03: Mastra as the Orchestration Substrate

- **Status:** Approved
- **Context:** We need a way to coordinate single-block tasks, complex multi-step workflows, and multi-agent groups.
- **Decision:** Utilize Mastra's Agent, Workflow, and Supervisor primitives as the primary orchestration engine. The OpenClaw Block is treated as a specialized worker/tool within the Mastra ecosystem.
- **Consequence:** Leverages Mastra's built-in observability, memory management, and human-in-the-loop capabilities.

## AD 04: Typed Event Stream for Canvas Updates

- **Status:** Approved
- **Context:** The spatial canvas needs to stay in sync with asynchronous agent activity.
- **Decision:** Define a comprehensive set of `OpenClawBlockEvent` types. The block state on the canvas is updated via an event reducer that processes these events.
- **Consequence:** Enables rich UI feedback (progress, thinking states, tool usage) and provides a reliable task timeline for the inspector.

## AD 05: Shared Group Policy for Orchestration

- **Status:** Approved
- **Context:** Multiple blocks working together need a common set of constraints.
- **Decision:** `OpenClawAgentGroup` will maintain a `sharedPolicy` that member blocks must respect. Individual block policies remain the authoritative boundary and cannot be loosened by the group.
- **Consequence:** Provides a safe way to scale agentic collaboration without silently compromising security.
