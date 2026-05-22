/**
 * Cross-Studio Interoperability Engine
 *
 * Provides the logic for determining whether two blocks can be connected
 * on the canvas based on their accepts/produces contracts, and for
 * suggesting compatible next-step blocks.
 *
 * @module @iem/core/studio
 * @track cross_studio_interop_20260504 (Track 5)
 */
import type { BlockDefinition } from "../block/protocol";
import type { ArtifactContract } from "./contracts";
declare class ArtifactRegistryImpl {
  private contracts;
  initialize(): void;
  get(id: string): ArtifactContract | undefined;
  list(): ArtifactContract[];
  /** Find contracts that a specific block can produce */
  producedBy(blockId: string): ArtifactContract[];
  /** Find contracts that a specific block can accept */
  acceptedBy(blockId: string): ArtifactContract[];
}
export declare const artifactRegistry: ArtifactRegistryImpl;
declare class CapabilityRegistryImpl {
  private capabilities;
  initialize(): void;
  list(): Array<{
    id: string;
    name: string;
    studioId: string;
  }>;
  /** Find which studio offers a given capability */
  findStudio(capabilityId: string): string | undefined;
}
export declare const capabilityRegistry: CapabilityRegistryImpl;
export declare class StudioInteropResolver {
  /**
   * Determines if two blocks can be connected on the canvas.
   *
   * Connection is valid when the source block produces at least one
   * artifact type that the target block accepts. The special type "any"
   * matches everything.
   */
  canConnectBlocks(sourceId: string, targetId: string): boolean;
  /**
   * Returns a list of blocks that can accept the output of the given
   * source block. Useful for "suggest next block" in the orchestrator.
   */
  suggestCompatibleBlocks(sourceId: string): BlockDefinition<any, any>[];
  /**
   * Returns a list of blocks that can provide input to the given
   * target block. Useful for "what feeds this?" queries.
   */
  suggestSourceBlocks(targetId: string): BlockDefinition<any, any>[];
  /**
   * Returns the set of data types that can flow between two blocks.
   * Empty array means no connection is possible.
   */
  getCompatibleTypes(sourceId: string, targetId: string): string[];
}
export declare const studioInteropResolver: StudioInteropResolver;
export {};
//# sourceMappingURL=interop.d.ts.map
