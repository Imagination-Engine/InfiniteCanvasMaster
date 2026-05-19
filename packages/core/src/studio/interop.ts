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
import { blockRegistry } from "../block/registry";
import { ALL_STUDIO_MANIFESTS } from "./manifests/index";

// ============================================================================
// Artifact Registry — indexes all artifact contracts from studio manifests
// ============================================================================

class ArtifactRegistryImpl {
  private contracts = new Map<string, ArtifactContract>();

  initialize(): void {
    for (const studio of ALL_STUDIO_MANIFESTS) {
      for (const contract of studio.artifactContracts) {
        this.contracts.set(contract.id, contract);
      }
    }
  }

  get(id: string): ArtifactContract | undefined {
    return this.contracts.get(id);
  }

  list(): ArtifactContract[] {
    return Array.from(this.contracts.values());
  }

  /** Find contracts that a specific block can produce */
  producedBy(blockId: string): ArtifactContract[] {
    return this.list().filter((c) => c.producedBy.includes(blockId));
  }

  /** Find contracts that a specific block can accept */
  acceptedBy(blockId: string): ArtifactContract[] {
    return this.list().filter((c) => c.acceptedBy.includes(blockId));
  }
}

export const artifactRegistry = new ArtifactRegistryImpl();

// ============================================================================
// Capability Registry — indexes all capabilities from studio manifests
// ============================================================================

class CapabilityRegistryImpl {
  private capabilities = new Map<
    string,
    { id: string; name: string; studioId: string }
  >();

  initialize(): void {
    for (const studio of ALL_STUDIO_MANIFESTS) {
      for (const cap of studio.capabilities) {
        this.capabilities.set(cap.id, {
          id: cap.id,
          name: cap.name,
          studioId: studio.id,
        });
      }
    }
  }

  list(): Array<{ id: string; name: string; studioId: string }> {
    return Array.from(this.capabilities.values());
  }

  /** Find which studio offers a given capability */
  findStudio(capabilityId: string): string | undefined {
    return this.capabilities.get(capabilityId)?.studioId;
  }
}

export const capabilityRegistry = new CapabilityRegistryImpl();

// ============================================================================
// Studio Interop Resolver
// ============================================================================

export class StudioInteropResolver {
  /**
   * Determines if two blocks can be connected on the canvas.
   *
   * Connection is valid when the source block produces at least one
   * artifact type that the target block accepts. The special type "any"
   * matches everything.
   */
  canConnectBlocks(sourceId: string, targetId: string): boolean {
    const source = blockRegistry.get(sourceId);
    const target = blockRegistry.get(targetId);

    if (!source || !target) return false;

    const sourceProduces = source.produces || [];
    const targetAccepts = target.accepts || [];

    // "any" is a universal wildcard
    if (targetAccepts.includes("any") || sourceProduces.includes("any")) {
      return true;
    }

    // Check for at least one overlapping type
    return sourceProduces.some((type) => targetAccepts.includes(type));
  }

  /**
   * Returns a list of blocks that can accept the output of the given
   * source block. Useful for "suggest next block" in the orchestrator.
   */
  suggestCompatibleBlocks(sourceId: string): BlockDefinition<any, any>[] {
    const source = blockRegistry.get(sourceId);
    if (!source) return [];

    const sourceProduces = source.produces || [];
    if (sourceProduces.length === 0) return [];

    return blockRegistry.list().filter((candidate) => {
      if (candidate.id === sourceId) return false;
      const candidateAccepts = candidate.accepts || [];
      if (candidateAccepts.includes("any")) return true;
      return sourceProduces.some((type) => candidateAccepts.includes(type));
    });
  }

  /**
   * Returns a list of blocks that can provide input to the given
   * target block. Useful for "what feeds this?" queries.
   */
  suggestSourceBlocks(targetId: string): BlockDefinition<any, any>[] {
    const target = blockRegistry.get(targetId);
    if (!target) return [];

    const targetAccepts = target.accepts || [];
    if (targetAccepts.length === 0) return [];

    return blockRegistry.list().filter((candidate) => {
      if (candidate.id === targetId) return false;
      const candidateProduces = candidate.produces || [];
      if (targetAccepts.includes("any")) return true;
      return candidateProduces.some((type) => targetAccepts.includes(type));
    });
  }

  /**
   * Returns the set of data types that can flow between two blocks.
   * Empty array means no connection is possible.
   */
  getCompatibleTypes(sourceId: string, targetId: string): string[] {
    const source = blockRegistry.get(sourceId);
    const target = blockRegistry.get(targetId);

    if (!source || !target) return [];

    const sourceProduces = source.produces || [];
    const targetAccepts = target.accepts || [];

    if (targetAccepts.includes("any")) return sourceProduces;
    if (sourceProduces.includes("any")) return targetAccepts;

    return sourceProduces.filter((type) => targetAccepts.includes(type));
  }
}

export const studioInteropResolver = new StudioInteropResolver();

// ============================================================================
// Initialize registries
// ============================================================================

artifactRegistry.initialize();
capabilityRegistry.initialize();
