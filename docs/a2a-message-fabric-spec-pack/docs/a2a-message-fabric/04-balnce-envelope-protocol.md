# 04 — Balnce Envelope Protocol

The BalnceEnvelope is the canonical message container.

```ts
type BalnceEnvelope<TPayload = unknown> = {
  protocol: "balnce.a2a";
  version: string;
  id: string;
  traceId: string;
  runId: string;
  parentId?: string;
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  source: EnvelopeActor;
  target?: EnvelopeTarget;
  event: {
    type: BalnceEnvelopeEventType;
    phase?: string;
    sequence: number;
    timestamp: string;
  };
  instruction?: {
    text: string;
    origin:
      | "system"
      | "user"
      | "agent"
      | "tool"
      | "retrieved_content"
      | "external_content";
    trust: "trusted" | "bounded" | "untrusted";
    priority?: "low" | "normal" | "high" | "critical";
    mayModifyGoal?: boolean;
    mayUseTools?: boolean;
    mayEscalatePermissions?: boolean;
  };
  context?: {
    summary?: string;
    refs?: Array<{ type: string; id: string; label?: string }>;
    values?: Record<string, unknown>;
  };
  payload: TPayload;
  policy?: {
    visibility: "private" | "workspace" | "agent-group" | "public";
    sensitivity?: "low" | "medium" | "high" | "secret";
    requiresApproval?: boolean;
    allowedCapabilities?: string[];
    deniedCapabilities?: string[];
    budgetId?: string;
    maxSpendCredits?: number;
    redaction?: "none" | "compact" | "full";
  };
  provenance?: {
    vladId?: string;
    plogId?: string;
    signature?: string;
    contentHash?: string;
    sourceRefs?: string[];
  };
  delivery?: {
    class:
      | "ephemeral"
      | "replayable"
      | "durable"
      | "approval_required"
      | "provenance_required";
    ttlMs?: number;
    replayable?: boolean;
    durable?: boolean;
    ordered?: boolean;
  };
  debug?: {
    compilerNodeId?: string;
    mastraWorkflowId?: string;
    mastraStepId?: string;
    toolName?: string;
    modelName?: string;
    latencyMs?: number;
  };
};
```

Internally publish typed envelopes. Encode/decode NDJSON only at stream/transport boundaries.
