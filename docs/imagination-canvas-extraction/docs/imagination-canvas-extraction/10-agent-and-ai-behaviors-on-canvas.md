# 10 — Agent and AI Behaviors on Canvas

## Purpose

This document defines how AI and agents interact with the Imagination Canvas. The AI should feel like a creative collaborator that can see, reason, generate, organize, and execute across spatial context without stealing control.

## Agent principles

1. AI is invited, scoped, and observable.
2. Agent work must be reversible or checkpointed.
3. Agent-generated content must have source/provenance.
4. The user must know what region or objects the AI is acting on.
5. Long-running work must not block canvas interaction.
6. Agent status should be human-readable, not system-noisy.
7. Local, device mesh, and Edge Twin execution should be abstracted but inspectable.

## Agent entry points

### 1. Global canvas AI

Command examples:

- “Organize this canvas.”
- “Summarize everything here.”
- “Find the open loops.”
- “Turn this into a launch plan.”
- “Create a presentation path.”
- “What should I do next?”

### 2. Selection-scoped AI

Appears when object(s) or region selected.

Actions:

- Summarize selection.
- Cluster selection.
- Convert to document.
- Convert to app plan.
- Generate next steps.
- Find contradictions.
- Create artifact.
- Assign to agent.
- Extract tasks.
- Generate visuals.
- Create pitch/story.

### 3. Block-level AI

Each Balnce block can have contextual actions.

Examples:

- Note → expand, rewrite, summarize.
- Artifact → improve, remix, export.
- Goal → decompose, schedule, track.
- Agent → configure, run, inspect.
- Offer → compare, negotiate, explain terms.
- Memory cluster → recall, connect, synthesize.

### 4. Background agents

Used for:

- Monitoring long-running goals.
- Watching research streams.
- Waiting for replies/offers.
- Updating data views.
- Maintaining memory clusters.
- Tracking workflow progress.

Rules:

- Background work must be visible but quiet.
- Agent changes require notification or checkpoint if they alter user-visible work.
- User can pause, inspect, or revoke background agents.

## AI canvas task contract

```ts
export interface AgentCanvasTask {
  id: string;
  canvasId: string;
  agentId: string;
  scope:
    | { type: "canvas" }
    | { type: "selection"; objectIds: string[] }
    | { type: "region"; bounds: Rect }
    | { type: "object"; objectId: string }
    | { type: "cluster"; clusterId: string };

  instruction: string;
  status:
    | "queued"
    | "planning"
    | "running"
    | "waiting-for-user"
    | "generating"
    | "applying"
    | "complete"
    | "failed"
    | "cancelled";

  executionScope: "local" | "device-mesh" | "edge-twin" | "external";
  proposedMutations?: CanvasMutation[];
  appliedMutations?: CanvasMutation[];
  provenance?: ProvenanceDescriptor;
  createdAt: string;
  updatedAt: string;
}
```

## Agent status language

Avoid system-heavy phrases unless in developer mode.

Use:

- “Looking across this canvas…”
- “Grouping related ideas…”
- “Creating a first draft…”
- “Checking your memory…”
- “Asking your device network…”
- “Bringing in more compute…”
- “Waiting for your approval…”
- “Ready to apply changes.”

Developer mode may reveal:

- Model.
- Tool.
- Execution scope.
- Tokens/latency.
- Source objects.
- Mutation diff.
- Raw events.

## Generation into canvas

When AI generates blocks:

1. Create visible generation region.
2. Show streaming placeholders.
3. Materialize blocks as content becomes available.
4. Preserve partial outputs if stopped.
5. Allow accept/discard/regenerate.
6. Save provenance.
7. Make entire generation undoable.

## AI mutation previews

For destructive or large changes:

- Show before/after preview.
- List intended mutations.
- Allow apply all, apply selected, or cancel.
- Preserve old layout as snapshot.
- Support one-click revert.

Examples requiring preview:

- Rearranging many objects.
- Merging clusters.
- Deleting/hiding objects.
- Changing permissions.
- Creating commerce/identity actions.
- Publishing/exporting.

## Agent blocks

An Agent Block represents a personal or task-specific agent living on the canvas.

Compact state:

- Name.
- Role.
- Current status.
- Scope.
- Last action.
- Quick action button.

Expanded state:

- Instructions.
- Tools.
- Memory permissions.
- Execution scope.
- Activity log.
- Tasks.
- Human checkpoints.
- Output artifacts.
- Safety/permission settings.

## Multi-agent canvas behavior

For complex workflows, multiple agent blocks may collaborate.

Example:

- Research Agent collects sources.
- Strategy Agent synthesizes.
- Design Agent creates visuals.
- Engineering Agent creates implementation plan.
- Commerce Agent prepares intentcasting offers.

Rules:

- Connections between agents represent workflow or communication routes.
- User can inspect agent-to-agent handoffs.
- Agent outputs should land as blocks, not disappear into logs.
- Human approval gates are visible.

## Edge Twin and device mesh visibility

Balnce-specific execution scopes:

- **Local**: runs on current device.
- **Device Mesh**: uses user's personal devices.
- **Edge Twin**: uses Cloudflare-backed compute or always-on presence.
- **External**: uses external services/tools.

User-facing language should be simple:

- “Working privately on this device.”
- “Using your trusted devices.”
- “Using extra compute.”
- “Connecting to an approved service.”

## Human checkpoints

Required for:

- Spending AURA or money.
- Sharing private data.
- Publishing.
- Identity/provenance actions.
- Deleting important blocks.
- Contacting brands/people.
- Long-running autonomous work.
- External tool execution with consequences.

## AI acceptance criteria

- Agent actions are scoped, visible, and reversible.
- AI can generate blocks into canvas without disrupting user work.
- Background agents are quiet but inspectable.
- Large transformations require preview.
- Balnce execution scopes are abstracted for normal users and inspectable for power users.
- Human checkpoints protect consequential actions.
