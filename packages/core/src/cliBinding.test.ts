import { describe, it, expect, vi } from "vitest";
import { executeIemCommand, ShellExecutor } from "./cliBinding";

const fakeExecutor: ShellExecutor = {
  execSync: vi.fn((cmd: string) => {
    if (cmd.includes("test-cmd")) return "Executed test-cmd successfully";
    if (cmd.includes("pr-prep")) return "Executed pr-prep";
    throw new Error(`Unexpected command: ${cmd}`);
  }),
};

describe("CLI Agent Tool Binding (Red/Green Phase)", () => {
  it("executes a known command successfully", async () => {
    const result = await executeIemCommand(
      "test-cmd",
      ["--param", "agent_test"],
      fakeExecutor,
    );
    expect(result.success).toBe(true);
    expect(result.output).toContain("Executed test-cmd");
  });

  it("adversarial: blocks execution if command fails (e.g. pr-prep with failing tests)", async () => {
    // In our binding, we might simulate a failure
    const result = await executeIemCommand("pr-prep", ["--fail"], fakeExecutor);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Command failed");
  });
});
