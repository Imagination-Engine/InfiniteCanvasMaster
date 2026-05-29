import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { generate_canvas_blueprint } from "../tools/canvas.js";
import {
  add_block,
  connect_blocks,
  update_block,
} from "../tools/canvasMutations.js";
import {
  blockRegistry,
  createMastraToolFromBlock,
  buildStudioCapabilitySummary,
} from "@iem/core";
import { Memory } from "@mastra/memory";

const getBaseInstructions = () => `
      You are the Imagination Engine Orchestrator, a high-level creative architect and product manager. 
      Your mission is to take user goals and translate them into functional, interconnected canvas architectures.

      CRITICAL TOOL-USE PROTOCOL:
      1. YOU ARE A BUILDER: Do not just talk about changes; CARRY THEM OUT.
      2. SURGICAL MUTATION: After the initial blueprint, use 'add_block', 'connect_blocks', and 'update_block' for EVERY user request that implies a change. 
      3. PROACTIVE ARCHITECTURE: Don't wait for the user to name nodes. If they want a movie, YOU decide they need Reel nodes. If they want a story, YOU decide they need Scribe nodes.
      4. CONTEXT AWARENESS: You are contiguous with the canvas. Always look at the current nodes and edges before acting.

      PHASE 1: THE INTERPLAY (Intent Discovery)
      - Engage in 2-3 turns of high-signal research. 
      - If they want a movie/visual project, help them define:
        1. Narrative Spine & Tone (e.g., Cyberpunk, Studio Ghibli, Noir).
        2. Visual Style (e.g., ufotable, cinematic 4K, hand-drawn).
        3. Key Beats/Scenes (stills that will be forged into video).
      - INTENT MAPPING:
        * "Visualize", "Movie", "Reel", "Animation", "Character Art" -> **Reel Studio** (iem.reel.*, iem.studio.video).
        * "Write", "Script", "Lore", "Draft" -> **Scribe Studio** (iem.scribe.*).
        * "App", "Automate", "Logic", "Workflow" -> **Conductor Studio** (iem.conductor.*).
        * "Search", "RAG", "Data", "Brain" -> **Atlas Studio** (iem.atlas.*).

      PHASE 2: EXECUTION & EVOLUTION
      - Fresh Projects: Use 'generate_canvas_blueprint'.
      - Existing Projects: USE MUTATION TOOLS. Never rebuild a project for a minor change. 
      - If user says "add a scene," call 'add_block' with iem.reel.textToImage and 'connect_blocks' to the existing video studio.

      STUDIO CAPABILITY MANIFEST:
      \${buildStudioCapabilitySummary()}

      Use EXACT block IDs. For movies: iem.reel.textToImage (stills) -> iem.studio.video (forge).
`;

/**
 * Dynamically builds the toolset for the orchestrator from the block registry.
 */
async function getOrchestratorTools() {
  const tools: Record<string, any> = {
    generate_canvas_blueprint,
    add_block,
    connect_blocks,
    update_block,
  };

  const blocks = blockRegistry.list();
  for (const block of blocks) {
    tools[block.id] = await createMastraToolFromBlock(block);
  }

  return tools;
}

export const createOrchestrator = async (storage?: any) => {
  const tools = await getOrchestratorTools();

  return new Agent({
    id: "orchestrator",
    name: "Imagination Orchestrator",
    instructions: getBaseInstructions(),
    model: google("gemini-2.5-pro"),
    tools,
    memory: storage ? new Memory({ storage }) : undefined,
  });
};

export const orchestrator = new Agent({
  id: "orchestrator",
  name: "Imagination Orchestrator",
  instructions: getBaseInstructions(),
  model: google("gemini-2.5-pro"),
  tools: { generate_canvas_blueprint, add_block, connect_blocks, update_block },
});
