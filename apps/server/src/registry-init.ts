import { blockRegistry } from "@iem/core";
import { proseBlock } from "@iem/surface-scribe";
import { chapterBlock } from "@iem/surface-scribe";
import { characterProfileBlock } from "@iem/surface-scribe";
import { worldLoreBlock } from "@iem/surface-scribe";
import { dialogueTreeBlock } from "@iem/surface-scribe";
import { editorBlock } from "@iem/surface-scribe";
import { proofreaderBlock } from "@iem/surface-scribe";

import {
  ifBlock,
  forEachBlock,
  webhookTriggerBlock,
  scheduleTriggerBlock,
} from "@iem/surface-conductor";
import {
  webFetchBlock,
  slackPostBlock,
  notionCreateBlock,
} from "@iem/surface-conductor";

import {
  architectBlock,
  designerBlock,
  builderBlock,
  testerBlock,
} from "@iem/surface-forge";

import { timelineBlock } from "@iem/surface-reel";
import { exportBlock } from "@iem/surface-reel";
import { textToImageBlock, textToSpeechBlock } from "@iem/surface-reel";

import {
  documentLoaderBlock,
  chunkerBlock,
  vectorSearchBlock,
  indexerBlock,
  graphKnowledgeBlock,
} from "@iem/surface-atlas";

// Helper to register multiple blocks
const registerBlocks = (blocks: any[]) => {
  blocks.forEach((block) => {
    if (!block || !block.id) return;
    try {
      blockRegistry.register(block);
    } catch (e) {
      console.warn(
        `Block ${block.id} already registered or failed to register.`,
      );
    }
  });
};

export function initializeBlockRegistry() {
  registerBlocks([
    proseBlock,
    chapterBlock,
    characterProfileBlock,
    worldLoreBlock,
    dialogueTreeBlock,
    editorBlock,
    proofreaderBlock,
    ifBlock,
    forEachBlock,
    webhookTriggerBlock,
    scheduleTriggerBlock,
    webFetchBlock,
    slackPostBlock,
    notionCreateBlock,
    architectBlock,
    designerBlock,
    builderBlock,
    testerBlock,
    timelineBlock,
    exportBlock,
    textToImageBlock,
    textToSpeechBlock,
    documentLoaderBlock,
    chunkerBlock,
    vectorSearchBlock,
    indexerBlock,
    graphKnowledgeBlock,
  ]);

  console.log(
    `[REGISTRY] Initialized with ${blockRegistry.list().length} blocks.`,
  );
}
