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
  scenes: Array<{
    id: string;
    label: string;
    durationSec: number;
  }>;
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
  products: Array<{
    id: string;
    name: string;
    price: number;
  }>;
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
  sources: Array<{
    title: string;
    url?: string;
  }>;
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
export declare function buildStudioArtifact<T>(
  contractId: string,
  studioId: StudioId,
  sourceBlockId: string,
  data: T,
): StudioArtifact;
export declare function buildManuscriptArtifact(
  sourceBlockId: string,
  payload: Pick<ManuscriptArtifact, "title" | "body"> & {
    format?: ManuscriptArtifact["format"];
  },
): StudioArtifact;
export declare function buildVideoProjectArtifact(
  sourceBlockId: string,
  payload: Partial<VideoProjectArtifact> & {
    title: string;
  },
): StudioArtifact;
export declare function buildGameProjectArtifact(
  sourceBlockId: string,
  payload: Partial<GameProjectArtifact> & {
    title: string;
  },
): StudioArtifact;
export declare function buildAppProjectArtifact(
  sourceBlockId: string,
  payload: Partial<AppProjectArtifact> & {
    title: string;
  },
): StudioArtifact;
export declare function buildStorefrontArtifact(
  sourceBlockId: string,
  payload: Partial<StorefrontArtifact> & {
    name: string;
  },
): StudioArtifact;
export declare function buildAgentConfigArtifact(
  sourceBlockId: string,
  payload: Partial<AgentConfigArtifact> & {
    name: string;
  },
): StudioArtifact;
export declare function buildWorkflowConfigArtifact(
  sourceBlockId: string,
  payload: Partial<WorkflowConfigArtifact> & {
    name: string;
  },
): StudioArtifact;
export declare function buildResearchBriefArtifact(
  sourceBlockId: string,
  payload: Partial<ResearchBriefArtifact> & {
    topic: string;
  },
): StudioArtifact;
//# sourceMappingURL=artifacts.d.ts.map
