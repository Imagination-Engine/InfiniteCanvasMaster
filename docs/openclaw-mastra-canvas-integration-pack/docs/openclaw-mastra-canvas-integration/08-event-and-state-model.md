# 08 — Event and State Model

## Principle

Every meaningful behavior must map to typed state and typed events.

If the canvas shows an OpenClaw Block doing something, there must be an event and state transition behind it.

## OpenClaw Block Events

```ts
export type OpenClawBlockEvent =
  | { type: "openclaw.block.created"; blockId: string; timestamp: string }
  | { type: "openclaw.block.configured"; blockId: string; timestamp: string }
  | {
      type: "openclaw.runtime.binding.started";
      blockId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.bound";
      blockId: string;
      runtime: OpenClawRuntimeBinding;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.disconnected";
      blockId: string;
      reason?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.error";
      blockId: string;
      error: OpenClawError;
      timestamp: string;
    }
  | {
      type: "openclaw.session.created";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.session.bound";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.session.revoked";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.requested";
      blockId: string;
      task: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.started";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.progress";
      blockId: string;
      taskId: string;
      message: string;
      progress?: number;
      timestamp: string;
    }
  | {
      type: "openclaw.task.paused";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.resumed";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.stopped";
      blockId: string;
      taskId: string;
      reason?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.completed";
      blockId: string;
      taskId: string;
      outputs?: OpenClawOutput[];
      timestamp: string;
    }
  | {
      type: "openclaw.task.failed";
      blockId: string;
      taskId: string;
      error: OpenClawError;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.started";
      blockId: string;
      taskId?: string;
      toolName: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.progress";
      blockId: string;
      toolName: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.completed";
      blockId: string;
      toolName: string;
      summary?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.failed";
      blockId: string;
      toolName: string;
      error: OpenClawError;
      timestamp: string;
    }
  | {
      type: "openclaw.skill.enabled";
      blockId: string;
      skillId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.skill.disabled";
      blockId: string;
      skillId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.skill.blocked";
      blockId: string;
      skillId: string;
      reason: string;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.required";
      blockId: string;
      request: OpenClawApprovalRequest;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.approved";
      blockId: string;
      requestId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.denied";
      blockId: string;
      requestId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.policy.updated";
      blockId: string;
      policy: OpenClawBlockPolicy;
      timestamp: string;
    }
  | {
      type: "openclaw.policy.violation";
      blockId: string;
      violation: OpenClawPolicyViolation;
      timestamp: string;
    }
  | {
      type: "openclaw.output.created";
      blockId: string;
      output: OpenClawOutput;
      timestamp: string;
    }
  | {
      type: "openclaw.output.converted_to_canvas_object";
      blockId: string;
      outputId: string;
      objectId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.provenance.recorded";
      blockId: string;
      provenanceId: string;
      timestamp: string;
    };
```

## Error and Output Types

```ts
export interface OpenClawError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}

export interface OpenClawOutput {
  outputId: string;
  kind:
    | "text"
    | "artifact"
    | "file"
    | "message_draft"
    | "canvas_object"
    | "workflow_result"
    | "summary"
    | "log";
  title?: string;
  summary?: string;
  contentRef?: string;
  objectIds?: string[];
  provenanceId?: string;
  createdAt: string;
}
```

## State Machine

```txt
unconfigured
  -> binding
  -> ready
  -> running
  -> using_tool
  -> waiting_for_approval
  -> running
  -> completed

running
  -> paused
  -> running

running
  -> failed

running
  -> stopped

any
  -> revoked

running
  -> sandbox_blocked
```

## Group Events

```ts
export type OpenClawGroupEvent =
  | {
      type: "openclaw.group.created";
      groupId: string;
      blockIds: string[];
      timestamp: string;
    }
  | {
      type: "openclaw.group.task.started";
      groupId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.group.member.assigned";
      groupId: string;
      blockId: string;
      subtaskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.group.progress";
      groupId: string;
      message: string;
      progress?: number;
      timestamp: string;
    }
  | {
      type: "openclaw.group.approval.required";
      groupId: string;
      request: OpenClawApprovalRequest;
      timestamp: string;
    }
  | {
      type: "openclaw.group.completed";
      groupId: string;
      outputs?: OpenClawOutput[];
      timestamp: string;
    }
  | {
      type: "openclaw.group.failed";
      groupId: string;
      error: OpenClawError;
      timestamp: string;
    }
  | {
      type: "openclaw.group.stopped";
      groupId: string;
      reason?: string;
      timestamp: string;
    };
```

## Event Handling Rules

1. Events must be appendable to a task timeline.
2. Events must support user-visible summaries.
3. Events must support developer/debug trace where allowed.
4. Sensitive event payloads must be redacted before UI display.
5. Events must be replayable enough for debugging.
6. Events must feed provenance hooks when outputs or sensitive actions occur.
7. Events must update block state predictably.

## Testing Requirements

Tests must cover state transitions, approval events, task events, tool events, policy violations, group events, output conversion events, and error recovery transitions.
