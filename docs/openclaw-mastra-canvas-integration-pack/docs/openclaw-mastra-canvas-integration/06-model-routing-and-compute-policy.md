# 06 — Model Routing and Compute Policy

## Purpose

OpenClaw Blocks should not assume a single model or single compute target. Balnce has local/on-device models, personal device mesh, Edge Twin, and access to powerful cloud foundation models across modalities.

The OpenClaw Block must expose model and compute routing as explicit policy.

## Compute Routes

### Local / On-Device

Use local models for:

- private intent classification
- quick summaries
- small transformations
- memory tagging
- lightweight routing
- local embeddings
- privacy-sensitive tasks
- offline execution

### Device Mesh

Use device mesh for:

- pooled local inference
- larger private jobs across user-owned devices
- distributed embeddings
- multimodal pre-processing
- sharded local models, if available
- local memory operations

### Edge Twin

Use Edge Twin for:

- always-on tasks
- long-running workflows
- background execution
- rendezvous/bootstrap
- heavy compute bursts
- larger model access
- durable orchestration
- agent-to-agent relationship continuity

### Cloud Foundation Models

Use cloud models for:

- advanced reasoning
- complex planning
- coding
- high-quality multimodal generation
- vision/audio reasoning
- long-context synthesis
- specialized foundation models

## Model Route Contract

```ts
export interface ModelRoutePolicy {
  policyId: string;
  allowedRoutes: ComputeRoute[];
  defaultRoute: ComputeRoute;
  cloudAllowed: boolean;
  edgeTwinAllowed: boolean;
  deviceMeshAllowed: boolean;
  localOnlyRequired: boolean;
  requireApprovalForCloud: boolean;
  maxSpendCredits?: number;
  maxLatencyMs?: number;
  privacyClass:
    | "public"
    | "personal"
    | "sensitive"
    | "financial"
    | "identity"
    | "health"
    | "secret";
  modalityNeeds: Array<
    | "text"
    | "vision"
    | "audio"
    | "video"
    | "code"
    | "browser"
    | "embedding"
    | "reasoning"
  >;
}

export type ComputeRoute =
  | "local"
  | "device_mesh"
  | "edge_twin"
  | "cloud"
  | "hybrid";

export interface ModelRoutingDecision {
  route: ComputeRoute;
  provider?: string;
  modelId?: string;
  reason: string;
  requiresApproval: boolean;
  estimatedCostCredits?: number;
  privacyRisk: "low" | "medium" | "high" | "critical";
  fallbackRoutes: ComputeRoute[];
}
```

## Routing Decision Inputs

A routing decision should consider:

- user policy
- block policy
- memory sensitivity
- task complexity
- required modality
- latency
- cost/AURA budget
- device availability
- Edge Twin availability
- model availability
- user approval
- provenance requirements
- whether output will leave local boundary

## User-Facing Copy

Bad:

- “Invoking remote inference backend”
- “Using orchestration model provider”
- “Delegating compute to external LLM”

Good:

- “Using your device”
- “Asking your device network”
- “Bringing in your Edge Twin”
- “Using a stronger model with your approval”
- “Keeping this local”

## Required UI

OpenClaw Block inspector must show:

- current compute route
- current model route, if safe
- whether cloud is involved
- estimated or actual AURA spend, if available
- reason for route
- approval state

## Acceptance Criteria

- Model route is explicit, not hidden.
- Sensitive tasks default to local or approval-gated routes.
- Cloud routing is never silent for sensitive tasks.
- Edge Twin routing is visible.
- Device mesh routing is visible.
- Cost/budget is represented.
- Missing route infrastructure is documented in the gap list.
