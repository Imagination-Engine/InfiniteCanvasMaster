export type MediaRef = {
  assetId: string;
  mimeType: string;
  url?: string;
  storageKey?: string;
  filename?: string;
  sizeBytes?: number;
};

export type ArtifactRef = {
  artifactId: string;
  assetId?: string;
  summary?: string;
};

export type A2AMessage = {
  id: string;
  fromAgentId: string;
  toAgentId?: string;
  role: "system" | "user" | "assistant" | "tool" | "agent";
  content: string | MultiModalContent[];
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type MultiModalContent =
  | { type: "text"; text: string }
  | { type: "image"; assetId: string }
  | { type: "audio"; assetId: string }
  | { type: "video"; assetId: string }
  | { type: "file"; assetId: string }
  | { type: "artifact"; artifactId: string };

export type RuntimeContextRef = {
  assetId: string;
  type: string;
};

export type ConductorItem = {
  json: Record<string, unknown>;
  binary?: Record<string, MediaRef>;
  context?: RuntimeContextRef[];
  messages?: A2AMessage[];
  artifacts?: ArtifactRef[];
};

export type RuntimeTrace = {
  previousEnvelopeIds: string[];
  parentRunId?: string;
  attempt: number;
  spanId: string;
  startedAt?: string;
  completedAt?: string;
};

export type ConductorEnvelope = {
  id: string;
  runId: string;
  graphId: string;
  sourceNodeId: string;
  targetNodeId?: string;

  type:
    | "data"
    | "prompt"
    | "tool_call"
    | "tool_result"
    | "agent_message"
    | "artifact"
    | "error"
    | "human_checkpoint";

  payload: unknown;

  item?: ConductorItem;
  trace: RuntimeTrace;
  createdAt: string;
};

export type ConductorRuntimeState = {
  runId: string;
  graphId: string;
  currentNodeId?: string;

  items: ConductorItem[];
  memory: Record<string, unknown>;
  variables: Record<string, unknown>;

  messages: A2AMessage[];
  artifacts: ArtifactRef[];
  errors: Error[];
};

export type RetryPolicy = {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier?: number;
};

export type CachePolicy = {
  enabled: boolean;
  ttlMs?: number;
  keyTemplate?: string;
};

export type ConductorPort = {
  id: string;
  name: string;
  direction: "input" | "output";
  dataType:
    | "any"
    | "json"
    | "text"
    | "prompt"
    | "image"
    | "audio"
    | "video"
    | "file"
    | "artifact"
    | "agent_message"
    | "tool_call"
    | "tool_result";
  schema?: Record<string, unknown>;
  required?: boolean;
};

export type ConductorNode = {
  id: string;
  canvasBlockId: string;
  kind:
    | "trigger"
    | "agent"
    | "prompt"
    | "tool"
    | "api"
    | "webhook"
    | "condition"
    | "transform"
    | "merge"
    | "loop"
    | "human_checkpoint"
    | "artifact"
    | "output";
  label: string;
  inputPorts: ConductorPort[];
  outputPorts: ConductorPort[];
  config: Record<string, unknown>;
  runtime: {
    timeoutMs?: number;
    retry?: RetryPolicy;
    cache?: CachePolicy;
    requiresHumanApproval?: boolean;
    allowedTools?: string[];
  };
};

export type ConditionExpression = {
  left: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "exists"
    | "matches";
  right?: unknown;
};

export type MappingExpression = {
  from: string;
  to: string;
};

export type TransformExpression = {
  mappings: MappingExpression[];
};

export type ConductorEdge = {
  id: string;
  graphId: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  condition?: ConditionExpression;
  transform?: TransformExpression;
  createdAt: string;
};

export type ConductorGraph = {
  id: string;
  canvasId: string;
  name: string;
  version: number;
  nodes: ConductorNode[];
  edges: ConductorEdge[];
  createdAt: string;
  updatedAt: string;
};

export type PromptState = {
  promptId: string;
  sourceNodeId: string;
  template: string;
  variables: Record<string, unknown>;
  rendered: string;
};

export type ToolManifest = {
  id: string;
  provider: "native" | "mcp" | "nango" | "composio" | "pipedream" | "custom";
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  authRequired: boolean;
  authScopes?: string[];
  safety: {
    requiresApproval: boolean;
    canSpendMoney: boolean;
    canSendMessage: boolean;
    canWriteExternalData: boolean;
    canDeleteData: boolean;
  };
};
