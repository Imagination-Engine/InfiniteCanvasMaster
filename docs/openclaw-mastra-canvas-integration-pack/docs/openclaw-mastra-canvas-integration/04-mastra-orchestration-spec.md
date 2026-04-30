# 04 — Mastra Orchestration Spec

## Role of Mastra

Mastra is the general agent substrate and orchestration layer. It is responsible for deciding how work moves between the user, the canvas, OpenClaw blocks, tools, models, workflows, and human checkpoints.

Mastra is not merely a model wrapper. Mastra is the control plane.

## When to Use a Mastra Agent

Use a Mastra Agent when the task is:

- open-ended
- exploratory
- conversational
- uncertain in sequence
- dependent on tool choice
- dependent on model reasoning
- likely to require iterative refinement

Examples:

- “Research this market and tell me what matters.”
- “Look at this cluster and propose next steps.”
- “Figure out which OpenClaw block should handle this.”

## When to Use a Mastra Workflow

Use a Mastra Workflow when the task is:

- explicit
- multi-step
- auditable
- approval-gated
- repeatable
- resumable
- branching
- parallelizable
- sensitive enough to require deterministic checkpoints

Examples:

- “Run launch workflow: research → site draft → outreach → schedule.”
- “Use these five OpenClaw blocks to perform a compliance-reviewed campaign.”
- “Process these files, summarize, create artifacts, and ask before sending anything.”

## When to Use a Mastra Supervisor / Network

Use a supervisor or network when the task requires:

- routing between multiple blocks
- selecting the correct specialist
- coordinating parallel agents
- merging results
- resolving conflicts
- monitoring group progress
- maintaining shared group memory
- enforcing group policy

## Canvas to Mastra Mapping

```txt
Single OpenClaw Block + one simple task
  → Mastra Agent or direct adapter task

OpenClaw Block + approval/retry/resume requirements
  → Mastra Workflow

Multiple OpenClaw Blocks + shared objective
  → Mastra Supervisor / Agent Network

Canvas region selected + AI operation
  → Mastra Agent or Workflow depending on determinism

User asks for broad outcome from many blocks
  → Mastra Supervisor + Workflow
```

## Mastra Binding Types

```ts
export interface MastraOpenClawBinding {
  bindingId: string;
  blockId: string;
  mastraAgentId?: string;
  mastraWorkflowId?: string;
  mastraNetworkId?: string;
  mastraToolId?: string;
  role:
    | "single_task_executor"
    | "specialist_agent"
    | "workflow_step"
    | "supervised_worker"
    | "approval_gate"
    | "artifact_producer"
    | "memory_operator";
  createdAt: string;
  updatedAt: string;
}
```

## OpenClaw as Mastra Tool

```ts
export interface OpenClawMastraToolInput {
  blockId: string;
  task: string;
  policyOverride?: Partial<OpenClawBlockPolicy>;
  expectedOutputs?: string[];
  requireApproval?: boolean;
}

export interface OpenClawMastraToolOutput {
  taskId: string;
  status: "started" | "completed" | "waiting_for_approval" | "failed";
  summary?: string;
  outputObjectIds?: string[];
  approvalRequestIds?: string[];
  eventStreamId?: string;
}
```

## Human-in-the-Loop Rules

Any of the following must trigger a human checkpoint unless policy explicitly says otherwise:

- sending external messages
- writing/deleting files
- shell execution
- browser automation involving credentials or payments
- purchases
- calendar modifications
- email sends
- credential access
- installing or enabling third-party skills
- changing sandbox mode
- accessing sensitive memory
- sending data to cloud models
- interacting with identity/wallet/AURA/PLOG blocks

## Observability Requirements

Mastra orchestration must emit events visible in the canvas inspector:

- selected route
- selected block
- selected model route
- workflow step started/completed
- workflow branch selected
- approval requested/resolved
- error/retry
- final output

## Rule

If the user can see a block working, the system must be able to explain what it is doing and why.
