class BlockRegistry {
    blocks = new Map();
    register(def) {
        if (this.blocks.has(def.id)) {
            throw new Error(`Block ${def.id} already registered`);
        }
        this.blocks.set(def.id, def);
    }
    get(id) {
        return this.blocks.get(id);
    }
    list() {
        return Array.from(this.blocks.values());
    }
    byCategory(category) {
        return this.list().filter((b) => b.category === category);
    }
}
export const blockRegistry = new BlockRegistry();
