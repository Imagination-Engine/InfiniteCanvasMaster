/**
 * Normalize canvas / catalog block IDs to canonical registry IDs.
 */

const REEL_SHORTHAND = {
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

export function normalizeCanvasBlockId(blockId) {
  if (!blockId) return blockId;
  const trimmed = blockId.trim();
  if (REEL_SHORTHAND[trimmed]) return REEL_SHORTHAND[trimmed];
  if (trimmed.startsWith("reel.") && !trimmed.startsWith("iem.")) {
    return `iem.${trimmed}`;
  }
  return trimmed;
}
