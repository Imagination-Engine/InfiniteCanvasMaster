import { Workflow, createStep } from '@mastra/core/workflows';
import { blockRegistry } from '@iem/core';
import { z } from 'zod';
export function compileGraphToWorkflow(graph) {
    const workflow = new Workflow({
        id: `canvas-workflow-${Date.now()}`,
        inputSchema: z.record(z.string(), z.any()).optional(),
        outputSchema: z.any(),
    });
    const steps = new Map();
    // 1. Define all steps dynamically
    for (const node of graph.nodes) {
        const blockDef = blockRegistry.get(node.type || node.blockId);
        if (!blockDef) {
            console.warn(`Block definition not found for node type: ${node.type || node.blockId}`);
            continue;
        }
        const step = createStep({
            id: node.id,
            description: blockDef.description || 'Canvas Block',
            inputSchema: z.any(),
            outputSchema: z.any(),
            execute: async ({ inputData, mastra, getStepResult, getInitData }) => {
                // Gather inputs from previous steps based on graph edges
                const incomingEdges = graph.edges.filter((e) => e.target === node.id || e.targetId === node.id);
                let mergedInput = { ...(node.data?.inputs || node.data?.params || {}) };
                // Merge outputs from upstream dependencies
                for (const edge of incomingEdges) {
                    const sourceId = edge.source || edge.sourceId;
                    const sourceResult = getStepResult(sourceId);
                    if (sourceResult) {
                        mergedInput = { ...mergedInput, ...sourceResult };
                    }
                }
                // If this is a root node (no incoming edges), merge in the triggerData
                const triggerData = getInitData();
                if (incomingEdges.length === 0 && triggerData) {
                    mergedInput = { ...mergedInput, ...triggerData };
                }
                // Validate and execute
                const validatedInput = blockDef.input.parse(mergedInput);
                const output = await blockDef.agent.invoke(validatedInput);
                return blockDef.output.parse(output);
            },
        });
        steps.set(node.id, step);
    }
    // 2. Build the DAG using topological sorting
    const inDegree = new Map();
    const outEdges = new Map();
    graph.nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        outEdges.set(n.id, []);
    });
    graph.edges.forEach((e) => {
        const sourceId = e.source || e.sourceId;
        const targetId = e.target || e.targetId;
        if (outEdges.has(sourceId)) {
            outEdges.get(sourceId).push(targetId);
        }
        if (inDegree.has(targetId)) {
            inDegree.set(targetId, inDegree.get(targetId) + 1);
        }
    });
    const queue = [];
    for (const [id, degree] of inDegree.entries()) {
        if (degree === 0 && steps.has(id)) {
            queue.push(id);
        }
    }
    let wfBuilder = workflow;
    let isFirst = true;
    while (queue.length > 0) {
        const currentId = queue.shift();
        const currentStep = steps.get(currentId);
        if (currentStep) {
            if (isFirst) {
                wfBuilder = wfBuilder.step(currentStep);
                isFirst = false;
            }
            else {
                wfBuilder = wfBuilder.then(currentStep);
            }
        }
        for (const neighbor of outEdges.get(currentId) || []) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        }
    }
    wfBuilder.commit();
    return workflow;
}
