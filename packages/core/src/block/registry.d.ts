import type { BlockDefinition } from "./protocol";
declare class BlockRegistry {
  private blocks;
  register(def: BlockDefinition<any, any>): void;
  get(id: string): BlockDefinition<any, any> | undefined;
  list(): BlockDefinition<any, any>[];
  byCategory(category: string): BlockDefinition<any, any>[];
  clear(): void;
}
export declare const blockRegistry: BlockRegistry;
export {};
//# sourceMappingURL=registry.d.ts.map
