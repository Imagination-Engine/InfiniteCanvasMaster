import { blockRegistry, generateCoreCapabilities } from "@iem/core";
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
  websocketTriggerBlock,
  websocketSendBlock,
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

export function initializeWebRegistry() {
  generateCoreCapabilities(); // Spin up the dynamic blocks

  const blocks = [
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
    websocketTriggerBlock,
    websocketSendBlock,

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
  ];

  blocks.forEach((block) => {
    if (!block || !block.id) return;
    try {
      blockRegistry.register(block);
    } catch (e) {
      // Ignore
    }
  });

  console.log(
    `[WEB REGISTRY] Initialized with ${blockRegistry.list().length} blocks.`,
  );
}
