export function serializeCanvasToBalnceSpec(reactFlowRawObj: any) {
  const cleanNodes = reactFlowRawObj.nodes.map((rfNode: any) => {
    return {
      id: rfNode.id,
      type: mapToSemanticType(rfNode.type),
      x: rfNode.position.x,
      y: rfNode.position.y,
      width: rfNode.width,
      height: rfNode.height,
      payload: rfNode.data 
    };
  });

  const cleanEdges = reactFlowRawObj.edges.map((rfEdge: any) => {
    return {
      id: rfEdge.id,
      from: rfEdge.source,
      to: rfEdge.target,
      label: rfEdge.label || "connected_to"
    };
  });

  return { nodes: cleanNodes, edges: cleanEdges };
}

function mapToSemanticType(reactFlowType: string) {
    if (reactFlowType === 'action') return 'agent_action';
    if (reactFlowType === 'audioRecording') return 'media_audio';
    if (reactFlowType === 'trigger') return 'trigger';
    if (reactFlowType === 'filter') return 'logic_filter';
    if (reactFlowType === 'link') return 'external_link';
    // default adapter fallback
    return reactFlowType || 'generic';
}
