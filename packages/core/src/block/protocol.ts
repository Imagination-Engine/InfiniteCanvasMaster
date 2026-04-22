import { z } from 'zod';
import type { ComponentType } from 'react';

export type BlockExecutionMode = 'triggered' | 'streaming' | 'ambient';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  serverUrl?: string;           // for remote
  toolName: string;
  defaultArgs?: Record<string, unknown>;
  invoke: (input: unknown) => Promise<unknown>;
}

export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny
> {
  /** Unique identifier, reverse-DNS style, e.g. "iem.core.refiner" */
  id: string;

  /** Human-readable display name */
  name: string;

  /** One-line description for palette and AI discovery */
  description: string;

  /** Category for palette grouping */
  category: 'text' | 'image' | 'audio' | 'video' | 'code' | 'data' | 'io' | 'meta' | string;

  /** Input schema. Validates what arrives on the input edge. */
  input: TInput;

  /** Output schema. Validates what leaves on the output edge. */
  output: TOutput;

  /** React component rendered inside React Flow. */
  view: ComponentType<BlockViewProps<z.infer<TInput>, z.infer<TOutput>>>;

  /** MCP binding that performs the actual work. */
  agent: MCPToolBinding;

  /** How this block participates in execution. */
  mode: BlockExecutionMode;

  /** Optional: default parameters the user can override in the inspector. */
  defaults?: Record<string, unknown>;

  /** Optional: capability tags for the AI to reason about composition. */
  capabilities?: string[];
}

export interface BlockViewProps<I, O> {
  id: string;
  data: {
    params: Record<string, unknown>;
    input?: I;
    output?: O;
    status: 'idle' | 'running' | 'streaming' | 'done' | 'error';
    error?: string;
  };
  onParamsChange: (params: Record<string, unknown>) => void;
  onRun: () => void;
}
