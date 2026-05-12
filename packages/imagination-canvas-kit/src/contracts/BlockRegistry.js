const registry = new Map();
export const BlockRegistry = {
  register: (kind, component) => {
    registry.set(kind, component);
  },
  resolve: (kind) => {
    return registry.get(kind);
  },
};
