export type ComputeRoute =
  | "local"
  | "device_mesh"
  | "edge_twin"
  | "cloud"
  | "hybrid";

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

export interface TaskContext {
  taskComplexity: "low" | "medium" | "high";
  hasNetwork: boolean;
  isLongRunning?: boolean;
}

/**
 * Evaluates the model routing policy and task context to determine the safest and most
 * capable compute route.
 */
export function decideModelRoute(
  policy: ModelRoutePolicy,
  context: TaskContext,
): ModelRoutingDecision {
  const isSensitive = [
    "sensitive",
    "financial",
    "identity",
    "health",
    "secret",
  ].includes(policy.privacyClass);

  // 1. Hard Offline / Local Constraint
  if (!context.hasNetwork) {
    return {
      route: "local",
      reason: "Network offline; forcing local execution.",
      requiresApproval: false,
      privacyRisk: "low",
      fallbackRoutes: [],
    };
  }

  if (policy.localOnlyRequired) {
    return {
      route: "local",
      reason: "Strict local policy enforced.",
      requiresApproval: false,
      privacyRisk: "low",
      fallbackRoutes: ["device_mesh"],
    };
  }

  // 2. Long Running / Edge Twin Preference
  if (context.isLongRunning && policy.edgeTwinAllowed) {
    return {
      route: "edge_twin",
      reason: "Long-running workflow delegated to always-on Edge Twin.",
      requiresApproval: isSensitive,
      privacyRisk: isSensitive ? "high" : "medium",
      fallbackRoutes: ["cloud", "local"],
    };
  }

  // 3. High Complexity / Cloud Models
  const needsReasoning =
    policy.modalityNeeds.includes("reasoning") ||
    policy.modalityNeeds.includes("code");
  if (
    (context.taskComplexity === "high" || needsReasoning) &&
    policy.cloudAllowed
  ) {
    return {
      route: "cloud",
      reason:
        "Task requires advanced reasoning capabilities provided by cloud foundation models.",
      requiresApproval: policy.requireApprovalForCloud || isSensitive,
      privacyRisk: isSensitive ? "critical" : "medium",
      fallbackRoutes: ["edge_twin", "device_mesh", "local"],
    };
  }

  // 4. Default / Lightweight (Local or Device Mesh)
  if (policy.deviceMeshAllowed && context.taskComplexity === "medium") {
    return {
      route: "device_mesh",
      reason:
        "Task distributed to local device mesh to pool inference resources.",
      requiresApproval: false,
      privacyRisk: "low",
      fallbackRoutes: ["local"],
    };
  }

  return {
    route: "local",
    reason: "Task is lightweight and suitable for local inference.",
    requiresApproval: false,
    privacyRisk: "low",
    fallbackRoutes: ["device_mesh", "cloud"],
  };
}

export function useModelRouting(
  policy?: ModelRoutePolicy,
  currentTask?: string,
) {
  // In a real implementation, task complexity would be inferred dynamically or set by Mastra.
  // For the UI, we simulate the evaluation.
  const basePolicy: ModelRoutePolicy = policy || {
    policyId: "default",
    allowedRoutes: ["local", "device_mesh", "edge_twin", "cloud"],
    defaultRoute: "local",
    cloudAllowed: true,
    edgeTwinAllowed: true,
    deviceMeshAllowed: true,
    localOnlyRequired: false,
    requireApprovalForCloud: true,
    privacyClass: "personal",
    modalityNeeds: ["text"],
  };

  const decision = decideModelRoute(basePolicy, {
    taskComplexity: currentTask?.toLowerCase().includes("analyze")
      ? "high"
      : "low",
    hasNetwork: navigator.onLine !== false,
    isLongRunning:
      currentTask?.toLowerCase().includes("monitor") ||
      currentTask?.toLowerCase().includes("workflow"),
  });

  return { decision, policy: basePolicy };
}
