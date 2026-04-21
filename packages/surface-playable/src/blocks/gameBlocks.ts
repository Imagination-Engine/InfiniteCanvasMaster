import { z } from 'zod';
import type { BlockDefinition, MCPToolBinding } from '../types/protocol';

const noopAgent: MCPToolBinding = {
  kind: 'local',
  toolName: 'noop',
  invoke: async (input: unknown) => input,
};

const MockView = () => null;

export const sceneBlock: BlockDefinition<any, any> = {
  id: 'iem.playable.scene',
  name: 'Scene',
  description: 'A playable game scene',
  category: 'game',
  input: z.object({
    background: z.string(),
    width: z.number().optional().default(800),
    height: z.number().optional().default(600),
  }),
  output: z.object({
    sceneId: z.string(),
    status: z.enum(['ready', 'running', 'stopped']),
  }),
  view: MockView,
  agent: noopAgent,
  mode: 'triggered',
};

export const characterBlock: BlockDefinition<any, any> = {
  id: 'iem.playable.character',
  name: 'Character',
  description: 'A playable character entity',
  category: 'game',
  input: z.object({
    name: z.string(),
    asset: z.string(),
    x: z.number().default(0),
    y: z.number().default(0),
  }),
  output: z.object({
    entityId: z.string(),
    state: z.string(),
  }),
  view: MockView,
  agent: noopAgent,
  mode: 'triggered',
};

export const inputBlock: BlockDefinition<any, any> = {
  id: 'iem.playable.input',
  name: 'Input',
  description: 'Maps keyboard/mouse inputs',
  category: 'game',
  input: z.object({
    mapping: z.record(z.string(), z.string()),
  }),
  output: z.object({
    events: z.array(z.any()),
  }),
  view: MockView,
  agent: noopAgent,
  mode: 'streaming',
};

export const ruleBlock: BlockDefinition<any, any> = {
  id: 'iem.playable.rule',
  name: 'Rule',
  description: 'A logic rule for game behavior',
  category: 'game',
  input: z.object({
    condition: z.string(),
    action: z.string(),
  }),
  output: z.object({
    result: z.any(),
  }),
  view: MockView,
  agent: noopAgent,
  mode: 'triggered',
};