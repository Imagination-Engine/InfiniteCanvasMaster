/**
 * Normalize canvas / catalog block IDs to canonical registry IDs.
 *
 * React Flow catalog uses shorthand `reel.*`, `scribe.*`, etc., while the
 * canonical block registry uses `iem.reel.*`, `iem.scribe.*`.
 */

const SHORTHAND_ALIASES: Record<string, string> = {
  // Reel / Video
  "reel.forge": "iem.studio.video",
  "reel.textToImage": "iem.reel.textToImage",
  "reel.text-to-image": "iem.reel.textToImage",

  // Forge / App
  "forge.architect": "iem.forge.architect",
  "forge.designer": "iem.forge.designer",
  "forge.builder": "iem.forge.builder",
  "forge.tester": "iem.forge.tester",

  // Programmer core
  programmer: "iem.core.programmer",

  // Conductor legacy casing / workflow catalog shorthands
  "conductor.forEach": "iem.conductor.foreach",
  "conductor.foreach": "iem.conductor.foreach",
  "conductor.webhook": "iem.conductor.webhook",
  "conductor.schedule": "iem.conductor.schedule",
  "conductor.webFetch": "iem.conductor.webFetch",
  "conductor.slackPost": "iem.conductor.slackPost",
  "conductor.notionCreate": "iem.conductor.notionCreate",
};

const SURFACE_NAMESPACES = [
  "reel",
  "scribe",
  "conductor",
  "forge",
  "atlas",
  "playable",
  "core",
  "sys",
  "data",
  "chat",
  "intent",
  "agent",
  "app",
  "commerce",
  "trigger",
];

export function normalizeCanvasBlockId(blockId: string): string {
  if (!blockId) return blockId;
  const trimmed = blockId.trim();

  // 1. Explicit Alias Map
  if (SHORTHAND_ALIASES[trimmed]) return SHORTHAND_ALIASES[trimmed];

  // 2. Prefix with iem. if it's a known surface shorthand (e.g. scribe.prose -> iem.scribe.prose)
  for (const ns of SURFACE_NAMESPACES) {
    if (trimmed.startsWith(`${ns}.`) && !trimmed.startsWith("iem.")) {
      return `iem.${trimmed}`;
    }
  }

  return trimmed;
}
