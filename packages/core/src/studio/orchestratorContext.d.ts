/**
 * Orchestrator-facing studio capability summaries.
 *
 * @module @iem/core/studio/orchestratorContext
 * @track orchestrator_studio_awareness_20260504 (Track 13)
 */
import type { StudioManifest, ToolMount } from "./contracts.js";
export declare function findStudioManifestForBlock(
  blockId: string,
): StudioManifest | undefined;
export declare function getMissingToolMountsForBlock(
  blockId: string,
): ToolMount[];
export declare function buildStudioCapabilitySummary(): string;
export interface BlockOrchestratorContext {
  blockId: string;
  blockName: string;
  studioName?: string;
  produces: string[];
  accepts: string[];
  compatibleBlocks: Array<{
    id: string;
    name: string;
  }>;
  missingToolMounts: Array<{
    id: string;
    name: string;
  }>;
}
export declare function buildBlockOrchestratorContext(
  blockId: string,
): BlockOrchestratorContext | null;
export declare function formatConnectableBlocksAnswer(blockId: string): string;
//# sourceMappingURL=orchestratorContext.d.ts.map
