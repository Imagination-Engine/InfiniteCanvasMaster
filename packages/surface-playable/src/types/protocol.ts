import { z } from 'zod';
import type { ComponentType } from 'react';

export type BlockExecutionMode = 'triggered' | 'streaming' | 'ambient';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  serverUrl?: string;
  toolName: string;
  defaultArgs?: Record<string, unknown>;
  invoke: (input: unknown) => Promise<unknown>;
}

export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny
> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  view: ComponentType<any>;
  agent: MCPToolBinding;
  mode: BlockExecutionMode;
  defaults?: Record<string, unknown>;
  capabilities?: string[];
}