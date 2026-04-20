# Imagination Canvas — Block Schema Guide

> **Audience**: Developers working on the Imagination Canvas frontend or AI agent integrations.
> **Last updated**: 2026-02-28

---

## How It All Connects

```
┌──────────────────────────────────────────────────────────┐
│  React Flow (browser runtime)                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  CanvasBlockNode<T>                                │  │
│  │  ├── id: "code-abc123"                             │  │
│  │  ├── type: "code"            ← geometry layer      │  │
│  │  ├── position: { x, y }                            │  │
│  │  └── data: BlockData<"code"> ← domain layer        │  │
│  │        ├── status: "idle"                           │  │
│  │        ├── metadata: { title, createdAt, ... }      │  │
│  │        ├── content: { source, language, ... }       │  │
│  │        ├── agentContext: { ... } | null             │  │
│  │        └── permissions: { ... }                     │  │
│  └────────────────────────────────────────────────────┘  │
│          │                              │                 │
│     save/restore                   import/export          │
│          ▼                              ▼                 │
│   PostgreSQL JSONB              JSON Canvas .canvas       │
│   (backend storage)            (open interop format)      │
└──────────────────────────────────────────────────────────┘
```

**Key idea**: React Flow's top-level fields (`id`, `type`, `position`) are the **geometry layer** — they control where things are on the canvas. Everything domain-specific (metadata, content, AI agent info) lives inside the `data` field as a typed `BlockData<T>` object.

---

## File Map

| File | What it does |
|------|-------------|
| `types/block.types.ts` | All TypeScript types — the schema's single source of truth |
| `factories/block.factory.ts` | `createBlock()` — the **only** way to create new blocks |
| `adapters/jsonCanvas.adapter.ts` | Import/export `.canvas` files |

---

## Creating Blocks

### The Simple Way (UI — e.g. drag from sidebar)

```ts
import { createBlock } from "./canvas/factories/block.factory";

const node = createBlock("content", {
  position: { x: 200, y: 100 },
  title: "My Notes",
});
// → Returns a fully-formed CanvasBlockNode with:
//   - UUID-based id: "content-a1b2c3d4-..."
//   - status: "idle"
//   - empty but valid content: { document: "", format: "markdown" }
//   - timestamp metadata, default permissions, etc.
```

### The Rich Way (AI Agent generating a block)

```ts
const block = createBlock("code", {
  title: "API Server",
  createdBy: "CodeGeneratorAgent",
  content: {
    source: "from fastapi import FastAPI\napp = FastAPI()",
    language: "python",
    dependencies: ["fastapi", "uvicorn"],
  },
  agentContext: {
    generatingAgent: "CodeGeneratorAgent",
    skillId: "backend-scaffold-v1",
    inputsConsumed: ["requirements-block-id"],
    confidenceScore: 0.92,
  },
  color: "#4f46e5",
});
```

### All 12 Block Types

| Type | Content Shape | Use Case |
|------|--------------|----------|
| `content` | `{ document, format }` | Rich text, markdown notes |
| `code` | `{ source, language, execution? }` | Code with optional sandbox execution |
| `image` | `{ imageUrl, format, altText? }` | Generated or uploaded images |
| `video` | `{ videoUrl?, script? }` | Video content |
| `chat` | `{ messages[] }` | Conversation threads |
| `sandbox` | `{ environmentVars, previewUrl? }` | Live dev environments |
| `browser` | `{ url, scrapedText? }` | Web page references |
| `product` | `{ name, priceUsd?, stripeProductId? }` | Product/pricing cards |
| `datatable` | `{ columns, rows }` | Tabular data |
| `listicle` | `{ items[] }` | Ranked/ordered lists |
| `aigenerative` | `{ prompt, outputType, output? }` | Generic AI generation |
| `group` | `{ label? }` | Visual grouping container |

You never need to remember the default content — `createBlock()` fills it in automatically via `DEFAULT_CONTENT`.

---

## Using Blocks in React Flow

### In Canvas.tsx (drag and drop)

```tsx
import { createBlock } from "../canvas/factories/block.factory";
import type { BlockType } from "../canvas/types/block.types";

// Inside onDrop handler:
const onDrop = useCallback((event) => {
  const blockType = event.dataTransfer.getData("application/reactflow");
  if (!blockType) return;

  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  setNodes((current) => [
    ...current,
    createBlock(blockType as BlockType, { position }),
  ]);
}, [screenToFlowPosition, setNodes]);
```

### In a Custom Node Component

```tsx
import type { NodeProps } from "@xyflow/react";
import type { BlockData } from "../../canvas/types/block.types";

// The node receives typed data through props
export function ContentNode({ data }: NodeProps) {
  // Cast to the specific block data type for full type safety
  const blockData = data as BlockData<"content">;

  return (
    <div className="content-node">
      <h3>{blockData.metadata.title}</h3>
      <div>{blockData.content.document}</div>
      {blockData.agentContext && (
        <span>Generated by {blockData.agentContext.generatingAgent}</span>
      )}
    </div>
  );
}
```

### Reading Block Status

Every block has a `status` field that tracks its lifecycle:

```ts
// "idle"     → default, nothing happening
// "loading"  → AI agent is generating content
// "complete" → generation finished successfully
// "error"    → something went wrong

if (node.data.status === "loading") {
  showSpinner();
}
```

---

## Import & Export (.canvas files)

### Exporting (save to JSON Canvas)

```ts
import { exportCanvasToJsonCanvas } from "../canvas/adapters/jsonCanvas.adapter";

const jsonCanvas = exportCanvasToJsonCanvas({
  nodes: currentNodes,
  edges: currentEdges,
  viewport: { x: 0, y: 0, zoom: 1 },
});

// Download as .canvas file
const blob = new Blob([JSON.stringify(jsonCanvas, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
// ... trigger download
```

### Importing (open a .canvas file)

```ts
import { importCanvasFromJsonCanvas } from "../canvas/adapters/jsonCanvas.adapter";

const fileContent = await file.text();
const parsed = JSON.parse(fileContent);
const canvas = importCanvasFromJsonCanvas(parsed);

setNodes(canvas.nodes);
setEdges(canvas.edges);
```

> **Note**: JSON Canvas is a simpler format — it only supports `text`, `file`, `link`, and `group` node types. When exporting, rich content is serialised to the closest match. When importing, nodes get sensible defaults (`agentContext: null`, `createdBy: "import"`).

---

## Adding a New Block Type

Only **4 files** need to change. Everything else (geometry, edges, DB schema, save/restore) is unchanged.

### Step 1 — Define the type (`types/block.types.ts`)

```ts
// 1a. Add to the BlockType union
export type BlockType =
  | "content"
  | "image"
  // ... existing types ...
  | "whiteboard";  // ← add here

// 1b. Define the content interface
export interface WhiteboardBlockContent {
  strokes: Array<{ points: number[]; color: string; width: number }>;
  backgroundColor?: string;
}

// 1c. Add to BlockContentMap
export interface BlockContentMap {
  // ... existing entries ...
  whiteboard: WhiteboardBlockContent;
}
```

### Step 2 — Add default content (`factories/block.factory.ts`)

```ts
const DEFAULT_CONTENT = {
  // ... existing defaults ...
  whiteboard: { strokes: [] },
};
```

### Step 3 — Add export mapping (`adapters/jsonCanvas.adapter.ts`)

```ts
const BLOCK_TYPE_TO_JC = {
  // ... existing mappings ...
  whiteboard: "text",  // falls back to text since JC has no whiteboard type
};
```

### Step 4 — Create the React Flow node component

```tsx
// Components/nodes/WhiteboardNode.tsx
import type { NodeProps } from "@xyflow/react";
import type { BlockData } from "../../canvas/types/block.types";

export function WhiteboardNode({ data }: NodeProps) {
  const blockData = data as BlockData<"whiteboard">;
  return <div>{/* render strokes */}</div>;
}

// Then register in Components/nodes/index.ts:
export const NODE_TYPES = {
  // ... existing ...
  whiteboard: WhiteboardNode,
};
```

That's it. The block factory, adapter, DB schema, and edge system all work automatically with the new type.

---

## Quick Reference: Imports

```ts
// Types
import type {
  BlockType,
  BlockData,
  BlockStatus,
  CanvasBlockNode,
  CanvasEdge,
  CanvasDocument,
  ContentBlockContent,    // or any per-type content interface
  AgentContext,
  BlockMetadata,
  BlockPermissions,
} from "../canvas/types/block.types";

// Factory
import { createBlock } from "../canvas/factories/block.factory";

// Adapter
import {
  exportCanvasToJsonCanvas,
  importCanvasFromJsonCanvas,
  exportNodeToJsonCanvas,     // single-node export (if needed)
  importNodeFromJsonCanvas,   // single-node import (if needed)
} from "../canvas/adapters/jsonCanvas.adapter";
```
