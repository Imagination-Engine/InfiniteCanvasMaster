import { z } from "zod";
export declare const BALNCE_A2A_PROTOCOL: "balnce.a2a";
export declare const BALNCE_A2A_VERSION: "0.1.0";
export declare const DeliveryClassSchema: z.ZodEnum<
  [
    "ephemeral",
    "replayable",
    "durable",
    "approval_required",
    "provenance_required",
  ]
>;
export type DeliveryClass = z.infer<typeof DeliveryClassSchema>;
export declare const BalnceEnvelopeEventTypeSchema: z.ZodEnum<
  [
    "run.started",
    "run.progress",
    "run.completed",
    "run.failed",
    "node.started",
    "node.input.prepared",
    "node.output",
    "node.completed",
    "node.failed",
    "tool.started",
    "tool.output",
    "tool.completed",
    "tool.failed",
    "agent.message",
    "agent.delegated",
    "approval.required",
    "approval.granted",
    "approval.denied",
    "artifact.created",
    "memory.read",
    "memory.written",
    "canvas.block.created",
    "canvas.block.updated",
    "openclaw.task.started",
    "openclaw.task.progress",
    "openclaw.task.completed",
    "openclaw.task.failed",
    "policy.blocked",
    "provenance.recorded",
  ]
>;
export type BalnceEnvelopeEventType = z.infer<
  typeof BalnceEnvelopeEventTypeSchema
>;
export declare const EnvelopeActorSchema: z.ZodObject<
  {
    type: z.ZodEnum<
      [
        "user",
        "system",
        "agent",
        "block",
        "tool",
        "workflow",
        "canvas",
        "openclaw",
        "edge-twin",
        "device",
        "model",
      ]
    >;
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    runtime: z.ZodOptional<
      z.ZodEnum<["local", "device-mesh", "edge-twin", "cloud", "unknown"]>
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    type:
      | "user"
      | "agent"
      | "system"
      | "model"
      | "block"
      | "canvas"
      | "tool"
      | "workflow"
      | "openclaw"
      | "edge-twin"
      | "device";
    id: string;
    name?: string | undefined;
    runtime?:
      | "unknown"
      | "local"
      | "edge-twin"
      | "device-mesh"
      | "cloud"
      | undefined;
  },
  {
    type:
      | "user"
      | "agent"
      | "system"
      | "model"
      | "block"
      | "canvas"
      | "tool"
      | "workflow"
      | "openclaw"
      | "edge-twin"
      | "device";
    id: string;
    name?: string | undefined;
    runtime?:
      | "unknown"
      | "local"
      | "edge-twin"
      | "device-mesh"
      | "cloud"
      | undefined;
  }
>;
export type EnvelopeActor = z.infer<typeof EnvelopeActorSchema>;
export declare const EnvelopeTargetSchema: z.ZodObject<
  {
    type: z.ZodEnum<
      [
        "agent",
        "block",
        "tool",
        "workflow",
        "canvas",
        "topic",
        "broadcast",
        "openclaw",
        "approval-queue",
      ]
    >;
    id: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    type:
      | "agent"
      | "block"
      | "canvas"
      | "topic"
      | "tool"
      | "workflow"
      | "openclaw"
      | "broadcast"
      | "approval-queue";
    id?: string | undefined;
    topic?: string | undefined;
  },
  {
    type:
      | "agent"
      | "block"
      | "canvas"
      | "topic"
      | "tool"
      | "workflow"
      | "openclaw"
      | "broadcast"
      | "approval-queue";
    id?: string | undefined;
    topic?: string | undefined;
  }
>;
export type EnvelopeTarget = z.infer<typeof EnvelopeTargetSchema>;
export declare const EnvelopeEventSchema: z.ZodObject<
  {
    type: z.ZodUnion<
      [
        z.ZodEnum<
          [
            "run.started",
            "run.progress",
            "run.completed",
            "run.failed",
            "node.started",
            "node.input.prepared",
            "node.output",
            "node.completed",
            "node.failed",
            "tool.started",
            "tool.output",
            "tool.completed",
            "tool.failed",
            "agent.message",
            "agent.delegated",
            "approval.required",
            "approval.granted",
            "approval.denied",
            "artifact.created",
            "memory.read",
            "memory.written",
            "canvas.block.created",
            "canvas.block.updated",
            "openclaw.task.started",
            "openclaw.task.progress",
            "openclaw.task.completed",
            "openclaw.task.failed",
            "policy.blocked",
            "provenance.recorded",
          ]
        >,
        z.ZodString,
      ]
    >;
    phase: z.ZodOptional<z.ZodString>;
    sequence: z.ZodNumber;
    timestamp: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    type: string;
    timestamp: string;
    sequence: number;
    phase?: string | undefined;
  },
  {
    type: string;
    timestamp: string;
    sequence: number;
    phase?: string | undefined;
  }
>;
export type EnvelopeEvent = z.infer<typeof EnvelopeEventSchema>;
export declare const EnvelopeInstructionSchema: z.ZodObject<
  {
    text: z.ZodString;
    origin: z.ZodEnum<
      [
        "system",
        "user",
        "agent",
        "tool",
        "retrieved_content",
        "external_content",
      ]
    >;
    trust: z.ZodEnum<["trusted", "bounded", "untrusted"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high", "critical"]>>;
    mayModifyGoal: z.ZodOptional<z.ZodBoolean>;
    mayUseTools: z.ZodOptional<z.ZodBoolean>;
    mayEscalatePermissions: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  {
    text: string;
    origin:
      | "user"
      | "agent"
      | "system"
      | "tool"
      | "retrieved_content"
      | "external_content";
    trust: "trusted" | "bounded" | "untrusted";
    priority?: "low" | "normal" | "high" | "critical" | undefined;
    mayModifyGoal?: boolean | undefined;
    mayUseTools?: boolean | undefined;
    mayEscalatePermissions?: boolean | undefined;
  },
  {
    text: string;
    origin:
      | "user"
      | "agent"
      | "system"
      | "tool"
      | "retrieved_content"
      | "external_content";
    trust: "trusted" | "bounded" | "untrusted";
    priority?: "low" | "normal" | "high" | "critical" | undefined;
    mayModifyGoal?: boolean | undefined;
    mayUseTools?: boolean | undefined;
    mayEscalatePermissions?: boolean | undefined;
  }
>;
export type EnvelopeInstruction = z.infer<typeof EnvelopeInstructionSchema>;
export declare const EnvelopeContextSchema: z.ZodObject<
  {
    summary: z.ZodOptional<z.ZodString>;
    refs: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString;
            id: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
          },
          "strip",
          z.ZodTypeAny,
          {
            type: string;
            id: string;
            label?: string | undefined;
          },
          {
            type: string;
            id: string;
            label?: string | undefined;
          }
        >,
        "many"
      >
    >;
    values: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    values?: Record<string, any> | undefined;
    summary?: string | undefined;
    refs?:
      | {
          type: string;
          id: string;
          label?: string | undefined;
        }[]
      | undefined;
  },
  {
    values?: Record<string, any> | undefined;
    summary?: string | undefined;
    refs?:
      | {
          type: string;
          id: string;
          label?: string | undefined;
        }[]
      | undefined;
  }
>;
export type EnvelopeContext = z.infer<typeof EnvelopeContextSchema>;
export declare const EnvelopePolicySchema: z.ZodObject<
  {
    visibility: z.ZodEnum<["private", "workspace", "agent-group", "public"]>;
    sensitivity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "secret"]>>;
    requiresApproval: z.ZodOptional<z.ZodBoolean>;
    allowedCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deniedCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    budgetId: z.ZodOptional<z.ZodString>;
    maxSpendCredits: z.ZodOptional<z.ZodNumber>;
    redaction: z.ZodOptional<z.ZodEnum<["none", "compact", "full"]>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    visibility: "public" | "private" | "workspace" | "agent-group";
    sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
    requiresApproval?: boolean | undefined;
    allowedCapabilities?: string[] | undefined;
    deniedCapabilities?: string[] | undefined;
    budgetId?: string | undefined;
    maxSpendCredits?: number | undefined;
    redaction?: "none" | "compact" | "full" | undefined;
  },
  {
    visibility: "public" | "private" | "workspace" | "agent-group";
    sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
    requiresApproval?: boolean | undefined;
    allowedCapabilities?: string[] | undefined;
    deniedCapabilities?: string[] | undefined;
    budgetId?: string | undefined;
    maxSpendCredits?: number | undefined;
    redaction?: "none" | "compact" | "full" | undefined;
  }
>;
export type EnvelopePolicy = z.infer<typeof EnvelopePolicySchema>;
export declare const EnvelopeProvenanceSchema: z.ZodObject<
  {
    vladId: z.ZodOptional<z.ZodString>;
    plogId: z.ZodOptional<z.ZodString>;
    signature: z.ZodOptional<z.ZodString>;
    contentHash: z.ZodOptional<z.ZodString>;
    sourceRefs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  },
  "strip",
  z.ZodTypeAny,
  {
    vladId?: string | undefined;
    plogId?: string | undefined;
    signature?: string | undefined;
    contentHash?: string | undefined;
    sourceRefs?: string[] | undefined;
  },
  {
    vladId?: string | undefined;
    plogId?: string | undefined;
    signature?: string | undefined;
    contentHash?: string | undefined;
    sourceRefs?: string[] | undefined;
  }
>;
export type EnvelopeProvenance = z.infer<typeof EnvelopeProvenanceSchema>;
export declare const EnvelopeDeliverySchema: z.ZodObject<
  {
    class: z.ZodEnum<
      [
        "ephemeral",
        "replayable",
        "durable",
        "approval_required",
        "provenance_required",
      ]
    >;
    ttlMs: z.ZodOptional<z.ZodNumber>;
    replayable: z.ZodOptional<z.ZodBoolean>;
    durable: z.ZodOptional<z.ZodBoolean>;
    ordered: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  {
    class:
      | "ephemeral"
      | "replayable"
      | "durable"
      | "approval_required"
      | "provenance_required";
    ordered?: boolean | undefined;
    replayable?: boolean | undefined;
    durable?: boolean | undefined;
    ttlMs?: number | undefined;
  },
  {
    class:
      | "ephemeral"
      | "replayable"
      | "durable"
      | "approval_required"
      | "provenance_required";
    ordered?: boolean | undefined;
    replayable?: boolean | undefined;
    durable?: boolean | undefined;
    ttlMs?: number | undefined;
  }
>;
export type EnvelopeDelivery = z.infer<typeof EnvelopeDeliverySchema>;
export declare const EnvelopeDebugSchema: z.ZodObject<
  {
    compilerNodeId: z.ZodOptional<z.ZodString>;
    mastraWorkflowId: z.ZodOptional<z.ZodString>;
    mastraStepId: z.ZodOptional<z.ZodString>;
    toolName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    latencyMs: z.ZodOptional<z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    latencyMs?: number | undefined;
    toolName?: string | undefined;
    compilerNodeId?: string | undefined;
    mastraWorkflowId?: string | undefined;
    mastraStepId?: string | undefined;
    modelName?: string | undefined;
  },
  {
    latencyMs?: number | undefined;
    toolName?: string | undefined;
    compilerNodeId?: string | undefined;
    mastraWorkflowId?: string | undefined;
    mastraStepId?: string | undefined;
    modelName?: string | undefined;
  }
>;
export type EnvelopeDebug = z.infer<typeof EnvelopeDebugSchema>;
/**
 * The BalnceEnvelope is the canonical message container.
 */
export declare const BalnceEnvelopeSchema: z.ZodObject<
  {
    protocol: z.ZodLiteral<"balnce.a2a">;
    version: z.ZodDefault<z.ZodString>;
    id: z.ZodString;
    traceId: z.ZodString;
    runId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    source: z.ZodObject<
      {
        type: z.ZodEnum<
          [
            "user",
            "system",
            "agent",
            "block",
            "tool",
            "workflow",
            "canvas",
            "openclaw",
            "edge-twin",
            "device",
            "model",
          ]
        >;
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        runtime: z.ZodOptional<
          z.ZodEnum<["local", "device-mesh", "edge-twin", "cloud", "unknown"]>
        >;
      },
      "strip",
      z.ZodTypeAny,
      {
        type:
          | "user"
          | "agent"
          | "system"
          | "model"
          | "block"
          | "canvas"
          | "tool"
          | "workflow"
          | "openclaw"
          | "edge-twin"
          | "device";
        id: string;
        name?: string | undefined;
        runtime?:
          | "unknown"
          | "local"
          | "edge-twin"
          | "device-mesh"
          | "cloud"
          | undefined;
      },
      {
        type:
          | "user"
          | "agent"
          | "system"
          | "model"
          | "block"
          | "canvas"
          | "tool"
          | "workflow"
          | "openclaw"
          | "edge-twin"
          | "device";
        id: string;
        name?: string | undefined;
        runtime?:
          | "unknown"
          | "local"
          | "edge-twin"
          | "device-mesh"
          | "cloud"
          | undefined;
      }
    >;
    target: z.ZodOptional<
      z.ZodObject<
        {
          type: z.ZodEnum<
            [
              "agent",
              "block",
              "tool",
              "workflow",
              "canvas",
              "topic",
              "broadcast",
              "openclaw",
              "approval-queue",
            ]
          >;
          id: z.ZodOptional<z.ZodString>;
          topic: z.ZodOptional<z.ZodString>;
        },
        "strip",
        z.ZodTypeAny,
        {
          type:
            | "agent"
            | "block"
            | "canvas"
            | "topic"
            | "tool"
            | "workflow"
            | "openclaw"
            | "broadcast"
            | "approval-queue";
          id?: string | undefined;
          topic?: string | undefined;
        },
        {
          type:
            | "agent"
            | "block"
            | "canvas"
            | "topic"
            | "tool"
            | "workflow"
            | "openclaw"
            | "broadcast"
            | "approval-queue";
          id?: string | undefined;
          topic?: string | undefined;
        }
      >
    >;
    event: z.ZodObject<
      {
        type: z.ZodUnion<
          [
            z.ZodEnum<
              [
                "run.started",
                "run.progress",
                "run.completed",
                "run.failed",
                "node.started",
                "node.input.prepared",
                "node.output",
                "node.completed",
                "node.failed",
                "tool.started",
                "tool.output",
                "tool.completed",
                "tool.failed",
                "agent.message",
                "agent.delegated",
                "approval.required",
                "approval.granted",
                "approval.denied",
                "artifact.created",
                "memory.read",
                "memory.written",
                "canvas.block.created",
                "canvas.block.updated",
                "openclaw.task.started",
                "openclaw.task.progress",
                "openclaw.task.completed",
                "openclaw.task.failed",
                "policy.blocked",
                "provenance.recorded",
              ]
            >,
            z.ZodString,
          ]
        >;
        phase: z.ZodOptional<z.ZodString>;
        sequence: z.ZodNumber;
        timestamp: z.ZodString;
      },
      "strip",
      z.ZodTypeAny,
      {
        type: string;
        timestamp: string;
        sequence: number;
        phase?: string | undefined;
      },
      {
        type: string;
        timestamp: string;
        sequence: number;
        phase?: string | undefined;
      }
    >;
    instruction: z.ZodOptional<
      z.ZodObject<
        {
          text: z.ZodString;
          origin: z.ZodEnum<
            [
              "system",
              "user",
              "agent",
              "tool",
              "retrieved_content",
              "external_content",
            ]
          >;
          trust: z.ZodEnum<["trusted", "bounded", "untrusted"]>;
          priority: z.ZodOptional<
            z.ZodEnum<["low", "normal", "high", "critical"]>
          >;
          mayModifyGoal: z.ZodOptional<z.ZodBoolean>;
          mayUseTools: z.ZodOptional<z.ZodBoolean>;
          mayEscalatePermissions: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          text: string;
          origin:
            | "user"
            | "agent"
            | "system"
            | "tool"
            | "retrieved_content"
            | "external_content";
          trust: "trusted" | "bounded" | "untrusted";
          priority?: "low" | "normal" | "high" | "critical" | undefined;
          mayModifyGoal?: boolean | undefined;
          mayUseTools?: boolean | undefined;
          mayEscalatePermissions?: boolean | undefined;
        },
        {
          text: string;
          origin:
            | "user"
            | "agent"
            | "system"
            | "tool"
            | "retrieved_content"
            | "external_content";
          trust: "trusted" | "bounded" | "untrusted";
          priority?: "low" | "normal" | "high" | "critical" | undefined;
          mayModifyGoal?: boolean | undefined;
          mayUseTools?: boolean | undefined;
          mayEscalatePermissions?: boolean | undefined;
        }
      >
    >;
    context: z.ZodOptional<
      z.ZodObject<
        {
          summary: z.ZodOptional<z.ZodString>;
          refs: z.ZodOptional<
            z.ZodArray<
              z.ZodObject<
                {
                  type: z.ZodString;
                  id: z.ZodString;
                  label: z.ZodOptional<z.ZodString>;
                },
                "strip",
                z.ZodTypeAny,
                {
                  type: string;
                  id: string;
                  label?: string | undefined;
                },
                {
                  type: string;
                  id: string;
                  label?: string | undefined;
                }
              >,
              "many"
            >
          >;
          values: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          values?: Record<string, any> | undefined;
          summary?: string | undefined;
          refs?:
            | {
                type: string;
                id: string;
                label?: string | undefined;
              }[]
            | undefined;
        },
        {
          values?: Record<string, any> | undefined;
          summary?: string | undefined;
          refs?:
            | {
                type: string;
                id: string;
                label?: string | undefined;
              }[]
            | undefined;
        }
      >
    >;
    payload: z.ZodAny;
    policy: z.ZodOptional<
      z.ZodObject<
        {
          visibility: z.ZodEnum<
            ["private", "workspace", "agent-group", "public"]
          >;
          sensitivity: z.ZodOptional<
            z.ZodEnum<["low", "medium", "high", "secret"]>
          >;
          requiresApproval: z.ZodOptional<z.ZodBoolean>;
          allowedCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
          deniedCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
          budgetId: z.ZodOptional<z.ZodString>;
          maxSpendCredits: z.ZodOptional<z.ZodNumber>;
          redaction: z.ZodOptional<z.ZodEnum<["none", "compact", "full"]>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          visibility: "public" | "private" | "workspace" | "agent-group";
          sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
          requiresApproval?: boolean | undefined;
          allowedCapabilities?: string[] | undefined;
          deniedCapabilities?: string[] | undefined;
          budgetId?: string | undefined;
          maxSpendCredits?: number | undefined;
          redaction?: "none" | "compact" | "full" | undefined;
        },
        {
          visibility: "public" | "private" | "workspace" | "agent-group";
          sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
          requiresApproval?: boolean | undefined;
          allowedCapabilities?: string[] | undefined;
          deniedCapabilities?: string[] | undefined;
          budgetId?: string | undefined;
          maxSpendCredits?: number | undefined;
          redaction?: "none" | "compact" | "full" | undefined;
        }
      >
    >;
    provenance: z.ZodOptional<
      z.ZodObject<
        {
          vladId: z.ZodOptional<z.ZodString>;
          plogId: z.ZodOptional<z.ZodString>;
          signature: z.ZodOptional<z.ZodString>;
          contentHash: z.ZodOptional<z.ZodString>;
          sourceRefs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        },
        "strip",
        z.ZodTypeAny,
        {
          vladId?: string | undefined;
          plogId?: string | undefined;
          signature?: string | undefined;
          contentHash?: string | undefined;
          sourceRefs?: string[] | undefined;
        },
        {
          vladId?: string | undefined;
          plogId?: string | undefined;
          signature?: string | undefined;
          contentHash?: string | undefined;
          sourceRefs?: string[] | undefined;
        }
      >
    >;
    delivery: z.ZodOptional<
      z.ZodObject<
        {
          class: z.ZodEnum<
            [
              "ephemeral",
              "replayable",
              "durable",
              "approval_required",
              "provenance_required",
            ]
          >;
          ttlMs: z.ZodOptional<z.ZodNumber>;
          replayable: z.ZodOptional<z.ZodBoolean>;
          durable: z.ZodOptional<z.ZodBoolean>;
          ordered: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          class:
            | "ephemeral"
            | "replayable"
            | "durable"
            | "approval_required"
            | "provenance_required";
          ordered?: boolean | undefined;
          replayable?: boolean | undefined;
          durable?: boolean | undefined;
          ttlMs?: number | undefined;
        },
        {
          class:
            | "ephemeral"
            | "replayable"
            | "durable"
            | "approval_required"
            | "provenance_required";
          ordered?: boolean | undefined;
          replayable?: boolean | undefined;
          durable?: boolean | undefined;
          ttlMs?: number | undefined;
        }
      >
    >;
    debug: z.ZodOptional<
      z.ZodObject<
        {
          compilerNodeId: z.ZodOptional<z.ZodString>;
          mastraWorkflowId: z.ZodOptional<z.ZodString>;
          mastraStepId: z.ZodOptional<z.ZodString>;
          toolName: z.ZodOptional<z.ZodString>;
          modelName: z.ZodOptional<z.ZodString>;
          latencyMs: z.ZodOptional<z.ZodNumber>;
        },
        "strip",
        z.ZodTypeAny,
        {
          latencyMs?: number | undefined;
          toolName?: string | undefined;
          compilerNodeId?: string | undefined;
          mastraWorkflowId?: string | undefined;
          mastraStepId?: string | undefined;
          modelName?: string | undefined;
        },
        {
          latencyMs?: number | undefined;
          toolName?: string | undefined;
          compilerNodeId?: string | undefined;
          mastraWorkflowId?: string | undefined;
          mastraStepId?: string | undefined;
          modelName?: string | undefined;
        }
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    source: {
      type:
        | "user"
        | "agent"
        | "system"
        | "model"
        | "block"
        | "canvas"
        | "tool"
        | "workflow"
        | "openclaw"
        | "edge-twin"
        | "device";
      id: string;
      name?: string | undefined;
      runtime?:
        | "unknown"
        | "local"
        | "edge-twin"
        | "device-mesh"
        | "cloud"
        | undefined;
    };
    protocol: "balnce.a2a";
    version: string;
    traceId: string;
    runId: string;
    event: {
      type: string;
      timestamp: string;
      sequence: number;
      phase?: string | undefined;
    };
    parentId?: string | undefined;
    provenance?:
      | {
          vladId?: string | undefined;
          plogId?: string | undefined;
          signature?: string | undefined;
          contentHash?: string | undefined;
          sourceRefs?: string[] | undefined;
        }
      | undefined;
    causationId?: string | undefined;
    correlationId?: string | undefined;
    idempotencyKey?: string | undefined;
    target?:
      | {
          type:
            | "agent"
            | "block"
            | "canvas"
            | "topic"
            | "tool"
            | "workflow"
            | "openclaw"
            | "broadcast"
            | "approval-queue";
          id?: string | undefined;
          topic?: string | undefined;
        }
      | undefined;
    instruction?:
      | {
          text: string;
          origin:
            | "user"
            | "agent"
            | "system"
            | "tool"
            | "retrieved_content"
            | "external_content";
          trust: "trusted" | "bounded" | "untrusted";
          priority?: "low" | "normal" | "high" | "critical" | undefined;
          mayModifyGoal?: boolean | undefined;
          mayUseTools?: boolean | undefined;
          mayEscalatePermissions?: boolean | undefined;
        }
      | undefined;
    context?:
      | {
          values?: Record<string, any> | undefined;
          summary?: string | undefined;
          refs?:
            | {
                type: string;
                id: string;
                label?: string | undefined;
              }[]
            | undefined;
        }
      | undefined;
    payload?: any;
    policy?:
      | {
          visibility: "public" | "private" | "workspace" | "agent-group";
          sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
          requiresApproval?: boolean | undefined;
          allowedCapabilities?: string[] | undefined;
          deniedCapabilities?: string[] | undefined;
          budgetId?: string | undefined;
          maxSpendCredits?: number | undefined;
          redaction?: "none" | "compact" | "full" | undefined;
        }
      | undefined;
    delivery?:
      | {
          class:
            | "ephemeral"
            | "replayable"
            | "durable"
            | "approval_required"
            | "provenance_required";
          ordered?: boolean | undefined;
          replayable?: boolean | undefined;
          durable?: boolean | undefined;
          ttlMs?: number | undefined;
        }
      | undefined;
    debug?:
      | {
          latencyMs?: number | undefined;
          toolName?: string | undefined;
          compilerNodeId?: string | undefined;
          mastraWorkflowId?: string | undefined;
          mastraStepId?: string | undefined;
          modelName?: string | undefined;
        }
      | undefined;
  },
  {
    id: string;
    source: {
      type:
        | "user"
        | "agent"
        | "system"
        | "model"
        | "block"
        | "canvas"
        | "tool"
        | "workflow"
        | "openclaw"
        | "edge-twin"
        | "device";
      id: string;
      name?: string | undefined;
      runtime?:
        | "unknown"
        | "local"
        | "edge-twin"
        | "device-mesh"
        | "cloud"
        | undefined;
    };
    protocol: "balnce.a2a";
    traceId: string;
    runId: string;
    event: {
      type: string;
      timestamp: string;
      sequence: number;
      phase?: string | undefined;
    };
    parentId?: string | undefined;
    provenance?:
      | {
          vladId?: string | undefined;
          plogId?: string | undefined;
          signature?: string | undefined;
          contentHash?: string | undefined;
          sourceRefs?: string[] | undefined;
        }
      | undefined;
    version?: string | undefined;
    causationId?: string | undefined;
    correlationId?: string | undefined;
    idempotencyKey?: string | undefined;
    target?:
      | {
          type:
            | "agent"
            | "block"
            | "canvas"
            | "topic"
            | "tool"
            | "workflow"
            | "openclaw"
            | "broadcast"
            | "approval-queue";
          id?: string | undefined;
          topic?: string | undefined;
        }
      | undefined;
    instruction?:
      | {
          text: string;
          origin:
            | "user"
            | "agent"
            | "system"
            | "tool"
            | "retrieved_content"
            | "external_content";
          trust: "trusted" | "bounded" | "untrusted";
          priority?: "low" | "normal" | "high" | "critical" | undefined;
          mayModifyGoal?: boolean | undefined;
          mayUseTools?: boolean | undefined;
          mayEscalatePermissions?: boolean | undefined;
        }
      | undefined;
    context?:
      | {
          values?: Record<string, any> | undefined;
          summary?: string | undefined;
          refs?:
            | {
                type: string;
                id: string;
                label?: string | undefined;
              }[]
            | undefined;
        }
      | undefined;
    payload?: any;
    policy?:
      | {
          visibility: "public" | "private" | "workspace" | "agent-group";
          sensitivity?: "low" | "high" | "medium" | "secret" | undefined;
          requiresApproval?: boolean | undefined;
          allowedCapabilities?: string[] | undefined;
          deniedCapabilities?: string[] | undefined;
          budgetId?: string | undefined;
          maxSpendCredits?: number | undefined;
          redaction?: "none" | "compact" | "full" | undefined;
        }
      | undefined;
    delivery?:
      | {
          class:
            | "ephemeral"
            | "replayable"
            | "durable"
            | "approval_required"
            | "provenance_required";
          ordered?: boolean | undefined;
          replayable?: boolean | undefined;
          durable?: boolean | undefined;
          ttlMs?: number | undefined;
        }
      | undefined;
    debug?:
      | {
          latencyMs?: number | undefined;
          toolName?: string | undefined;
          compilerNodeId?: string | undefined;
          mastraWorkflowId?: string | undefined;
          mastraStepId?: string | undefined;
          modelName?: string | undefined;
        }
      | undefined;
  }
>;
export type BalnceEnvelope<TPayload = any> = z.infer<
  typeof BalnceEnvelopeSchema
> & {
  payload: TPayload;
};
export declare const Topics: {
  dagTrace: (runId: string) => string;
  dagNodeEvent: (runId: string, nodeId: string) => string;
  dagNodeOutput: (runId: string, nodeId: string) => string;
  dagNodeError: (runId: string, nodeId: string) => string;
  dagNodeApproval: (runId: string, nodeId: string) => string;
  canvasBlockEvent: (canvasId: string, blockId: string) => string;
  openClawTaskEvent: (
    runtimeId: string,
    sessionId: string,
    taskId: string,
  ) => string;
  approvalEvent: (runId: string) => string;
  artifactEvent: (artifactId: string) => string;
  provenanceEvent: (traceId: string) => string;
};
export declare function wrapInEnvelope<T>(params: any): BalnceEnvelope<T>;
export declare function serializeEnvelope(
  envelope: BalnceEnvelope<any>,
): string;
export interface A2AMessageTransport {
  publish<TPayload>(
    topic: string,
    envelope: BalnceEnvelope<TPayload>,
  ): Promise<void>;
  subscribe<TPayload>(
    topic: string,
    handler: (envelope: BalnceEnvelope<TPayload>) => void | Promise<void>,
    options?: any,
  ): {
    unsubscribe: () => void;
  };
  close?(): Promise<void>;
}
export interface A2AReplayQuery {
  traceId?: string;
  runId?: string;
  topicPrefix?: string;
  sourceId?: string;
  targetId?: string;
  eventTypes?: BalnceEnvelopeEventType[];
  fromSequence?: number;
  toSequence?: number;
  fromTimestamp?: string;
  toTimestamp?: string;
}
export interface A2AMessageFabric extends A2AMessageTransport {
  replay?(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
}
export interface A2AEventLog {
  append(envelope: BalnceEnvelope): Promise<void>;
  query(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
  clear?(query?: A2AReplayQuery): Promise<void>;
}
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  modifiedEnvelope?: BalnceEnvelope;
}
export interface A2APolicyEngine {
  evaluatePublish(args: {
    topic: string;
    envelope: BalnceEnvelope;
  }): Promise<PolicyDecision>;
  evaluateDelivery(args: {
    topic: string;
    envelope: BalnceEnvelope;
    subscriber?: unknown;
  }): Promise<PolicyDecision>;
  evaluateInputAdaptation(args: {
    envelopes: BalnceEnvelope[];
    nodeSpec: unknown;
    toolName?: string;
  }): Promise<PolicyDecision>;
}
export interface NodeInputAdapter<TInput = unknown> {
  nodeType?: string;
  toolName?: string;
  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: TInput;
    nodeSpec: any;
    runContext: any;
  }): Promise<TInput> | TInput;
}
//# sourceMappingURL=protocol.d.ts.map
