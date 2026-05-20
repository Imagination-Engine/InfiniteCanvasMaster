/**
 * Concrete Studio Manifests — All 12 Studios
 *
 * Each manifest is the single source of truth for what a studio is,
 * what blocks it contains, what tools it needs, and what artifacts it
 * produces/consumes.
 *
 * @module @iem/core/studio/manifests
 * @track studio_manifest_registration_20260504 (Track 4)
 */
import type { StudioManifest, ToolMount } from "../contracts";
export declare const TOOL_MOUNTS: Record<string, ToolMount>;
export declare const writerStudioManifest: StudioManifest;
export declare const videoStudioManifest: StudioManifest;
export declare const gameStudioManifest: StudioManifest;
export declare const appCreationStudioManifest: StudioManifest;
export declare const commerceStudioManifest: StudioManifest;
export declare const agentStudioManifest: StudioManifest;
export declare const researchStudioManifest: StudioManifest;
export declare const knowledgeStudioManifest: StudioManifest;
export declare const automationStudioManifest: StudioManifest;
export declare const launchStudioManifest: StudioManifest;
export declare const mediaStudioManifest: StudioManifest;
export declare const brandStudioManifest: StudioManifest;
export declare const ALL_STUDIO_MANIFESTS: StudioManifest[];
declare class ToolMountRegistry {
  private mounts;
  register(mount: ToolMount): void;
  get(id: string): ToolMount | undefined;
  list(): ToolMount[];
  /** Return mounts that are currently active or configured */
  available(): ToolMount[];
  /** Return mounts that are mocked (not yet configured) */
  mocked(): ToolMount[];
}
export declare const toolMountRegistry: ToolMountRegistry;
export {};
//# sourceMappingURL=index.d.ts.map
