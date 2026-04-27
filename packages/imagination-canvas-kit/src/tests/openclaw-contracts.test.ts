import { describe, it, expect } from "vitest";
import { OpenClawBlock } from "../contracts/openclaw";

describe("OpenClaw Contracts", () => {
  it("should allow creating a partial OpenClawBlock for type checking", () => {
    const block: Partial<OpenClawBlock> = {
      type: "openclaw.block",
      state: {
        status: "unconfigured",
      },
      policy: {
        sandboxMode: "strict",
        approvalRequiredFor: ["shell"],
        deniedTools: [],
        allowedTools: [],
        deniedSkills: [],
        allowedSkills: [],
        requireHumanApprovalForExternalMessages: true,
        requireHumanApprovalForFileWrites: true,
        requireHumanApprovalForShell: true,
        requireHumanApprovalForPurchases: true,
        requireHumanApprovalForCredentialAccess: true,
      },
    };

    expect(block.type).toBe("openclaw.block");
    expect(block.state?.status).toBe("unconfigured");
    expect(block.policy?.sandboxMode).toBe("strict");
  });
});
