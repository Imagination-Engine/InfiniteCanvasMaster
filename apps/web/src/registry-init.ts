import { blockRegistry, generateCoreCapabilities } from "@iem/core";
import {
  proseBlock,
  chapterBlock,
  characterProfileBlock,
  worldLoreBlock,
  dialogueTreeBlock,
  proofreaderBlock,
  editorBlock,
} from "@iem/surface-scribe";
import {
  ifBlock,
  forEachBlock,
  webhookTriggerBlock,
} from "@iem/surface-conductor";
import {
  ingestionBlock,
  retrievalBlock,
  synthesisBlock,
} from "@iem/surface-atlas";
import { textToImageBlock, textToSpeechBlock } from "@iem/surface-reel";
import {
  architectBlock,
  designerBlock,
  builderBlock,
  testerBlock,
} from "@iem/surface-forge";

export function initializeWebRegistry() {
  generateCoreCapabilities(); // Spin up the dynamic blocks

  const blocks = [
    proseBlock,
    chapterBlock,
    characterProfileBlock,
    worldLoreBlock,
    dialogueTreeBlock,
    proofreaderBlock,
    editorBlock,
    ifBlock,
    forEachBlock,
    webhookTriggerBlock,
    ingestionBlock,
    retrievalBlock,
    synthesisBlock,
    textToImageBlock,
    textToSpeechBlock,
    architectBlock,
    designerBlock,
    builderBlock,
    testerBlock,
  ];

  blocks.forEach((block) => {
    try {
      blockRegistry.register(block);
    } catch (e) {
      // Ignore already registered blocks
    }
  });

  console.log(
    `[WEB REGISTRY] Initialized with ${blockRegistry.list().length} blocks.`,
  );
}
