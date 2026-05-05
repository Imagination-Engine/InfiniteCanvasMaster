# Block Registry Implementation Plan

## Objective

Normalize and expand the Block Registry to support 65+ rich block definitions containing capabilities, runtime types, and studio categories.

## Required Fields

```typescript
type BlockDefinition = {
  type: string; // The core identifier (e.g., "iem.playable.joystick")
  title: string; // The display name (e.g., "Joystick Controller")
  category: string; // High-level grouping (e.g., "Generative Media")
  studio?: string; // Optional studio association (e.g., "Game Studio")
  description: string;
  icon?: string;
  accent?: string; // CSS color string or variable
  capabilities: string[];
  accepts: string[];
  produces: string[];
  agentic: boolean;
  runtime:
    | "none"
    | "agent"
    | "studio"
    | "generator"
    | "sandbox"
    | "app"
    | "commerce"
    | "media"
    | "document";
  libraryCardVariant: string;
  canvasVariant: string;
  expandedVariant: string;
  demoMode?: boolean;
};
```

## Strategy

1. Extend the core contract in `packages/core/src/block/protocol.ts` or `packages/imagination-canvas-kit/src/contracts/index.ts`.
2. Populate `packages/core/src/block/registry.ts` with the full 65+ item list.
3. Map these definitions through to the frontend `BlockRegistry` in the canvas kit so the `BlockLibraryDrawer` can render them dynamically.
