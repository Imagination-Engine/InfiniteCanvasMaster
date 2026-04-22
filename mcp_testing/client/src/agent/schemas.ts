import Ajv from "ajv";

export type AgentGraphNode = {
  id: string;
  type: string;
  label: string;
  description?: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  config?: Record<string, unknown>;
  metadata?: {
    category: "creative" | "workflow";
  };
};

export type AgentGraphEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, unknown>;
};

export type PlannerGraph = {
  nodes: AgentGraphNode[];
  edges: AgentGraphEdge[];
};

export type EvaluatorIssue = {
  type: string;
  description: string;
};

export type EvaluatorResult = {
  issues: EvaluatorIssue[];
  isValid: boolean;
};

export type MissingCapability = {
  name: string;
  description: string;
  reason: string;
};

export type CapabilityAnalysis = {
  missingCapabilities: MissingCapability[];
};

export type IntegrationProposal = {
  integrationName: string;
  requiredFromUser: [string, string, string];
};

const objectRecordSchema = {
  type: "object",
  additionalProperties: true,
} as const;

const graphNodeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type", "label", "inputs"],
  properties: {
    id: { type: "string", minLength: 1 },
    type: { type: "string", minLength: 1 },
    label: { type: "string", minLength: 1 },
    description: { type: "string", nullable: true },
    inputs: objectRecordSchema,
    outputs: {
      ...objectRecordSchema,
      nullable: true,
    },
    config: {
      ...objectRecordSchema,
      nullable: true,
    },
    metadata: {
      type: "object",
      nullable: true,
      additionalProperties: false,
      required: ["category"],
      properties: {
        category: { type: "string", enum: ["creative", "workflow"] },
      },
    },
  },
} as const;

const graphEdgeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "source", "target"],
  properties: {
    id: { type: "string", minLength: 1 },
    source: { type: "string", minLength: 1 },
    target: { type: "string", minLength: 1 },
    sourceHandle: { type: "string", nullable: true },
    targetHandle: { type: "string", nullable: true },
    type: { type: "string", nullable: true },
    data: {
      ...objectRecordSchema,
      nullable: true,
    },
  },
} as const;

export const plannerGraphSchema = {
  type: "object",
  additionalProperties: false,
  required: ["nodes", "edges"],
  properties: {
    nodes: {
      type: "array",
      items: graphNodeSchema,
    },
    edges: {
      type: "array",
      items: graphEdgeSchema,
    },
  },
} as const;

export const evaluatorSchema = {
  type: "object",
  additionalProperties: false,
  required: ["issues", "isValid"],
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "description"],
        properties: {
          type: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 1 },
        },
      },
    },
    isValid: { type: "boolean" },
  },
} as const;

export const capabilitySchema = {
  type: "object",
  additionalProperties: false,
  required: ["missingCapabilities"],
  properties: {
    missingCapabilities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description", "reason"],
        properties: {
          name: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 1 },
          reason: { type: "string", minLength: 1 },
        },
      },
    },
  },
} as const;

export const integrationProposalSchema = {
  type: "object",
  additionalProperties: false,
  required: ["integrationName", "requiredFromUser"],
  properties: {
    integrationName: { type: "string", minLength: 1 },
    requiredFromUser: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 3,
      maxItems: 3,
    },
  },
} as const;

const ajv = new Ajv({ allErrors: true });

export function validateSchema<T>(schema: object, value: unknown): T {
  const validate = ajv.compile(schema);
  const valid = validate(value);
  if (!valid) {
    const errors = validate.errors?.map((error) => `${error.dataPath || "/"} ${error.message ?? "invalid"}`) ?? [];
    throw new Error(`Schema validation failed: ${errors.join("; ")}`);
  }

  return value as T;
}
