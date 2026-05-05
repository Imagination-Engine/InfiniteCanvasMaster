# 10 — Command Control and Approval Flow

## Purpose

Command/control handles execution authority.

Examples:

- start workflow
- stop workflow
- pause agent
- resume agent
- retry node
- approve action
- deny action
- assign agent to block
- route task to Edge Twin
- escalate to cloud model

## Requirements

Command/control events require acknowledgement.

SSE is not command/control.

## Command envelope example

```ts
await fabric.command({
  type: "agent.task.stop",
  target: { type: "agent", id: agentId },
  reason: "user_requested",
  traceId,
});
```

## Approval flow

Approval requests should touch multiple lanes:

```txt
agent/tool requests action
  ↓
command_control: approval.required
  ↓
durable_event: approval request stored
  ↓
ui_projection: approval card shown
  ↓
user approves/denies through command endpoint
  ↓
command_control: approval.resolved
  ↓
durable_event: decision recorded
  ↓
provenance: record if sensitive/high-integrity
```

## Approval-required actions

Require explicit approval for:

- shell execution
- file writes outside allowed scope
- external network actions
- email/calendar sends
- purchases/offers/commerce
- wallet/identity actions
- memory writes of sensitive data
- running third-party skills
- escalating to high-cost cloud models
- exposing private data to remote models

## Acceptance criteria

- approval requests cannot be lost
- approval states are durable
- UI projection is read-only
- denial path is handled
- timeout path is handled
- command acknowledgement is returned
