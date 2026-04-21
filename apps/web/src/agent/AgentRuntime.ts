import { hasCompatibleSchemaTypes } from "../nodes/types";
import type { NodeRegistryType } from "../nodes/NodeRegistry";
import {
  capabilitySchema,
  evaluatorSchema,
  integrationProposalSchema,
  plannerGraphSchema,
  type CapabilityAnalysis,
  type EvaluatorIssue,
  type EvaluatorResult,
  type IntegrationProposal,
  type PlannerGraph,
} from "./schemas";
import {
  capabilitySystemPrompt,
  evaluatorSystemPrompt,
  integrationProposalSystemPrompt,
  plannerSystemPrompt,
  refinerSystemPrompt,
} from "./prompts";
import { callLLM } from "../services/llm/ollamaClient";

export type AgentRuntimeResult = {
  graph: PlannerGraph;
  evaluation: EvaluatorResult;
  missingCapabilities: CapabilityAnalysis["missingCapabilities"];
  integrationProposals: IntegrationProposal[];
};

const serializeRegistry = (nodeRegistry: NodeRegistryType) =>
  Object.entries(nodeRegistry).map(([type, definition]) => ({
    type,
    category: definition.category,
    role: definition.role ?? "tool",
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
  }));

const localGraphChecks = (
  graph: PlannerGraph,
  nodeRegistry: NodeRegistryType,
  query: string,
): EvaluatorIssue[] => {
  const issues: EvaluatorIssue[] = [];
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  for (const node of graph.nodes) {
    const def = nodeRegistry[node.type];
    if (!def) {
      issues.push({
        type: "invalid_node_type",
        description: `Node ${node.id} uses unsupported type '${node.type}'.`,
      });
      continue;
    }

    for (const requiredInput of Object.keys(def.inputSchema)) {
      if (!(requiredInput in (node.inputs ?? {}))) {
        issues.push({
          type: "missing_required_input",
          description: `Node ${node.id} (${node.type}) is missing input '${requiredInput}'.`,
        });
      }
    }
  }

  for (const edge of graph.edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) {
      issues.push({
        type: "invalid_edge_reference",
        description: `Edge ${edge.id} references missing source/target nodes.`,
      });
      continue;
    }

    const sourceDef = nodeRegistry[sourceNode.type];
    const targetDef = nodeRegistry[targetNode.type];
    if (!sourceDef || !targetDef) {
      continue;
    }

    if (!hasCompatibleSchemaTypes(sourceDef.outputSchema, targetDef.inputSchema)) {
      issues.push({
        type: "type_mismatch",
        description: `Edge ${edge.id} is incompatible from ${sourceNode.type} to ${targetNode.type}.`,
      });
    }
  }

  const containsWorkflowNodes = graph.nodes.some((node) => nodeRegistry[node.type]?.category === "workflow");
  const hasTrigger = graph.nodes.some((node) => nodeRegistry[node.type]?.role === "trigger");
  const triggerHint = /every|schedule|trigger|when|webhook|cron|slack message|calendly/i.test(query);

  if (containsWorkflowNodes && triggerHint && !hasTrigger) {
    issues.push({
      type: "missing_trigger",
      description: "Workflow intent appears event/schedule-based but graph has no trigger node.",
    });
  }

  const seen = new Set<string>();
  for (const node of graph.nodes) {
    const signature = `${node.type}:${JSON.stringify(node.inputs ?? {})}`;
    if (seen.has(signature)) {
      issues.push({
        type: "redundant_step",
        description: `Redundant step detected for node type ${node.type}.`,
      });
      break;
    }
    seen.add(signature);
  }

  return issues;
};

export class AgentRuntime {
  async generateWorkflow(query: string, nodeRegistry: NodeRegistryType): Promise<AgentRuntimeResult> {
    const registry = serializeRegistry(nodeRegistry);

    const plannerPrompt = [
      "Generate workflow graph for user query.",
      `USER_QUERY: ${query}`,
      `AVAILABLE_NODE_TYPES: ${JSON.stringify(registry)}`,
      "Return schema: {nodes: BaseNodeData[], edges: Edge[]}",
    ].join("\n");

    let graph = await callLLM<PlannerGraph>({
      systemPrompt: plannerSystemPrompt,
      userPrompt: plannerPrompt,
      schema: plannerGraphSchema,
    });

    let evaluation = await this.evaluateGraph(query, graph, nodeRegistry, registry);

    for (let i = 0; i < 2 && !evaluation.isValid; i += 1) {
      const refinerPrompt = [
        `USER_QUERY: ${query}`,
        `AVAILABLE_NODE_TYPES: ${JSON.stringify(registry)}`,
        `CURRENT_GRAPH: ${JSON.stringify(graph)}`,
        `ISSUES: ${JSON.stringify(evaluation.issues)}`,
        "Return refined graph using same schema as planner.",
      ].join("\n");

      graph = await callLLM<PlannerGraph>({
        systemPrompt: refinerSystemPrompt,
        userPrompt: refinerPrompt,
        schema: plannerGraphSchema,
      });

      evaluation = await this.evaluateGraph(query, graph, nodeRegistry, registry);
      if (evaluation.isValid) {
        break;
      }
    }

    if (!evaluation.isValid) {
      throw new Error(`Unable to produce valid workflow graph. Issues: ${JSON.stringify(evaluation.issues)}`);
    }

    const capabilityPrompt = [
      `USER_QUERY: ${query}`,
      `VALIDATED_GRAPH: ${JSON.stringify(graph)}`,
      `AVAILABLE_NODE_TYPES: ${JSON.stringify(registry)}`,
      "Return only missing capabilities that cannot be satisfied by available nodes.",
    ].join("\n");

    const capabilityResult = await callLLM<CapabilityAnalysis>({
      systemPrompt: capabilitySystemPrompt,
      userPrompt: capabilityPrompt,
      schema: capabilitySchema,
    });

    const integrationProposals: IntegrationProposal[] = [];
    for (const missing of capabilityResult.missingCapabilities) {
      const proposalPrompt = [
        `MISSING_CAPABILITY: ${JSON.stringify(missing)}`,
        "Generate one integration requirement object.",
        "requiredFromUser must be exactly: example_api_request, example_api_response, authentication_type",
      ].join("\n");

      const proposal = await callLLM<IntegrationProposal>({
        systemPrompt: integrationProposalSystemPrompt,
        userPrompt: proposalPrompt,
        schema: integrationProposalSchema,
      });

      integrationProposals.push(proposal);
    }

    return {
      graph,
      evaluation,
      missingCapabilities: capabilityResult.missingCapabilities,
      integrationProposals,
    };
  }

  private async evaluateGraph(
    query: string,
    graph: PlannerGraph,
    nodeRegistry: NodeRegistryType,
    serializedRegistry: unknown,
  ): Promise<EvaluatorResult> {
    const evaluatorPrompt = [
      `USER_QUERY: ${query}`,
      `GRAPH: ${JSON.stringify(graph)}`,
      `AVAILABLE_NODE_TYPES: ${JSON.stringify(serializedRegistry)}`,
      "Evaluate graph quality and validity.",
    ].join("\n");

    const llmEval = await callLLM<EvaluatorResult>({
      systemPrompt: evaluatorSystemPrompt,
      userPrompt: evaluatorPrompt,
      schema: evaluatorSchema,
    });

    const localIssues = localGraphChecks(graph, nodeRegistry, query);
    const mergedIssues = [...llmEval.issues, ...localIssues];

    return {
      issues: mergedIssues,
      isValid: mergedIssues.length === 0,
    };
  }
}
