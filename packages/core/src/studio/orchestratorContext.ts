/**
 * Orchestrator-facing studio capability summaries.
 *
 * @module @iem/core/studio/orchestratorContext
 * @track orchestrator_studio_awareness_20260504 (Track 13)
 */

import type { BlockDefinition } from "../block/protocol.js";
import { blockRegistry } from "../block/registry.js";
import type { StudioManifest, ToolMount } from "./contracts.js";
import { ALL_STUDIO_MANIFESTS } from "./manifests/index.js";
import { studioInteropResolver } from "./interop.js";
import { toolMountRegistry } from "./manifests/index.js";

export function findStudioManifestForBlock(
  blockId: string,
): StudioManifest | undefined {
  return ALL_STUDIO_MANIFESTS.find((studio) =>
    studio.blockIds.includes(blockId),
  );
}

export function getMissingToolMountsForBlock(blockId: string): ToolMount[] {
  const studio = findStudioManifestForBlock(blockId);
  if (!studio) return [];

  const requiredIds = new Set<string>();
  for (const cap of studio.capabilities) {
    for (const mountId of cap.requiresToolMounts ?? []) {
      requiredIds.add(mountId);
    }
  }
  for (const mount of studio.toolMounts) {
    if (mount.status === "mock") {
      requiredIds.add(mount.id);
    }
  }

  return Array.from(requiredIds)
    .map((id) => toolMountRegistry.get(id))
    .filter((m): m is ToolMount => !!m && m.status === "mock");
}

export function buildStudioCapabilitySummary(): string {
  const lines = ALL_STUDIO_MANIFESTS.map((studio) => {
    const artifacts = studio.artifactContracts.map((a) => a.id).join(", ");
    const blocks = studio.blockIds.slice(0, 6).join(", ");
    return `- ${studio.name} (${studio.id}): blocks=[${blocks}], artifacts=[${artifacts || "none"}]`;
  });
  return `Registered studios (${ALL_STUDIO_MANIFESTS.length}):\n${lines.join("\n")}`;
}

export interface BlockOrchestratorContext {
  blockId: string;
  blockName: string;
  studioName?: string;
  produces: string[];
  accepts: string[];
  compatibleBlocks: Array<{ id: string; name: string }>;
  missingToolMounts: Array<{ id: string; name: string }>;
}

export function buildBlockOrchestratorContext(
  blockId: string,
): BlockOrchestratorContext | null {
  const block = blockRegistry.get(blockId);
  if (!block) return null;

  const studio = findStudioManifestForBlock(blockId);
  const compatible = studioInteropResolver.suggestCompatibleBlocks(blockId);

  return {
    blockId: block.id,
    blockName: block.name,
    studioName: studio?.name,
    produces: block.produces ?? [],
    accepts: block.accepts ?? [],
    compatibleBlocks: compatible
      .slice(0, 8)
      .map((b: BlockDefinition<any, any>) => ({
        id: b.id,
        name: b.name,
      })),
    missingToolMounts: getMissingToolMountsForBlock(blockId).map((m) => ({
      id: m.id,
      name: m.name,
    })),
  };
}

export function formatConnectableBlocksAnswer(blockId: string): string {
  const ctx = buildBlockOrchestratorContext(blockId);
  if (!ctx) {
    return "I could not find that block in the registry.";
  }

  if (ctx.compatibleBlocks.length === 0) {
    return `"${ctx.blockName}" produces [${ctx.produces.join(", ") || "nothing"}]. No registered downstream blocks accept those types yet.`;
  }

  const names = ctx.compatibleBlocks
    .map((b) => `${b.name} (${b.id})`)
    .join(", ");
  return `"${ctx.blockName}" can connect to: ${names}. Shared flow types: ${ctx.produces.join(", ")}.`;
}
