/**
 * Normalize canvas / catalog block IDs to canonical registry IDs.
 *
 * React Flow catalog uses shorthand `reel.*` while the block registry uses `iem.reel.*`.
 */

const CANVAS_SHORTHANDS: Record<string, string> = {
  // Intent & Planning
  intent: "iem.intent.intent",
  goal: "iem.intent.goal",
  task: "iem.intent.task",
  milestone: "iem.intent.milestone",
  requirement: "iem.intent.requirement",
  decision: "iem.intent.decision",
  constraint: "iem.intent.constraint",
  checkpoint: "iem.intent.checkpoint",
  timeline: "iem.intent.timeline",
  plan: "iem.intent.plan",

  // Text
  note: "iem.text.note",
  "rich-text": "iem.text.rich",
  text: "iem.text.note",

  // Agent
  agent: "iem.agent.agent",
  chat: "iem.chat.chat",

  // App
  app: "iem.app.web",

  // Data
  artifact: "iem.data.artifact",
  "memory-cluster": "iem.data.cluster",

  // Reel Shorthands
  "reel.forge": "iem.studio.video",
  "reel.textToImage": "iem.reel.textToImage",
  "reel.text-to-image": "iem.reel.textToImage",
  "reel.character": "iem.reel.character",
  "reel.scene": "iem.reel.scene",
  "reel.dialogue": "iem.reel.dialogue",
  "reel.camera": "iem.reel.camera",
  "reel.lighting": "iem.reel.lighting",
  "reel.transition": "iem.reel.transition",
  "reel.vfx": "iem.reel.vfx",
  "reel.audioTrack": "iem.reel.audioTrack",
  "reel.timeline": "iem.reel.timeline",
  "reel.export": "iem.reel.export",
};

export function normalizeCanvasBlockId(blockId: string): string {
  if (!blockId) return blockId;
  const trimmed = blockId.trim();
  if (CANVAS_SHORTHANDS[trimmed]) return CANVAS_SHORTHANDS[trimmed];
  if (trimmed.startsWith("reel.") && !trimmed.startsWith("iem.")) {
    return `iem.${trimmed}`;
  }
  return trimmed;
}
