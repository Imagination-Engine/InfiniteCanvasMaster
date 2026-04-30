import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { blockRegistry } from '@iem/core';

export class CanvasMCPServer {
  private server: Server;
  
  // In-memory mock canvas state for now
  private nodes: any[] = [];
  private edges: any[] = [];

  constructor() {
    this.server = new Server(
      { name: "icmaster-canvas-server", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );
  }

  getTools() {
    const baseTools = [
      { name: 'canvas.describe', description: 'Returns the current block graph as JSON.', inputSchema: {} },
      { name: 'canvas.addBlock', description: 'Adds a block to the canvas.', inputSchema: {} },
      { name: 'canvas.connect', description: 'Wires two blocks.', inputSchema: {} },
      { name: 'canvas.run', description: 'Runs the whole canvas or a subgraph.', inputSchema: {} },
      { name: 'canvas.get', description: 'Reads the output of a block.', inputSchema: {} },
      { name: 'canvas.listBlocks', description: 'Lists registered block types available to place.', inputSchema: {} },
    ];

    const blockTools = blockRegistry.list().map(block => ({
      name: `canvas.block.${block.id}`,
      description: `Execute block: ${block.description}`,
      inputSchema: {}, // normally derived from block.input
    }));

    return [...baseTools, ...blockTools];
  }

  async executeTool(name: string, args: any): Promise<any> {
    if (name === 'canvas.addBlock') {
      const nodeId = `node_${Math.random().toString(36).substring(7)}`;
      this.nodes.push({ id: nodeId, ...args });
      return { nodeId, status: 'added' };
    }
    
    if (name === 'canvas.describe') {
      return { nodes: this.nodes, edges: this.edges };
    }

    if (name === 'canvas.connect') {
      this.edges.push(args);
      return { status: 'connected' };
    }

    if (name === 'canvas.run') {
      // Mock scheduler for unit tests
      return { status: 'success', executedNodes: this.nodes.length };
    }

    if (name.startsWith('canvas.block.')) {
      const blockId = name.replace('canvas.block.', '');
      const block = blockRegistry.get(blockId);
      if (!block) throw new Error(`Block not found: ${blockId}`);
      if (block.agent.invoke) {
        return block.agent.invoke(args);
      }
      return { status: 'mock_block_executed' };
    }

    throw new Error(`Tool not found: ${name}`);
  }
}
