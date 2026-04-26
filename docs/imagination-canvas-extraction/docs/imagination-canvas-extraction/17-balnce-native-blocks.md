# 17 — Balnce-Native Blocks

## Purpose

This document defines the Balnce-native block types that make the Imagination Canvas more than an infinite whiteboard. These blocks are the core primitives of the Balnce Personal AI OS.

Each block must support:

- Compact state.
- Selected state.
- Editing state.
- Inspect state.
- Expanded state.
- Activity state.
- Error state.
- Provenance/permission state where relevant.

## Shared Balnce block contract

```ts
export interface BalnceBlock extends BaseCanvasObject {
  balnce: {
    blockKind: BalnceBlockKind;
    intent?: string;
    ownerAgentId?: string;
    memoryScope?: MemoryScopeDescriptor;
    executionScope?: "local" | "device-mesh" | "edge-twin" | "external";
    identityScope?: "personal" | "family" | "business" | "brand" | "team";
    commerceScope?: CommerceScopeDescriptor;
    provenance?: ProvenanceDescriptor;
    status:
      | "idle"
      | "active"
      | "thinking"
      | "generating"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "error"
      | "paused";
  };
}
```

```ts
export type BalnceBlockKind =
  | "chat"
  | "agent"
  | "goal"
  | "artifact"
  | "memory-cluster"
  | "research-stream"
  | "intent"
  | "offer-commerce"
  | "identity-wallet"
  | "workflow"
  | "knowledge-pod"
  | "app"
  | "aura"
  | "plog-provenance"
  | "edge-twin"
  | "device-mesh";
```

---

## 1. Chat Block

### Definition

A Chat Block is a conversation workspace embedded in the canvas. It may represent a focused thread, a Q&A around a selected region, or a local conversation with a specific agent.

### Compact state

Shows:

- Thread title.
- Last message summary.
- Assigned agent/persona.
- Status.
- Number of artifacts created.

### Expanded state

Shows:

- Full conversation.
- Related canvas objects.
- Created artifacts.
- Memory permissions.
- Model/execution context if developer mode enabled.
- “Place response on canvas” action.

### Key actions

- Continue chat.
- Convert answer to blocks.
- Create artifact.
- Attach selected objects.
- Summarize thread.
- Fork thread.
- Save to memory.

### Acceptance criteria

- Chat output can become canvas blocks.
- Block remembers source conversation.
- Chat can be scoped to selected objects or region.
- Streaming messages do not disrupt canvas.

---

## 2. Agent Block

### Definition

An Agent Block represents an agent with role, tools, memory permissions, task queue, and execution status.

### Compact state

Shows:

- Agent name.
- Role.
- Current status.
- Scope.
- Last action.
- Human checkpoint badge if waiting.

### Expanded state

Shows:

- Instructions.
- Tools.
- Memory scope.
- Execution scope.
- Tasks.
- Activity log.
- Created artifacts.
- Permissions.
- Agent-to-agent connections.

### Key actions

- Run.
- Pause.
- Inspect.
- Assign selected region.
- Change tools.
- Change memory permissions.
- Create sub-agent.
- Export manifest.

### Acceptance criteria

- Agent can be assigned to object, selection, region, or goal.
- Agent status is human-readable.
- Consequential actions require checkpoints.
- Agent outputs appear as blocks.

---

## 3. Goal Block

### Definition

A Goal Block represents a user's desired outcome. It can decompose into milestones, tasks, agents, schedules, artifacts, and rewards.

### Compact state

Shows:

- Goal title.
- Progress.
- Next action.
- Deadline or cadence.
- Assigned agent(s).

### Expanded state

Shows:

- Goal overview.
- Milestones.
- Tasks/subtasks.
- Agent team.
- Calendar/check-ins.
- Related artifacts.
- Progress journal.
- Risks/blockers.
- Reward/AURA mechanics where appropriate.

### Key actions

- Decompose goal.
- Create tasks.
- Assign agents.
- Schedule check-in.
- Generate plan.
- Review progress.
- Convert to workflow.

### Acceptance criteria

- Goal can decompose into child blocks.
- Tasks can be completed, reassigned, or expanded.
- Agent can monitor progress.
- User can see current next step immediately.

---

## 4. Artifact Block

### Definition

An Artifact Block represents an output created by user or AI: document, image, code, deck section, diagram, app spec, video, audio, or design.

### Compact state

Shows:

- Artifact type.
- Title.
- Preview.
- Source.
- Version.
- Status.

### Expanded state

Shows:

- Full editor/preview.
- Version history.
- Export/share.
- Provenance.
- Related prompt/chat/source.
- Improvement actions.
- Rights/revocation if shared.

### Key actions

- Open editor.
- Improve.
- Remix.
- Export.
- Share.
- Attach to goal/app.
- Save to memory.
- Generate variant.

### Acceptance criteria

- Artifact source is traceable.
- Artifact can be edited and versioned.
- Artifact can expand into full editor.
- Artifact can be linked back to prompt/chat/source objects.

---

## 5. Memory Cluster Block

### Definition

A Memory Cluster Block represents a set of related memories, documents, events, artifacts, or user context.

### Compact state

Shows:

- Cluster title.
- Memory count.
- Time range.
- Confidence/relevance.
- Privacy scope.

### Expanded state

Shows:

- Memory timeline.
- Source objects.
- Semantic graph.
- Search within cluster.
- Summaries.
- Contradictions.
- Permissions.
- Revocation/export options.

### Key actions

- Recall.
- Summarize.
- Link to current project.
- Create knowledge pod.
- Revoke sharing.
- Add/remove memory.
- Ask agent about cluster.

### Acceptance criteria

- Does not expose sensitive memory without permission.
- Shows source lineage.
- Can be used by AI only within allowed scope.
- Can be linked to goals, agents, and artifacts.

---

## 6. Research Stream Block

### Definition

A Research Stream Block is a living feed or research workspace around a topic, question, project, or intent.

### Compact state

Shows:

- Topic.
- Latest items.
- Update status.
- Source count.
- Confidence/quality indicator.

### Expanded state

Shows:

- Curated feed.
- Search history.
- Sources.
- Notes.
- Evidence map.
- Agent summaries.
- Contradictions/open questions.
- Export to memo/presentation.

### Key actions

- Refresh.
- Deep research.
- Cluster sources.
- Create evidence map.
- Summarize.
- Turn into report.
- Watch topic.

### Acceptance criteria

- Sources are visible.
- Updates are controlled, not noisy.
- Research can become artifacts, notes, or memory.
- Agent can monitor only with user approval.

---

## 7. Intent Block

### Definition

An Intent Block captures something the user wants: buy, learn, build, travel, negotiate, create, compare, solve, schedule, or explore.

### Compact state

Shows:

- Intent statement.
- Category.
- Status.
- Matching agents/offers.
- Privacy scope.

### Expanded state

Shows:

- Intent details.
- Constraints.
- Preferences.
- Negotiation settings.
- Allowed recipients.
- Responses/offers.
- Human checkpoints.
- Outcome history.

### Key actions

- Broadcast intent.
- Refine criteria.
- Create offers request.
- Assign agent.
- Compare responses.
- Convert to goal/workflow.
- Cancel/revoke.

### Acceptance criteria

- User controls where intent goes.
- Broadcasts require explicit permission.
- Responses appear as offer/commerce blocks.
- Intent can become goal, workflow, or purchase path.

---

## 8. Offer / Commerce Block

### Definition

An Offer Block represents a commercial response, proposal, reward, coupon, quote, contract, or brand interaction.

### Compact state

Shows:

- Offer title.
- Brand/person.
- Value.
- Expiration.
- Status.
- Trust/provenance indicator.

### Expanded state

Shows:

- Terms.
- Comparison.
- Negotiation thread.
- Required data exchange.
- AURA/cost/reward.
- Acceptance flow.
- Revocation and privacy terms.
- Agent recommendation.

### Key actions

- Compare.
- Negotiate.
- Accept.
- Reject.
- Ask agent to explain.
- Save.
- Share.
- Revoke data permission.

### Acceptance criteria

- No spending or data sharing without checkpoint.
- Terms are human-readable.
- Provenance/trust source visible.
- Accepted offers create auditable record.

---

## 9. Identity / Wallet Block

### Definition

An Identity / Wallet Block represents identity credentials, proofs, AURA, assets, passes, permissions, provenance keys, and network-level rights.

### Compact state

Shows:

- Identity/wallet label.
- Verification status.
- AURA balance or hidden balance.
- Active proofs.
- Security status.

### Expanded state

Shows:

- Credentials.
- Proofs.
- AURA activity.
- Permissions.
- PLOGs.
- Connected agents.
- Recovery/security.
- Revocation controls.

### Key actions

- View credentials.
- Verify.
- Manage permissions.
- Review activity.
- Revoke access.
- Sign/share proof.
- Manage AURA.

### Acceptance criteria

- Sensitive values hidden by default.
- Consequential actions require authentication/checkpoint.
- Identity actions are auditable.
- Permissions and revocations are clear.

---

## 10. Workflow Block

### Definition

A Workflow Block represents a process with nodes, steps, conditions, tools, agents, and outcomes.

### Compact state

Shows:

- Workflow title.
- Current step.
- Status.
- Agent owner.
- Blockers.

### Expanded state

Shows:

- Visual workflow graph.
- Step details.
- Inputs/outputs.
- Tool calls.
- Human checkpoints.
- Logs.
- Retry/failure handling.

### Key actions

- Run.
- Pause.
- Edit steps.
- Add agent.
- Add checkpoint.
- View logs.
- Convert to template.

### Acceptance criteria

- Workflows are inspectable.
- Human checkpoints are visible.
- Failed steps can retry or branch.
- Outputs land as blocks/artifacts.

---

## 11. Knowledge Pod Block

### Definition

A Knowledge Pod Block packages reusable knowledge: a domain, skill, project context, tutorial, expert model context, or agent-ingestible knowledge graph.

### Compact state

Shows:

- Pod name.
- Domain.
- Source count.
- Version.
- Permission scope.

### Expanded state

Shows:

- Knowledge graph.
- Source documents.
- Prompts/instructions.
- Applicable agents.
- Update history.
- Share/export policy.

### Key actions

- Attach to agent.
- Update.
- Summarize.
- Export manifest.
- Share.
- Revoke.

### Acceptance criteria

- Knowledge sources are traceable.
- Agent usage is permissioned.
- Versions are clear.
- Pod can be reused across canvases.

---

## 12. App Block

### Definition

An App Block is a live mini-application generated, configured, or hosted on the canvas.

### Compact state

Shows:

- App name.
- App type.
- Preview.
- Runtime status.
- Data source badges.

### Expanded state

Shows:

- Full app UI.
- Builder/editor.
- State/data bindings.
- Deployment/export options.
- Agent controls.
- Logs/errors.
- Permissions.

### Key actions

- Open.
- Edit.
- Preview.
- Generate feature.
- Connect data.
- Export/deploy.
- Convert to template.

### Acceptance criteria

- App Block has real runtime state.
- It can expand without losing canvas context.
- Data bindings are explicit.
- No fake app previews in production paths.

---

## 13. AURA Block

### Definition

An AURA Block represents network credits, rewards, earned value, compute spend, task incentives, or marketplace flows.

### Compact state

Shows:

- Amount.
- Source/reason.
- Status.
- Linked action.

### Expanded state

Shows:

- Transaction details.
- Earn/spend reason.
- Related agent/action.
- Rules.
- History.
- Export/audit.

### Key actions

- View.
- Claim.
- Spend.
- Attach reward to goal.
- Review history.

### Acceptance criteria

- User understands why AURA was earned/spent.
- Spending requires checkpoint.
- Transaction record is auditable.

---

## 14. PLOG / Provenance Block

### Definition

A PLOG Block shows provenance, source lineage, signatures, usage rights, revocation, and trust history for an object or artifact.

### Compact state

Shows:

- Verified/unverified status.
- Source type.
- Last verified.
- Rights badge.

### Expanded state

Shows:

- Event history.
- Signatures.
- Source lineage.
- Revocation state.
- Sharing rights.
- Usage trail.
- Related identities/agents.

### Key actions

- Verify.
- Revoke.
- Export proof.
- Inspect lineage.
- Attach to artifact.

### Acceptance criteria

- Provenance is understandable to normal users.
- Developer/audit details available when needed.
- Revocation is clear and consequential.

---

## 15. Edge Twin Block

### Definition

An Edge Twin Block represents a user's cloud/edge extension: always-on agent, extra compute, long-running process, or bootstrap node.

### Compact state

Shows:

- Edge Twin status.
- Tier/capability.
- Current work.
- Compute usage.
- Privacy boundary.

### Expanded state

Shows:

- Active jobs.
- Available capabilities.
- Model access.
- Compute limits.
- Data permissions.
- Logs.
- Cost/AURA usage.
- Stop/pause controls.

### Key actions

- Start job.
- Pause job.
- Inspect.
- Change capability.
- Approve data access.
- Stop always-on behavior.

### Acceptance criteria

- Extra compute is transparent.
- User understands privacy boundary.
- Cost/credit usage is visible.
- Long-running tasks are controllable.

---

## 16. Device Mesh Block

### Definition

A Device Mesh Block represents the user's local personal network of devices, models, storage, and inference capacity.

### Compact state

Shows:

- Connected devices.
- Mesh status.
- Available compute.
- Current pooled tasks.

### Expanded state

Shows:

- Device list.
- Capabilities.
- Local models.
- Sync status.
- Inference pooling.
- Privacy/security status.
- Offline availability.

### Key actions

- View devices.
- Add device.
- Pool inference.
- Assign task.
- Diagnose.
- Disconnect.

### Acceptance criteria

- Device state is understandable.
- Private/local execution is clear.
- User can control participation.
- Mesh failures degrade gracefully.

---

## Balnce block acceptance criteria

The Balnce block system is accepted only when:

- At least Chat, Agent, Goal, Artifact, Memory Cluster, Intent, Offer, App, Edge Twin, and Device Mesh blocks have real specs and UI states.
- Every block can exist as compact canvas object and expanded surface.
- Every consequential block has permission and provenance rules.
- Agent-created blocks include source metadata.
- Blocks can connect semantically and visually.
- Blocks can become part of workflows, goals, memory, and app-building flows.
