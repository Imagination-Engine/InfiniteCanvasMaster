import { describe, it, expect } from "vitest";
import { joystickBlock } from "./joystickBlock";

describe("Joystick Block (Red/Green Phase)", () => {
  it("has valid metadata and schema", () => {
    expect(joystickBlock.id).toBe("iem.playable.joystick");
    expect(joystickBlock.name).toBe("Joystick Controller");

    const validIn = { control_scheme: "d-pad" };
    expect(joystickBlock.input.parse(validIn)).toMatchObject(validIn);
  });

  it("executes agent binding successfully", async () => {
    const result = await joystickBlock.agent.invoke({
      control_scheme: "d-pad",
    });
    expect(result.active).toBe(false);
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => joystickBlock.input.parse({ control_scheme: 123 })).toThrow();
  });
});
