import type { NodeTypes } from "@xyflow/react";
import BaseNode from "./BaseNode";
import TranslatorNode from "./TranslatorNode";
import RefinerNode from "./RefinerNode";
import SummarizerNode from "./SummarizerNode";
import WebScraperNode from "./WebScraperNode";
import ScribeNode from "./ScribeNode";
import PlayableNode from "./PlayableNode";
import AtlasNode from "./AtlasNode";
import ReelNode from "./ReelNode";
import ConductorNode from "./ConductorNode";
import ForgeNode from "./ForgeNode";
import ProgrammerNode from "./ProgrammerNode";
import FormatterNode from "./FormatterNode";
import ColorSwapperNode from "./ColorSwapperNode";
import { NODE_CATALOG } from "./nodeCatalog";
import type { NodeRegistry } from "./types";

const resolveComponent = (nodeType: string) => {
  if (nodeType === "refiner") return RefinerNode;
  if (nodeType === "translator") return TranslatorNode;
  if (nodeType === "summarizer") return SummarizerNode;
  if (nodeType === "webScraper") return WebScraperNode;
  if (nodeType === "programmer") return ProgrammerNode;
  if (nodeType === "formatter") return FormatterNode;
  if (nodeType === "colorSwapper") return ColorSwapperNode;

  const segments = nodeType.split(".");
  const prefix = segments[0] === "iem" ? segments[1] : segments[0];
  if (prefix === "scribe") return ScribeNode;
  if (prefix === "playable") return PlayableNode;
  if (prefix === "atlas") return AtlasNode;
  if (prefix === "reel") return ReelNode;
  if (prefix === "conductor") return ConductorNode;
  if (prefix === "forge") return ForgeNode;

  return BaseNode;
};

export const NODE_REGISTRY: NodeRegistry = Object.fromEntries(
  Object.entries(NODE_CATALOG).map(([nodeType, definition]) => [
    nodeType,
    {
      ...definition,
      component: resolveComponent(nodeType),
    },
  ]),
);

export type NodeRegistryType = typeof NODE_REGISTRY;

export const REACT_FLOW_NODE_TYPES: NodeTypes = Object.fromEntries(
  Object.keys(NODE_REGISTRY).map((nodeType) => [
    nodeType,
    resolveComponent(nodeType),
  ]),
);

export const getNodeDefinition = (nodeType: string) => NODE_REGISTRY[nodeType];
