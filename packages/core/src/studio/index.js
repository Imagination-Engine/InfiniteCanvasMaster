/**
 * Studio module barrel export.
 *
 * @module @iem/core/studio
 * @track studio_manifest_types_20260504 (Track 2)
 */
export * from "./contracts.js";
export * from "./schemas.js";
export * from "./manifests/index.js";
export * from "./interop.js";
export * from "./artifacts.js";
export * from "./orchestratorContext.js";
export {
  collectReelReferences,
  mergeForgeConnections,
  normalizeForgeCanvasObjects,
  forgeNeighbourId,
  VEO_MAX_REFERENCE_IMAGES,
} from "./reelForge.js";
export { normalizeCanvasBlockId } from "../block/blockIdAliases.js";
