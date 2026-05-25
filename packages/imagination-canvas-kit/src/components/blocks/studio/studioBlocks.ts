// @ts-nocheck
import React from "react";
import {
  buildManuscriptArtifact,
  buildGameProjectArtifact,
  buildAppProjectArtifact,
  buildStorefrontArtifact,
  buildWorkflowConfigArtifact,
  buildResearchBriefArtifact,
} from "@iem/core";
import { createStudioBlock } from "./createStudioBlock";
import { VideoStudioBlock } from "./VideoStudioBlock";

const summaryText = (payload: Record<string, unknown>, key: string) =>
  String(payload[key] || "Empty — open fullscreen to edit");

export const WriterStudioBlock = createStudioBlock({
  blockId: "iem.studio.writer",
  contractId: "manuscript",
  compactLabel: "Manuscript",
  fullscreenTitle: "Writer's Studio — Manuscript Editor",
  placeholder: "Write your narrative…",
  defaultPayload: { title: "Untitled", body: "", format: "markdown" },
  buildArtifact: (_id, p) =>
    buildManuscriptArtifact("iem.studio.writer", {
      title: String(p.title ?? "Untitled"),
      body: String(p.body ?? ""),
      format: (p.format as "markdown" | "plain") ?? "markdown",
    }),
  renderSummary: (p) => summaryText(p, "body"),
});

export { VideoStudioBlock };

export const GameStudioBlock = createStudioBlock({
  blockId: "iem.studio.game",
  contractId: "game-project",
  compactLabel: "Game Project",
  fullscreenTitle: "Game Studio — Project Editor",
  placeholder: "Core mechanics and loop…",
  defaultPayload: { title: "New Game", genre: "adventure", mechanics: [] },
  buildArtifact: (_id, p) =>
    buildGameProjectArtifact("iem.studio.game", {
      title: String(p.title ?? "New Game"),
      genre: String(p.genre ?? "adventure"),
    }),
  renderSummary: (p) =>
    `${summaryText(p, "title")} · ${p.genre || "adventure"}`,
});

export const AppStudioBlock = createStudioBlock({
  blockId: "iem.studio.app",
  contractId: "app-project",
  compactLabel: "App Project",
  fullscreenTitle: "App Creation Studio",
  placeholder: "Feature list and architecture notes…",
  defaultPayload: { title: "New App", stack: "react", features: [] },
  buildArtifact: (_id, p) =>
    buildAppProjectArtifact("iem.studio.app", {
      title: String(p.title ?? "New App"),
      stack: String(p.stack ?? "react"),
    }),
  renderSummary: (p) => `${summaryText(p, "title")} · ${p.stack || "react"}`,
});

export const CommerceStudioBlock = createStudioBlock({
  blockId: "iem.studio.commerce",
  contractId: "storefront",
  compactLabel: "Storefront",
  fullscreenTitle: "Commerce & Intentcasting Studio",
  placeholder: "Product catalog notes…",
  defaultPayload: { name: "My Store", products: [], currency: "USD" },
  buildArtifact: (_id, p) =>
    buildStorefrontArtifact("iem.studio.commerce", {
      name: String(p.name ?? "My Store"),
      products: Array.isArray(p.products) ? p.products : [],
    }),
  renderSummary: (p) => summaryText(p, "name"),
});

export const AutomationStudioBlock = createStudioBlock({
  blockId: "iem.studio.automation",
  contractId: "workflow-config",
  compactLabel: "Workflow",
  fullscreenTitle: "Agent Automation Studio",
  placeholder: "Workflow steps (one per line)…",
  defaultPayload: {
    name: "Automation Pipeline",
    steps: [],
    systemPrompt: "",
  },
  buildArtifact: (_id, p) =>
    buildWorkflowConfigArtifact("iem.studio.automation", {
      name: String(p.name ?? "Automation Pipeline"),
      steps: String(p.systemPrompt ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }),
  renderSummary: (p) => `${p.name} · workflow`,
});

export const ResearchStudioBlock = createStudioBlock({
  blockId: "iem.studio.research",
  contractId: "research-brief",
  compactLabel: "Research Brief",
  fullscreenTitle: "Research & Knowledge Studio",
  placeholder: "Synthesis and findings…",
  defaultPayload: { topic: "Research Topic", summary: "", sources: [] },
  buildArtifact: (_id, p) =>
    buildResearchBriefArtifact("iem.studio.research", {
      topic: String(p.topic ?? "Research Topic"),
      summary: String(p.summary ?? ""),
    }),
  renderSummary: (p) => summaryText(p, "summary") || summaryText(p, "topic"),
});

export const STUDIO_BLOCK_REGISTRATIONS: Array<[string, React.FC]> = [
  ["iem.studio.writer", WriterStudioBlock],
  ["iem.studio.video", VideoStudioBlock],
  ["iem.studio.game", GameStudioBlock],
  ["iem.studio.app", AppStudioBlock],
  ["iem.studio.commerce", CommerceStudioBlock],
  ["iem.studio.automation", AutomationStudioBlock],
  ["iem.studio.research", ResearchStudioBlock],
];
