import {
  blockRegistry,
  refinerBlock,
  summarizerBlock,
  translatorBlock,
  colorSwapperBlock,
  filterBlock,
  webScraperBlock,
  formatterBlock,
  programmerBlock,
} from "@iem/core";
import {
  proseBlock,
  chapterBlock,
  characterProfileBlock,
  worldLoreBlock,
  dialogueTreeBlock,
  editorBlock,
  proofreaderBlock,
} from "@iem/surface-scribe";

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

import {
  joystickBlock,
  spriteBlock,
  physicsEntityBlock,
  colliderBlock,
} from "@iem/surface-playable";

// Helper to register multiple blocks
const registerBlocks = (blocks: any[]) => {
  blocks.forEach((block) => {
    if (!block || !block.id) return;
    try {
      blockRegistry.register(block);
    } catch (e) {
      // Ignore
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
    refinerBlock,
    summarizerBlock,
    translatorBlock,
    colorSwapperBlock,
    filterBlock,
    webScraperBlock,
    formatterBlock,
    programmerBlock,
    joystickBlock,
    spriteBlock,
    physicsEntityBlock,
    colliderBlock,
  ]);

  console.log(
    `[REGISTRY] Initialized with ${blockRegistry.list().length} blocks.`,
  );
}
