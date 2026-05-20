import { z } from "zod";
import type {
  StudioId,
  ModelAlias,
  SecurityClass,
  RuntimeKind,
} from "../studio/contracts";
export type BlockExecutionMode = "triggered" | "streaming" | "ambient";
export interface MCPToolBinding {
  kind: "local" | "remote";
  serverUrl?: string;
  toolName: string;
  defaultArgs?: Record<string, unknown>;
  invoke: (input: unknown) => Promise<unknown>;
}
export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
> {
  /** Unique identifier, reverse-DNS style, e.g. "iem.core.refiner" */
  id: string;
  /** Human-readable display name */
  name: string;
  /** One-line description for palette and AI discovery */
  description: string;
  /** High-level grouping */
  category:
    | "Intent & Planning"
    | "Agents & Swarms"
    | "Chat & Communication"
    | "Text & Knowledge"
    | "Generative Media"
    | "Studios"
    | "Runtime & Apps"
    | "Commerce & Intentcasting"
    | "Files & Data"
    | "System & Utility"
    | string;
  /**
   * @deprecated Use `studioAffinity` instead. Kept for backward compatibility.
   * Optional studio association (legacy loose string).
   */
  studio?:
    | "Agent Studio"
    | "Video Studio"
    | "Game Studio"
    | "Writer's Studio"
    | "App Creation Studio"
    | "Commerce Studio"
    | "Research Studio"
    | "Knowledge Studio"
    | "Launch Studio"
    | "Media Studio"
    | "Automation Studio"
    | string;
  /**
   * Formal studio binding using canonical StudioId(s).
   * A block may belong to one or more studios.
   */
  studioAffinity?: StudioId | StudioId[];
  /** Icon identifier (e.g. lucide name) */
  icon?: string;
  /** CSS color string or variable for branding */
  accent?: string;
  /** What kinds of data/types this block accepts */
  accepts?: string[];
  /** What kinds of data/types this block produces */
  produces?: string[];
  /** Whether this block has autonomous/agentic capabilities */
  agentic?: boolean;
  /** The type of runtime this block represents */
  runtime?: RuntimeKind;
  /** Which UI variant to use in the library drawer */
  libraryCardVariant?: string;
  /** Which UI variant to use on the canvas */
  canvasVariant?: string;
  /** Which UI variant to use when expanded immersively */
  expandedVariant?: string;
  /** If true, this block is choreographed/simulated (e.g. Commerce) */
  demoMode?: boolean;
  /** Input schema. Validates what arrives on the input edge. */
  input: TInput;
  /** Output schema. Validates what leaves on the output edge. */
  output: TOutput;
  /** MCP binding that performs the actual work. */
  agent: MCPToolBinding;
  /** How this block participates in execution. */
  mode: BlockExecutionMode;
  /** Optional: default parameters the user can override in the inspector. */
  defaults?: Record<string, unknown>;
  /** Optional: capability tags for the AI to reason about composition. */
  capabilities?: string[];
  /** Named model pointers (e.g. "fast-draft" → "gemini-2.5-flash") */
  modelAliases?: ModelAlias[];
  /** Tool mount IDs this block requires from the ToolMountRegistry */
  toolMountIds?: string[];
  /** Message fabric lanes this block participates in */
  fabricLanes?: string[];
  /** Security classification for isolation decisions */
  securityClass?: SecurityClass;
}
export interface BlockViewProps<I, O> {
  id: string;
  data: {
    params: Record<string, unknown>;
    input?: I;
    output?: O;
    status: "idle" | "running" | "streaming" | "done" | "error";
    error?: string;
  };
  onParamsChange: (params: Record<string, unknown>) => void;
  onRun: () => void;
}
//# sourceMappingURL=protocol.d.ts.map
