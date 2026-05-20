/**
 * Studio artifact payload types and builders.
 *
 * @module @iem/core/studio/artifacts
 * @track vertical_slice_writers_studio_20260504 (Tracks 6–12)
 */

import type { StudioArtifact, StudioId } from "./contracts.js";

export interface ManuscriptArtifact {
  title: string;
  body: string;
  wordCount: number;
  format: "markdown" | "plain";
}

export interface VideoProjectArtifact {
  title: string;
  scenes: Array<{ id: string; label: string; durationSec: number }>;
  status: "draft" | "editing" | "ready";
}

export interface GameProjectArtifact {
  title: string;
  genre: string;
  mechanics: string[];
  status: "concept" | "prototype" | "playable";
}

export interface AppProjectArtifact {
  title: string;
  stack: string;
  features: string[];
  status: "planning" | "building" | "deployed";
}

export interface StorefrontArtifact {
  name: string;
  products: Array<{ id: string; name: string; price: number }>;
  currency: string;
}

export interface AgentConfigArtifact {
  name: string;
  role: string;
  tools: string[];
  systemPrompt: string;
}

export interface WorkflowConfigArtifact {
  name: string;
  steps: string[];
  status: "draft" | "active";
}

export interface ResearchBriefArtifact {
  topic: string;
  summary: string;
  sources: Array<{ title: string; url?: string }>;
  status: "draft" | "complete";
}

export type StudioArtifactPayload =
  | ManuscriptArtifact
  | VideoProjectArtifact
  | GameProjectArtifact
  | AppProjectArtifact
  | StorefrontArtifact
  | AgentConfigArtifact
  | ResearchBriefArtifact;

export function buildStudioArtifact<T>(
  contractId: string,
  studioId: StudioId,
  sourceBlockId: string,
  data: T,
): StudioArtifact {
  return {
    contractId,
    data,
    metadata: {
      sourceBlockId,
      studioId,
      createdAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function buildManuscriptArtifact(
  sourceBlockId: string,
  payload: Pick<ManuscriptArtifact, "title" | "body"> & {
    format?: ManuscriptArtifact["format"];
  },
): StudioArtifact {
  const body = payload.body ?? "";
  return buildStudioArtifact("manuscript", "writers-studio", sourceBlockId, {
    title: payload.title ?? "Untitled Manuscript",
    body,
    wordCount: body.trim() ? body.trim().split(/\s+/).length : 0,
    format: payload.format ?? "markdown",
  } satisfies ManuscriptArtifact);
}

export function buildVideoProjectArtifact(
  sourceBlockId: string,
  payload: Partial<VideoProjectArtifact> & { title: string },
): StudioArtifact {
  return buildStudioArtifact("video-project", "video-studio", sourceBlockId, {
    title: payload.title,
    scenes: payload.scenes ?? [],
    status: payload.status ?? "draft",
  } satisfies VideoProjectArtifact);
}

export function buildGameProjectArtifact(
  sourceBlockId: string,
  payload: Partial<GameProjectArtifact> & { title: string },
): StudioArtifact {
  return buildStudioArtifact("game-project", "game-studio", sourceBlockId, {
    title: payload.title,
    genre: payload.genre ?? "adventure",
    mechanics: payload.mechanics ?? [],
    status: payload.status ?? "concept",
  } satisfies GameProjectArtifact);
}

export function buildAppProjectArtifact(
  sourceBlockId: string,
  payload: Partial<AppProjectArtifact> & { title: string },
): StudioArtifact {
  return buildStudioArtifact(
    "app-project",
    "app-creation-studio",
    sourceBlockId,
    {
      title: payload.title,
      stack: payload.stack ?? "react",
      features: payload.features ?? [],
      status: payload.status ?? "planning",
    } satisfies AppProjectArtifact,
  );
}

export function buildStorefrontArtifact(
  sourceBlockId: string,
  payload: Partial<StorefrontArtifact> & { name: string },
): StudioArtifact {
  return buildStudioArtifact("storefront", "commerce-studio", sourceBlockId, {
    name: payload.name,
    products: payload.products ?? [],
    currency: payload.currency ?? "USD",
  } satisfies StorefrontArtifact);
}

export function buildAgentConfigArtifact(
  sourceBlockId: string,
  payload: Partial<AgentConfigArtifact> & { name: string },
): StudioArtifact {
  return buildStudioArtifact("agent-config", "agent-studio", sourceBlockId, {
    name: payload.name,
    role: payload.role ?? "assistant",
    tools: payload.tools ?? [],
    systemPrompt: payload.systemPrompt ?? "",
  } satisfies AgentConfigArtifact);
}

export function buildWorkflowConfigArtifact(
  sourceBlockId: string,
  payload: Partial<WorkflowConfigArtifact> & { name: string },
): StudioArtifact {
  return buildStudioArtifact(
    "workflow-config",
    "automation-studio",
    sourceBlockId,
    {
      name: payload.name,
      steps: payload.steps ?? [],
      status: payload.status ?? "draft",
    } satisfies WorkflowConfigArtifact,
  );
}

export function buildResearchBriefArtifact(
  sourceBlockId: string,
  payload: Partial<ResearchBriefArtifact> & { topic: string },
): StudioArtifact {
  return buildStudioArtifact(
    "research-brief",
    "research-studio",
    sourceBlockId,
    {
      topic: payload.topic,
      summary: payload.summary ?? "",
      sources: payload.sources ?? [],
      status: payload.status ?? "draft",
    } satisfies ResearchBriefArtifact,
  );
}
