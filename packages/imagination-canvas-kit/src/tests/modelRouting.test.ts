import { describe, it, expect } from "vitest";
import {
  decideModelRoute,
  type ModelRoutePolicy,
} from "../hooks/useModelRouting";

describe("Model Routing & Compute Policy", () => {
  const basePolicy: ModelRoutePolicy = {
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

  it("should default to local for sensitive or personal tasks if complexity is low", () => {
    const decision = decideModelRoute(
      { ...basePolicy, privacyClass: "sensitive" },
      { taskComplexity: "low", hasNetwork: true },
    );
    expect(decision.route).toBe("local");
    expect(decision.requiresApproval).toBe(false);
  });

  it("should route to cloud but require approval for complex reasoning tasks", () => {
    const decision = decideModelRoute(
      { ...basePolicy, modalityNeeds: ["reasoning"] },
      { taskComplexity: "high", hasNetwork: true },
    );
    expect(decision.route).toBe("cloud");
    expect(decision.requiresApproval).toBe(true);
    expect(decision.reason).toContain("requires advanced reasoning");
  });

  it("should block cloud routing if localOnlyRequired is true", () => {
    const decision = decideModelRoute(
      { ...basePolicy, localOnlyRequired: true, modalityNeeds: ["reasoning"] },
      { taskComplexity: "high", hasNetwork: true },
    );
    // Even though it's complex, localOnly forces it to try local or fail gracefully
    expect(decision.route).not.toBe("cloud");
    expect(decision.route).toBe("local");
  });

  it("should route to edge_twin for long-running workflows", () => {
    const decision = decideModelRoute(basePolicy, {
      taskComplexity: "medium",
      isLongRunning: true,
      hasNetwork: true,
    });
    expect(decision.route).toBe("edge_twin");
    expect(decision.reason).toContain("always-on");
  });

  it("should fall back to local if no network is available", () => {
    const decision = decideModelRoute(
      { ...basePolicy, modalityNeeds: ["reasoning"] },
      { taskComplexity: "high", hasNetwork: false },
    );
    expect(decision.route).toBe("local");
    expect(decision.reason).toContain("offline");
  });
});
