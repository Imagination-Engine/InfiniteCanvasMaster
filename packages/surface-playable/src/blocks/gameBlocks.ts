import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

export const joystickBlock: BlockDefinition<any, any> = {
  id: "iem.playable.joystick",
  name: "Joystick",
  description: "Input control for entities.",
  category: "game",
  input: z.object({ sensitivity: z.number().default(1) }),
  output: z.object({ x: z.number(), y: z.number() }),
  mode: "streaming",
  agent: {
    kind: "local",
    toolName: "joy_input",
    invoke: async () => ({ x: 0, y: 0 }),
  },
};

export const colliderBlock: BlockDefinition<any, any> = {
  id: "iem.playable.collider",
  name: "Collider",
  description: "Physics collision logic.",
  category: "game",
  input: z.object({ targetA: z.string(), targetB: z.string() }),
  output: z.object({ collided: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "col_check",
    invoke: async () => ({ collided: false }),
  },
};

export const scoreBlock: BlockDefinition<any, any> = {
  id: "iem.playable.score",
  name: "Score",
  description: "Manage game scoring.",
  category: "game",
  input: z.object({ increment: z.number().default(1) }),
  output: z.object({ currentScore: z.number() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "score_op",
    invoke: async () => ({ currentScore: 0 }),
  },
};

export const spawnerBlock: BlockDefinition<any, any> = {
  id: "iem.playable.spawner",
  name: "Spawner",
  description: "Entity spawning factory.",
  category: "game",
  input: z.object({ entityType: z.string(), rate: z.number().default(1) }),
  output: z.object({ entityId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "spawn_op",
    invoke: async () => ({ entityId: "e_1" }),
  },
};

export const timerBlock: BlockDefinition<any, any> = {
  id: "iem.playable.timer",
  name: "Timer",
  description: "Countdown and event timing.",
  category: "game",
  input: z.object({ duration: z.number() }),
  output: z.object({ complete: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "timer_op",
    invoke: async () => ({ complete: true }),
  },
};

export const cameraBlock: BlockDefinition<any, any> = {
  id: "iem.playable.camera",
  name: "Camera",
  description: "Game camera perspective.",
  category: "game",
  input: z.object({
    targetId: z.string().optional(),
    zoom: z.number().default(1),
  }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "cam_op",
    invoke: async () => ({ success: true }),
  },
};

export const lightingBlock: BlockDefinition<any, any> = {
  id: "iem.playable.lighting",
  name: "Lighting",
  description: "Game world lighting.",
  category: "game",
  input: z.object({ intensity: z.number(), color: z.string() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "light_op",
    invoke: async () => ({ success: true }),
  },
};

export const audioBlock: BlockDefinition<any, any> = {
  id: "iem.playable.audio",
  name: "Audio",
  description: "Sound effects and music.",
  category: "game",
  input: z.object({ asset: z.string(), volume: z.number().default(1) }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "audio_op",
    invoke: async () => ({ success: true }),
  },
};

export const particleBlock: BlockDefinition<any, any> = {
  id: "iem.playable.particle",
  name: "Particle",
  description: "Visual particle effects.",
  category: "game",
  input: z.object({ type: z.string(), count: z.number() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "vfx_op",
    invoke: async () => ({ success: true }),
  },
};

export const spriteBlock: BlockDefinition<any, any> = {
  id: "iem.playable.sprite",
  name: "Sprite",
  description: "Visual game entity.",
  category: "game",
  input: z.object({ asset: z.string() }),
  output: z.object({ entityId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "sprite_op",
    invoke: async () => ({ entityId: "s_1" }),
  },
};

export const physicsEntityBlock: BlockDefinition<any, any> = {
  id: "iem.playable.physicsEntity",
  name: "Physics Entity",
  description: "Rigid body physics object.",
  category: "game",
  input: z.object({ mass: z.number() }),
  output: z.object({ bodyId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "phys_op",
    invoke: async () => ({ bodyId: "b_1" }),
  },
};

export const inputBlock: BlockDefinition<any, any> = {
  id: "iem.playable.input",
  name: "Input",
  description: "Maps keyboard/mouse inputs.",
  category: "game",
  input: z.object({ mapping: z.record(z.string()) }),
  output: z.object({ events: z.array(z.any()) }),
  mode: "streaming",
  agent: {
    kind: "local",
    toolName: "raw_input",
    invoke: async () => ({ events: [] }),
  },
};

export const ruleBlock: BlockDefinition<any, any> = {
  id: "iem.playable.rule",
  name: "Rule",
  description: "Logic rule for game behavior.",
  category: "game",
  input: z.object({ condition: z.string(), action: z.string() }),
  output: z.object({ result: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "rule_op",
    invoke: async () => ({ result: true }),
  },
};

export const sceneBlock: BlockDefinition<any, any> = {
  id: "iem.playable.scene",
  name: "Scene",
  description: "Define visual environment.",
  category: "media",
  input: z.object({
    background: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  output: z.object({ sceneId: z.string(), status: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_scene",
    invoke: async () => ({ sceneData: {} }),
  },
};

export const characterBlock: BlockDefinition<any, any> = {
  id: "iem.playable.character",
  name: "Character",
  description: "Visual character in scene.",
  category: "media",
  input: z.object({
    name: z.string(),
    asset: z.string(),
    x: z.number(),
    y: z.number(),
  }),
  output: z.object({ characterId: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "gen_char",
    invoke: async () => ({ characterId: "char_1" }),
  },
};
