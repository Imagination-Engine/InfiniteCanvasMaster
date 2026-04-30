# 04 — Object Model and Content Grammar

## Purpose

This document defines the canonical object model for the Imagination Canvas. The core mistake to avoid is treating the canvas as a shape board. Balnce needs a richer model where every block can be spatial, semantic, agentic, versioned, expandable, and permissioned.

## Reference extraction

From tldraw-like systems, extract:

- Shape records.
- Shape-specific props.
- Selection and transform state.
- Bindings between shapes.
- Assets separate from shapes.
- Editor store as the source of truth.

From AFFiNE-like systems, extract:

- Blocks as a common unit of content.
- Linear page mode and edgeless mode.
- Rich text, notes, embeds, databases, and linked pages as composable elements.
- A workspace model where documents and canvas objects can refer to each other.

Balnce synthesis:

- A canvas object is both a drawable/positionable record and a semantic/application object.
- A Balnce block can be rendered as a card, opened as a document, expanded as an app, delegated to an agent, or connected to provenance/commerce.

## Top-level object taxonomy

```ts
export type CanvasObject =
  | ShapeObject
  | DrawObject
  | TextObject
  | NoteObject
  | RichTextObject
  | ImageObject
  | MediaObject
  | FileObject
  | LinkObject
  | ConnectorObject
  | GroupObject
  | FrameObject
  | EmbedObject
  | DataViewObject
  | ArtifactObject
  | ChatBlockObject
  | AgentBlockObject
  | GoalBlockObject
  | MemoryClusterObject
  | IntentBlockObject
  | ResearchStreamObject
  | WorkflowBlockObject
  | OfferCommerceBlockObject
  | IdentityWalletBlockObject
  | KnowledgePodBlockObject
  | AppBlockObject;
```

## Base object contract

```ts
export interface BaseCanvasObject {
  id: string;
  canvasId: string;
  type: string;

  // Spatial state
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;

  // Hierarchy
  parentId?: string;
  frameId?: string;
  groupId?: string;

  // Interaction state
  locked?: boolean;
  hidden?: boolean;
  selectable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  draggable?: boolean;

  // Content and semantics
  title?: string;
  summary?: string;
  metadata: Record<string, unknown>;
  tags?: string[];

  // Runtime bindings
  assetIds?: string[];
  connectionIds?: string[];
  agentBindingIds?: string[];
  dataBindingIds?: string[];

  // Expansion
  expansion?: ExpansionDescriptor;

  // Provenance and permissions
  provenance?: ProvenanceDescriptor;
  permissions?: PermissionDescriptor;

  // Versioning
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  version: number;
}
```

## Expansion descriptor

```ts
export interface ExpansionDescriptor {
  mode:
    | "none"
    | "peek"
    | "side-panel"
    | "modal"
    | "focus"
    | "fullscreen"
    | "route";
  route?: string;
  preferredSurface?:
    | "canvas"
    | "document"
    | "app"
    | "chat"
    | "workflow"
    | "dashboard";
  preservesCamera: boolean;
  returnBehavior: "restore-camera" | "keep-current" | "breadcrumb";
}
```

## Provenance descriptor

```ts
export interface ProvenanceDescriptor {
  plogId?: string;
  sourceType?:
    | "user"
    | "agent"
    | "import"
    | "web"
    | "file"
    | "memory"
    | "commerce"
    | "generated";
  sourceRefs?: string[];
  rights?: {
    shareable: boolean;
    revocable: boolean;
    exportable: boolean;
    commercialUseAllowed?: boolean;
  };
  signature?: string;
  lastVerifiedAt?: string;
}
```

## Connection model

Connections must support both visual and semantic relationships.

```ts
export interface CanvasConnection {
  id: string;
  canvasId: string;
  type:
    | "arrow"
    | "line"
    | "semantic-link"
    | "dependency"
    | "reference"
    | "workflow-edge"
    | "agent-route"
    | "commerce-intent"
    | "memory-link";

  fromObjectId: string;
  toObjectId: string;
  fromAnchor?: AnchorDescriptor;
  toAnchor?: AnchorDescriptor;
  label?: string;
  metadata?: Record<string, unknown>;
  style?: ConnectionStyle;
  createdAt: string;
  updatedAt: string;
}
```

## Binding model

Bindings are persistent relationships that survive movement and transformation.

Examples:

- Arrow sticks to a block.
- Comment is attached to a region.
- Agent monitor is attached to a workflow.
- Offer block is attached to an intent block.
- Memory cluster is attached to source artifacts.
- App block is bound to a data view.

```ts
export interface CanvasBinding {
  id: string;
  type:
    | "arrow-binding"
    | "comment-binding"
    | "asset-binding"
    | "agent-binding"
    | "data-binding"
    | "memory-binding"
    | "commerce-binding"
    | "provenance-binding";

  sourceId: string;
  targetId: string;
  behavior:
    | "follow"
    | "stick"
    | "contain"
    | "reference"
    | "mirror"
    | "sync"
    | "observe"
    | "execute";
  metadata?: Record<string, unknown>;
}
```

## Content block grammar

Every block should expose:

- Compact rendering.
- Selected rendering.
- Editing rendering.
- Expanded rendering.
- Inspect rendering.
- Loading/activity rendering.
- Error rendering.
- Permission/provenance rendering where relevant.

```ts
export interface CanvasBlockCapabilities {
  canEditInline: boolean;
  canExpand: boolean;
  canConnect: boolean;
  canExecute: boolean;
  canBeObservedByAgent: boolean;
  canContainChildren: boolean;
  canHaveDataBindings: boolean;
  canExport: boolean;
  canShare: boolean;
  canRevoke: boolean;
}
```

## Common object states

```ts
export type CanvasObjectState =
  | "idle"
  | "hovered"
  | "selected"
  | "multi-selected"
  | "editing"
  | "dragging"
  | "resizing"
  | "rotating"
  | "connecting"
  | "expanded"
  | "inspected"
  | "generating"
  | "syncing"
  | "error"
  | "locked"
  | "archived";
```

## Balnce-native semantics

Balnce blocks should add these optional dimensions:

- `intent`: what the user is trying to do.
- `agentOwner`: which agent is responsible.
- `memoryScope`: what memories are attached or allowed.
- `executionScope`: local, device mesh, Edge Twin, or external service.
- `identityScope`: user, agent, business, brand, family, team.
- `commerceScope`: AURA, offer, negotiation, purchase, reward.
- `provenanceScope`: source, rights, PLOG, revocation.
- `goalScope`: tasks, subtasks, milestones, check-ins.

## Object model acceptance criteria

- All visible objects are represented by typed records.
- All relationships are represented by explicit connections or bindings.
- All object mutations are undoable.
- Rich objects do not bypass the shared spatial model.
- Agent-created objects have provenance and source metadata.
- Blocks can evolve from simple cards to full applications without changing identity.
- The model supports local-first persistence and future multiplayer sync.
