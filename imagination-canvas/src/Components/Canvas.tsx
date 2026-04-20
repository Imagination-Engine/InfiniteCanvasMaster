import {
  useCallback,
  useEffect,
  useMemo,
  type DragEvent,
  type MouseEvent,
} from "react";
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, useReactFlow } from "@xyflow/react";
import type { Connection, IsValidConnection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import IntentcastingBar from "./IntentcastingBar";
import { useState } from "react";
import { REACT_FLOW_NODE_TYPES, getNodeDefinition, NODE_REGISTRY } from "../nodes/NodeRegistry";
import AgentExecutionNode from "../nodes/AgentExecutionNode";
import { AgentRuntime } from "../agent/AgentRuntime";
import { parseAgentGraph } from "../agent/agentParser";

const EXTENDED_NODE_TYPES = {
  ...REACT_FLOW_NODE_TYPES,
  agentExecution: AgentExecutionNode,
};
import { createNodeFromType } from "../nodes/nodeFactory";
import { hasCompatibleSchemaTypes } from "../nodes/types";
import type { UnifiedCanvasDocument, UnifiedCanvasEdge, UnifiedCanvasNode } from "../nodes/canvasTypes";
import { DEFAULT_CANVAS_DOCUMENT } from "../nodes/canvasTypes";
import type { ParsedAgentGraph } from "../agent/agentParser";
import { getNodeInputs, toWorkflowNodeJson } from "../nodes/workflow/inputResolution";
import { getRuntimeState, syncRuntimeOutputsFromNodes } from "../nodes/workflow/runtimeState";
import type { WorkflowEdge } from "../nodes/workflow/types";

const normalizeNode = (node: UnifiedCanvasNode): UnifiedCanvasNode => {
  const definition = getNodeDefinition(node.type ?? "");
  if (!definition) {
    const fallback = createNodeFromType("summarizer", node.position ?? { x: 0, y: 0 });
    return {
      ...fallback,
      id: node.id,
      data: {
        ...fallback.data,
        id: node.id,
        label: (node.data as { label?: string } | undefined)?.label ?? "Imported Node",
        inputs: {
          source: JSON.stringify(node.data ?? {}),
        },
      },
    };
  }

  const incomingData = (node.data ?? {}) as Record<string, unknown>;

  return {
    ...node,
    type: node.type,
    data: {
      ...definition.defaultData,
      ...(incomingData as object),
      id: node.id,
      type: node.type,
      inputs: {
        ...definition.defaultData.inputs,
        ...(typeof incomingData.inputs === "object" && incomingData.inputs
          ? (incomingData.inputs as Record<string, unknown>)
          : {}),
      },
      outputs: {
        ...(definition.defaultData.outputs ?? {}),
        ...(typeof incomingData.outputs === "object" && incomingData.outputs
          ? (incomingData.outputs as Record<string, unknown>)
          : {}),
      },
      config: {
        ...(definition.defaultData.config ?? {}),
        ...(typeof incomingData.config === "object" && incomingData.config
          ? (incomingData.config as Record<string, unknown>)
          : {}),
      },
      metadata: {
        ...(definition.defaultData.metadata ?? {}),
        ...(typeof incomingData.metadata === "object" && incomingData.metadata
          ? (incomingData.metadata as Record<string, unknown>)
          : {}),
        label: (incomingData.label as string | undefined) ?? definition.defaultData.label,
        description: (incomingData.description as string | undefined) ?? definition.defaultData.description,
      },
    },
  };
};

const normalizeEdge = (edge: UnifiedCanvasEdge): UnifiedCanvasEdge => {
  const fallbackEdge: WorkflowEdge = {
    id: edge.id || `edge-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  };

  return {
    ...edge,
    ...fallbackEdge,
    type: edge.type ?? "default",
  };
};

const normalizeDocument = (document: UnifiedCanvasDocument | null | undefined): UnifiedCanvasDocument => {
  if (!document) {
    return DEFAULT_CANVAS_DOCUMENT;
  }

  const nodes = (document.nodes ?? []).map((node) => normalizeNode(node as UnifiedCanvasNode));
  const edges = (document.edges ?? []).map((edge) => normalizeEdge(edge as UnifiedCanvasEdge));
  const viewport = document.viewport ?? DEFAULT_CANVAS_DOCUMENT.viewport;

  return { nodes, edges, viewport };
};

type CanvasProps = {
  initialDocument?: UnifiedCanvasDocument | null;
  onDocumentChange?: (document: UnifiedCanvasDocument) => void;
};

export default function Canvas({
  initialDocument = null,
  onDocumentChange,
}: CanvasProps = {}) {
  const normalizedInitial = useMemo(() => normalizeDocument(initialDocument), [initialDocument]);

  const [nodes, setNodes, onNodesChange] = useNodesState(normalizedInitial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(normalizedInitial.edges);
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

  // Initialize canvas from prop
  useEffect(() => {
    const normalized = normalizeDocument(initialDocument);
    setNodes(normalized.nodes);
    setEdges(normalized.edges);
    void setViewport(normalized.viewport);
  }, [initialDocument, setEdges, setNodes, setViewport]);

  useEffect(() => {
    if (!onDocumentChange) return;

    onDocumentChange({
      nodes: nodes as UnifiedCanvasDocument["nodes"],
      edges: edges as UnifiedCanvasDocument["edges"],
      viewport: getViewport(),
    });
  }, [nodes, edges, getViewport, onDocumentChange]);

  useEffect(() => {
    syncRuntimeOutputsFromNodes(nodes as UnifiedCanvasNode[]);
  }, [nodes]);

  const isConnectionAllowed = useCallback<IsValidConnection>((connection) => {
    if (connection.source === connection.target) {
      return false;
    }
    
    if (!connection.source || !connection.target) {
      return false;
    }

    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    if (!sourceNode || !targetNode) {
      return false;
    }

    const sourceDefinition = getNodeDefinition(sourceNode.type ?? "");
    const targetDefinition = getNodeDefinition(targetNode.type ?? "");
    if (!sourceDefinition || !targetDefinition) {
      return false;
    }

    if (Object.keys(targetDefinition.inputSchema).length === 0) {
      return false;
    }

    return hasCompatibleSchemaTypes(sourceDefinition.outputSchema, targetDefinition.inputSchema);
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isConnectionAllowed(connection)) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceDefinition = sourceNode ? getNodeDefinition(sourceNode.type ?? "") : null;
      const firstOutputType = sourceDefinition ? Object.values(sourceDefinition.outputSchema)[0] : undefined;

      setEdges((current) =>
        addEdge(
          {
            ...connection,
            data: {
              valueType: Array.isArray(firstOutputType) ? firstOutputType[0] : firstOutputType,
            },
            type: "default",
          },
          current,
        ),
      );
    },
    [isConnectionAllowed, nodes, setEdges],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const explicitNodePayload = event.dataTransfer.getData("application/reactflow-node");
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType || !getNodeDefinition(nodeType)) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const node = createNodeFromType(nodeType, position);

      if (explicitNodePayload) {
        try {
          const parsed = JSON.parse(explicitNodePayload) as {
            nodeType?: string;
            data?: Record<string, unknown>;
          };

          if (parsed.nodeType === nodeType && parsed.data) {
            node.data = {
              ...node.data,
              ...parsed.data,
              inputs: {
                ...node.data.inputs,
                ...((parsed.data.inputs as Record<string, unknown> | undefined) ?? {}),
              },
              outputs: {
                ...(node.data.outputs ?? {}),
                ...((parsed.data.outputs as Record<string, unknown> | undefined) ?? {}),
              },
              config: {
                ...(node.data.config ?? {}),
                ...((parsed.data.config as Record<string, unknown> | undefined) ?? {}),
              },
            };
          }
        } catch {
          // Invalid payload should not block standard node creation.
        }
      }

      setNodes((current) => [...current, node]);
    },
    [screenToFlowPosition, setNodes],
  );

  const applyAgentGraph = useCallback((graph: ParsedAgentGraph) => {
    setNodes((current) => [...current, ...graph.nodes]);
    setEdges((current) => [...current, ...graph.edges]);
  }, [setEdges, setNodes]);

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: UnifiedCanvasNode) => {
      const runtimeState = getRuntimeState();
      const inputs = getNodeInputs(node.id, nodes as UnifiedCanvasNode[], edges as UnifiedCanvasEdge[], runtimeState);
      const outputs = runtimeState[node.id]?.outputs ?? toWorkflowNodeJson(node).outputs;
      const nodeJson = toWorkflowNodeJson(node);

      console.group("NODE DEBUG");
      console.log(`id: "${node.id}"`);
      console.log(`type: "${node.type}"`);
      console.log("nodeData:", nodeJson);
      console.log("inputs:", inputs);
      console.log("outputs:", outputs);
      console.groupEnd();
    },
    [nodes, edges],
  );

  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const runtime = useMemo(() => new AgentRuntime(), []);

  const handleIntentSubmit = async (prompt: string) => {
    if (!prompt.trim() || isOrchestrating) return;
    setIsOrchestrating(true);
    
    const tempId = `agent-execution-${Date.now()}`;
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 500;
    const position = screenToFlowPosition({ x: centerX - 150, y: centerY - 50 });
    
    setNodes((curr) => [...curr, {
      id: tempId,
      type: "agentExecution",
      position,
      data: { prompt }
    } as any]);

    try {
      const result = await runtime.generateWorkflow(prompt, NODE_REGISTRY);

      setNodes((curr) => curr.filter((n) => n.id !== tempId));

      if (result.missingCapabilities.length > 0) {
        console.warn("Integration required:", result.missingCapabilities);
        // We could spawn an agent terminal node here in the future
      } else {
        const parsed = parseAgentGraph(result.graph, position.x, position.y);
        applyAgentGraph(parsed);
      }
    } catch (error) {
      console.error("Orchestration failed:", error);
      setNodes((curr) => curr.filter((n) => n.id !== tempId));
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="relative flex-1 bg-brand-bg-page overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={EXTENDED_NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isConnectionAllowed}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        colorMode="dark"
      >
        <Background 
          gap={24} 
          size={1} 
          color="rgba(255, 255, 255, 0.08)" 
          variant={undefined} /* use dots by default in RF12 if not specified, or just customize style */
          className="opacity-50"
        />
        <Controls className="!bg-brand-bg-surface/80 !border-white/10 !rounded-xl !overflow-hidden !shadow-2xl !fill-white" />
        <MiniMap 
          nodeStrokeWidth={2} 
          pannable 
          zoomable 
          className="!border-white/10 !bg-brand-bg-surface/40 !backdrop-blur-xl !rounded-2xl !overflow-hidden !shadow-2xl"
          maskColor="rgba(0, 0, 0, 0.3)"
          nodeColor="rgba(123, 92, 234, 0.2)"
        />
      </ReactFlow>

      <IntentcastingBar onSubmit={handleIntentSubmit} isLoading={isOrchestrating} />
    </div>
  );
}
