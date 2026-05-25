import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { generate_canvas_blueprint } from "../tools/canvas.js";
import {
  blockRegistry,
  createMastraToolFromBlock,
  buildStudioCapabilitySummary,
} from "@iem/core";
import { Memory } from "@mastra/memory";

/**
 * Dynamically builds the toolset for the orchestrator from the block registry.
 */
async function getOrchestratorTools() {
  const tools: Record<string, any> = {
    generate_canvas_blueprint,
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
      
      PHASE 2: DECONSTRUCT & GENERATE (The Blueprint)
      Once the intent is fully sharpened (after the interplay), deconstruct it into a Directed Acyclic Graph (DAG) living blueprint using the 'generate_canvas_blueprint' tool.
      The blueprint is used to construct a DAG of multiple agents, blocks, and agents-as-blocks across the 5 surfaces.
      
      You have access to a 51+ block system vocabulary across distinct surfaces. Use the EXACT block IDs listed below when generating the blueprint:
      - Scribe (Writing): iem.scribe.prose, iem.scribe.chapter, iem.scribe.characterProfile, iem.scribe.worldLore, iem.scribe.dialogueTree, iem.scribe.editor, iem.scribe.proofreader
      - Playable (Games): iem.playable.joystick, iem.playable.collider, iem.playable.score, iem.playable.spawner, iem.playable.timer, iem.playable.camera, iem.playable.lighting, iem.playable.audio, iem.playable.particle, iem.playable.sprite, iem.playable.physicsEntity, iem.playable.input, iem.playable.rule
      - Atlas (Data/RAG): iem.atlas.documentLoader, iem.atlas.chunker, iem.atlas.vectorSearch, iem.atlas.graphKnowledge, iem.atlas.indexer, iem.atlas.query, iem.atlas.embed, iem.atlas.upsert, iem.atlas.semanticRouter
      - Reel (Video): iem.reel.timeline, iem.reel.export, iem.reel.scene, iem.reel.character, iem.reel.dialogue, iem.reel.camera, iem.reel.lighting, iem.reel.transition, iem.reel.vfx, iem.reel.audioTrack
      - Conductor (Orchestration): iem.conductor.if, iem.conductor.forEach, iem.conductor.webhook, iem.conductor.schedule, iem.conductor.saas, iem.conductor.agent, iem.conductor.router, iem.conductor.delay, iem.conductor.state, iem.conductor.errorBoundary, iem.conductor.subGraph
      - Core Tools: iem.core.refiner, iem.core.summarizer, iem.core.translator, iem.core.colorSwapper, iem.core.filter, iem.core.webScraper, iem.core.formatter, iem.core.programmer
      
      Ensure logical flow in your edges (e.g., a documentLoader should output to a chunker; a joystick should control a sprite).

      STUDIO CAPABILITY MANIFEST (registry-aware):
      ${buildStudioCapabilitySummary()}

      When asked what can connect to a block, use accepts/produces types from the block registry.
      Studio blocks (iem.studio.*) produce typed artifacts (manuscript, video-project, game-project, etc.).
      Suggest compatible next-step blocks only when their accepts overlap the source produces.
    `,
    model: google("gemini-2.5-flash"),
    tools,
    memory: storage ? new Memory({ storage }) : undefined,
  });
};

export const orchestrator = new Agent({
  id: "orchestrator",
  name: "Imagination Orchestrator",
  instructions: "Initializing...",
  model: google("gemini-2.5-flash"),
  tools: { generate_canvas_blueprint },
});
