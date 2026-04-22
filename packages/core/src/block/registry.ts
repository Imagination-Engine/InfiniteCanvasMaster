import type { BlockDefinition } from './protocol';

class BlockRegistry {
  private blocks = new Map<string, BlockDefinition<any, any>>();

  register(def: BlockDefinition<any, any>): void {
    if (this.blocks.has(def.id)) {
      throw new Error(`Block ${def.id} already registered`);
    }
    this.blocks.set(def.id, def);
  }

  get(id: string): BlockDefinition<any, any> | undefined {
    return this.blocks.get(id);
  }

  list(): BlockDefinition<any, any>[] {
    return Array.from(this.blocks.values());
  }

  byCategory(category: string): BlockDefinition<any, any>[] {
    return this.list().filter((b) => b.category === category);
  }
}

export const blockRegistry = new BlockRegistry();
