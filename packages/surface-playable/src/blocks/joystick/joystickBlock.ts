import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const joystickInput = z.object({
  target_entity: z
    .string()
    .optional()
    .describe("The ID of the physicsEntity or sprite this joystick controls"),
  control_scheme: z.enum(["d-pad", "analog", "wasd"]).default("d-pad"),
});

export const joystickOutput = z.object({
  x: z.number().describe("Horizontal axis from -1.0 to 1.0"),
  y: z.number().describe("Vertical axis from -1.0 to 1.0"),
  active: z
    .boolean()
    .describe("True if the joystick is currently being interacted with"),
  jumpPressed: z.boolean().describe("True if the jump action is triggered"),
});

export const joystickBlock: BlockDefinition<
  typeof joystickInput,
  typeof joystickOutput
> = {
  id: "iem.playable.joystick",
  name: "Joystick Controller",
  description:
    "Captures player input (analog stick or D-pad) and outputs movement vectors.",
  category: "playable",
  input: joystickInput,
  output: joystickOutput,
  mode: "ambient", // Ambient because it constantly emits state
  agent: {
    kind: "local",
    toolName: "execute_joystick",
    invoke: async (input: any) => {
      // In a real game loop, this would parse live hardware/DOM events.
      // For the orchestrator validation, we just return a neutral state.
      return {
        x: 0,
        y: 0,
        active: false,
        jumpPressed: false,
      };
    },
  },
};
