import type { BlockDefinition } from "./protocol";
import type { StudioId } from "../studio/contracts";
declare class BlockRegistry {
  private blocks;
  register(def: BlockDefinition<any, any>): void;
  get(id: string): BlockDefinition<any, any> | undefined;
  list(): BlockDefinition<any, any>[];
  byCategory(category: string): BlockDefinition<any, any>[];
  /** Return blocks belonging to a studio (checks both legacy and canonical) */
  byStudio(studioId: StudioId): BlockDefinition<any, any>[];
  /** Return blocks that produce a given artifact type */
  byProduces(artifactType: string): BlockDefinition<any, any>[];
  /** Return blocks that accept a given artifact type */
  byAccepts(artifactType: string): BlockDefinition<any, any>[];
  clear(): void;
}
export declare const blockRegistry: BlockRegistry;
export {};
//# sourceMappingURL=registry.d.ts.map
