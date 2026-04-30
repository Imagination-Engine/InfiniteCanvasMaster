# 09 — Canvas UI and Block States

## Core UX Principle

The OpenClaw Block must feel like a living work cell, not a noisy log panel.

The compact block should be calm and understandable.
The inspector should be operational.
The expanded view should be powerful.
The debug trace should exist, but not dominate the normal user experience.

## Compact State

Compact state is the default canvas presentation.

Must show:

- block title
- status badge
- runtime connection indicator
- current task summary
- compact progress, if active
- waiting-for-approval indicator
- error badge, if failed
- safe capability icons

Must not show:

- secrets
- raw logs
- raw tool payloads
- private file paths unless safe
- credentials
- full messages to external recipients before approval

Example copy:

```txt
Research Operator
Scanning sources…
Local + cloud with approval
```

```txt
Outreach Operator
Waiting for your approval
3 drafts ready
```

```txt
Device Mesh Operator
Using your MacBook + iPad
42% complete
```

## Inspect State

The inspector is the operational detail view.

Must show overview, skills and tools, policy, activity, actions, and output panels.

### Overview

- title
- role
- runtime
- current task
- status
- progress
- connection health

### Skills and Tools

- enabled skills
- disabled skills
- allowed tools
- denied tools
- risk levels
- approval requirements

### Policy

- sandbox mode
- memory scope
- filesystem boundaries
- shell policy
- messaging policy
- model/cloud policy
- budget

### Activity

- event timeline
- tool calls
- approvals
- outputs
- errors

### Actions

- start task
- pause
- resume
- stop
- revoke
- approve
- deny
- expand
- convert output to canvas object

## Expanded State

Expanded state is the rich workspace.

Must support:

- task transcript
- event timeline
- output artifacts
- live generated content
- approval queue
- security/policy panel
- cost/model route panel
- debug trace toggle
- conversion controls

## Loading State

Loading must be specific.

Bad:

```txt
Loading...
```

Better:

```txt
Connecting to local OpenClaw Gateway…
Binding workspace…
Checking enabled skills…
Starting task…
Waiting for your approval…
```

## Error State

Error state must show:

- human-readable problem
- recoverability
- retry option
- stop option
- inspect logs option
- link to gap if integration missing
- no scary raw stack trace in compact state

## Permission-Required State

Must show:

- what the block wants to do
- why it wants to do it
- risk level
- what data/tool/action is involved
- approve
- deny
- inspect details

## Required Components

```txt
OpenClawBlock
OpenClawBlockCompact
OpenClawBlockInspector
OpenClawBlockExpanded
OpenClawRuntimeStatus
OpenClawTaskTimeline
OpenClawApprovalQueue
OpenClawSkillPanel
OpenClawToolPanel
OpenClawPolicyPanel
OpenClawOutputPanel
OpenClawSecurityPanel
OpenClawCostPanel
OpenClawDebugTrace
```

## Acceptance Criteria

- Compact state is useful but safe.
- Inspect state exposes operational control.
- Expanded state supports real work.
- Approval state is clear.
- Error state is actionable.
- Sensitive data is redacted.
- Running blocks are stoppable.
- UI maps to real state/events.
