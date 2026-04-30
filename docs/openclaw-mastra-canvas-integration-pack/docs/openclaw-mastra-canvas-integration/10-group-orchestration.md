# 10 — Group Orchestration

## Vision

The Imagination Canvas should allow multiple OpenClaw Blocks to be selected, grouped, and orchestrated by Mastra as a coordinated task force.

This is the difference between:

```txt
20 independent chat agents
```

and:

```txt
20 specialized work cells coordinated around one user intent
```

## Group Object

```ts
export interface OpenClawAgentGroup {
  id: string;
  type: "openclaw.agent_group";

  title: string;
  description?: string;

  memberBlockIds: string[];

  supervisor: {
    mastraAgentId?: string;
    mastraWorkflowId?: string;
    mastraNetworkId?: string;
    strategy: "manual" | "supervisor_agent" | "workflow" | "network";
  };

  task?: OpenClawGroupTask;

  sharedPolicy: OpenClawGroupPolicy;
  sharedMemoryScopeId?: string;
  outputCanvasRegionId?: string;

  state: {
    status:
      | "idle"
      | "planning"
      | "running"
      | "waiting_for_approval"
      | "paused"
      | "completed"
      | "failed"
      | "stopped";
    progress?: number;
    activeMembers: string[];
    blockedMembers: string[];
    completedMembers: string[];
  };

  createdAt: string;
  updatedAt: string;
}

export interface OpenClawGroupTask {
  taskId: string;
  userIntent: string;
  plan?: OpenClawGroupPlan;
  subtasks: OpenClawSubtask[];
  expectedOutputs: OpenClawExpectedOutput[];
  createdAt: string;
}

export interface OpenClawSubtask {
  subtaskId: string;
  assignedBlockId?: string;
  title: string;
  description: string;
  status:
    | "unassigned"
    | "assigned"
    | "running"
    | "waiting_for_approval"
    | "completed"
    | "failed";
  dependencies: string[];
  outputs?: OpenClawOutput[];
}

export interface OpenClawGroupPolicy {
  maxTotalSpendCredits?: number;
  maxRuntimeMs?: number;
  maxParallelTasks?: number;
  requireApprovalBeforeExternalActions: boolean;
  requireApprovalBeforeCloudForSensitiveData: boolean;
  allowSharedMemory: boolean;
  allowInterBlockMessaging: boolean;
  allowToolEscalation: boolean;
  defaultSandboxMode: OpenClawSandboxMode;
}
```

## Group UX

A group should show:

- group title
- group objective
- member blocks
- progress
- active subtasks
- blocked subtasks
- approvals needed
- output region
- group timeline
- stop all / pause all
- inspect supervisor

## Group Execution Rules

1. Group execution must respect each member block’s individual policy.
2. Group policy may further restrict members but must not silently loosen restrictions.
3. Supervisor must not grant tools that a member block does not have.
4. Shared memory must be explicit.
5. External actions require approval.
6. Every subtask assignment must be visible.
7. Group stop must stop or pause all member tasks.
8. Outputs must identify the producing block.

## Canvas Interaction

User flows:

1. Select multiple OpenClaw Blocks.
2. Choose “Create agent group.”
3. Name the group or accept generated name.
4. Provide objective.
5. Review suggested roles.
6. Review permissions/budget.
7. Start group task.
8. Monitor group timeline.
9. Approve sensitive actions.
10. Convert outputs into canvas artifacts.

## Acceptance Criteria

- Multiple OpenClaw Blocks can be grouped.
- A group has typed state.
- A group can have a Mastra supervisor/workflow/network binding.
- Subtasks can be assigned to blocks.
- Group progress is visible.
- Individual and group policies are respected.
- Group stop/pause exists.
- Outputs are attributable.
