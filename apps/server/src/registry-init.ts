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
  saasBlock,
  agentBlock,
  routerBlock,
  delayBlock,
  stateBlock,
  errorBoundaryBlock,
  subGraphBlock,
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

import {
  timelineBlock,
  exportBlock,
  sceneBlock,
  characterBlock as reelCharacterBlock,
  dialogueBlock,
  cameraBlock as reelCameraBlock,
  lightingBlock as reelLightingBlock,
  transitionBlock,
  vfxBlock,
  audioTrackBlock,
} from "@iem/surface-reel";

import {
  documentLoaderBlock,
  chunkerBlock,
  vectorSearchBlock,
  indexerBlock,
  graphKnowledgeBlock,
  queryBlock,
  embedBlock,
  upsertBlock,
  semanticRouterBlock,
} from "@iem/surface-atlas";

import {
  joystickBlock,
  spriteBlock,
  physicsEntityBlock,
  colliderBlock,
  cameraBlock,
  lightingBlock,
  audioBlock,
  particleBlock,
  scoreBlock,
  spawnerBlock,
  timerBlock,
  inputBlock,
  ruleBlock,
} from "@iem/surface-playable";

// Helper to register multiple blocks
const registerBlocks = (blocks: any[]) => {
  blocks.forEach((block) => {
    if (!block || !block.id) return;
    try {
      blockRegistry.register(block);
    } catch (e) {
      // Ignore duplicates
    }
  });
};

export function initializeBlockRegistry() {
  // Register newly defined core blocks first
  registerBlocks(blockRegistry.list());

  registerBlocks([
    // Scribe
    proseBlock,
    chapterBlock,
    characterProfileBlock,
    worldLoreBlock,
    dialogueTreeBlock,
    editorBlock,
    proofreaderBlock,

    // Conductor
    ifBlock,
    forEachBlock,
    webhookTriggerBlock,
    scheduleTriggerBlock,
    saasBlock,
    agentBlock,
    routerBlock,
    delayBlock,
    stateBlock,
    errorBoundaryBlock,
    subGraphBlock,
    webFetchBlock,
    slackPostBlock,
    notionCreateBlock,

    // Forge
    architectBlock,
    designerBlock,
    builderBlock,
    testerBlock,

    // Reel
    timelineBlock,
    exportBlock,
    sceneBlock,
    reelCharacterBlock,
    dialogueBlock,
    reelCameraBlock,
    reelLightingBlock,
    transitionBlock,
    vfxBlock,
    audioTrackBlock,

    // Atlas
    documentLoaderBlock,
    chunkerBlock,
    vectorSearchBlock,
    indexerBlock,
    graphKnowledgeBlock,
    queryBlock,
    embedBlock,
    upsertBlock,
    semanticRouterBlock,

    // Core
    refinerBlock,
    summarizerBlock,
    translatorBlock,
    colorSwapperBlock,
    filterBlock,
    webScraperBlock,
    formatterBlock,
    programmerBlock,

    // Playable
    joystickBlock,
    spriteBlock,
    physicsEntityBlock,
    colliderBlock,
    cameraBlock,
    lightingBlock,
    audioBlock,
    particleBlock,
    scoreBlock,
    spawnerBlock,
    timerBlock,
    inputBlock,
    ruleBlock,
  ]);

  console.log(
    `[REGISTRY] Initialized with ${blockRegistry.list().length} unique semantic blocks.`,
  );
}
