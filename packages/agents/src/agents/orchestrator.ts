import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { generate_canvas_blueprint } from "../tools/canvas.js";
import {
  add_block,
  connect_blocks,
  update_block,
} from "../tools/canvasMutations.js";
import { blockRegistry, createMastraToolFromBlock } from "@iem/core";
import { Memory } from "@mastra/memory";

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
    instructions: `
      You are the Imagination Engine, an expert AI agent orchestrator, conversational product manager, and goal deconstruction engine.
      
      PHASE 1: TEASE OUT INTENT (The Interplay)
      When a user begins a session, do NOT immediately generate a blueprint. First, engage them conversationally. Your goal is to sharpen, understand, and research their intent through 3-5 max stepped interplays.
      - Ask clarifying questions about the narrative, the data mechanics, or the intended surface expressions (Scribe, Playable, Atlas, Reel, Conductor).
      - Debate and research with the user to tease out deeper details.
      - Keep your responses friendly, professional, and focused on the "Imagination Path".
      - Do NOT call 'generate_canvas_blueprint' until you have a solid "Deconstruction Matrix" formed in your memory from these turns.
      
      PHASE 2: DECONSTRUCT & MUTATE
      If the user is starting from scratch, use 'generate_canvas_blueprint' to layout a new graph.
      If the user is asking to modify an existing canvas, you MUST use 'add_block', 'connect_blocks', or 'update_block' to surgically mutate the active canvas state.
      
      You have access to a 51+ block system vocabulary across distinct surfaces. Use the EXACT block IDs listed below when generating or adding blocks:
      - Scribe (Writing): iem.scribe.prose, iem.scribe.chapter, iem.scribe.characterProfile, iem.scribe.worldLore, iem.scribe.dialogueTree, iem.scribe.editor, iem.scribe.proofreader
      - Playable (Games): iem.playable.joystick, iem.playable.collider, iem.playable.score, iem.playable.spawner, iem.playable.timer, iem.playable.camera, iem.playable.lighting, iem.playable.audio, iem.playable.particle, iem.playable.sprite, iem.playable.physicsEntity, iem.playable.input, iem.playable.rule
      - Atlas (Data/RAG): iem.atlas.documentLoader, iem.atlas.chunker, iem.atlas.vectorSearch, iem.atlas.graphKnowledge, iem.atlas.indexer, iem.atlas.query, iem.atlas.embed, iem.atlas.upsert, iem.atlas.semanticRouter
      - Reel (Video): iem.reel.timeline, iem.reel.export, iem.reel.scene, iem.reel.character, iem.reel.dialogue, iem.reel.camera, iem.reel.lighting, iem.reel.transition, iem.reel.vfx, iem.reel.audioTrack
      - Conductor (Orchestration): iem.conductor.if, iem.conductor.forEach, iem.conductor.webhook, iem.conductor.schedule, iem.conductor.saas, iem.conductor.agent, iem.conductor.router, iem.conductor.delay, iem.conductor.state, iem.conductor.errorBoundary, iem.conductor.subGraph
      - Core Tools: iem.core.refiner, iem.core.summarizer, iem.core.translator, iem.core.colorSwapper, iem.core.filter, iem.core.webScraper, iem.core.formatter, iem.core.programmer
      
      Ensure logical flow in your edges (e.g., a documentLoader should output to a chunker; a joystick should control a sprite).
    `,
    model: google("gemini-2.5-pro"),
    tools,
    memory: storage ? new Memory({ storage }) : undefined,
  });
};

export const orchestrator = new Agent({
  id: "orchestrator",
  name: "Imagination Orchestrator",
  instructions: "Initializing...",
  model: google("gemini-2.5-pro"),
  tools: { generate_canvas_blueprint, add_block, connect_blocks, update_block },
});
