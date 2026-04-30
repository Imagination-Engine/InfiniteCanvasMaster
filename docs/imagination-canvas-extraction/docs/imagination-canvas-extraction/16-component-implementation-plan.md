# 16 — Component Implementation Plan

## Purpose

This document converts the extraction into an implementation plan for `/packages/imagination-canvas-kit`.

## Package structure

```txt
/packages/imagination-canvas-kit
  /components
    CanvasShell
    InfiniteViewport
    CanvasToolbar
    FloatingInspector
    SideInspector
    LayerPanel
    Minimap
    SelectionOverlay
    TransformHandles
    ObjectRenderer
    ConnectorLayer
    ContextMenu
    QuickAddMenu
    CanvasCommandPalette
    CanvasBreadcrumbs
    ExpandableBlockFrame
    PresenceLayer
    blocks/
      NoteCard
      RichTextBlock
      ArtifactBlock
      ChatBlock
      AgentBlock
      GoalBlock
      MemoryClusterBlock
      ResearchStreamBlock
      IntentBlock
      OfferCommerceBlock
      IdentityWalletBlock
      WorkflowBlock
      KnowledgePodBlock
      AppBlock
  /hooks
    useViewportCamera
    useCanvasSelection
    useTransformHandles
    useObjectCreation
    useCanvasClipboard
    useCanvasDragDrop
    useCanvasShortcuts
    useBlockExpansion
    useCanvasHistory
    useSpatialNavigation
    useSemanticGrouping
    usePresenceLayer
    useAgentOnCanvas
  /state
    canvasStore.ts
    viewportStore.ts
    selectionStore.ts
    objectGraphStore.ts
    historyStore.ts
    presenceStore.ts
    inspectorStore.ts
  /contracts
    CanvasObject.ts
    CanvasBlock.ts
    CanvasConnection.ts
    CanvasViewport.ts
    CanvasSelection.ts
    CanvasEvent.ts
    ExpansionSurface.ts
    AgentCanvasTask.ts
  /tokens
    spacing.ts
    typography.ts
    radius.ts
    motion.ts
    density.ts
    elevation.ts
```

## Component responsibilities

### CanvasShell

Owns top-level layout.

Props:

```ts
interface CanvasShellProps {
  canvasId: string;
  mode: "canvas" | "focus" | "presentation" | "split" | "immersive";
  children: React.ReactNode;
}
```

Responsibilities:

- Shell regions.
- Mode transitions.
- Toolbar/inspector placement.
- Responsive adaptation.
- Global keyboard routing.

### InfiniteViewport

Owns the camera and render surface.

Responsibilities:

- Pan/zoom.
- Coordinate transforms.
- Gesture handling.
- Viewport state.
- Background/grid.
- Object layer mount.
- Overlay layer mount.

### ObjectRenderer

Maps `CanvasObject` to the correct block/shape component.

Responsibilities:

- Type dispatch.
- Selection wrappers.
- Error boundary per object.
- Lazy rendering for heavy blocks.
- Semantic zoom rendering.

### SelectionOverlay

Responsibilities:

- Selection outlines.
- Multi-select bounds.
- Marquee.
- Hover affordances.
- Locked indicators.

### TransformHandles

Responsibilities:

- Resize.
- Rotate.
- Move feedback.
- Touch handle adaptation.
- Snap guide integration.

### ConnectorLayer

Responsibilities:

- Render connections.
- Bind endpoints.
- Hit testing connectors.
- Connector labels.
- Semantic link styles.

### SideInspector

Responsibilities:

- Contextual object properties.
- Style.
- Metadata.
- Agent settings.
- Permissions.
- Provenance.
- History/activity.

### ExpandableBlockFrame

Responsibilities:

- Peek/inline/focus/fullscreen expansion.
- Transition choreography.
- Breadcrumb return.
- Loading/error states.

### CanvasCommandPalette

Responsibilities:

- Search commands.
- Create blocks.
- Run AI actions.
- Navigate objects.
- Switch modes.
- Trigger templates.

## Hook responsibilities

### useViewportCamera

- Pan.
- Zoom.
- Fit.
- Focus.
- Restore previous viewport.
- Gesture integration.
- Semantic zoom thresholds.

### useCanvasSelection

- Select.
- Multi-select.
- Marquee.
- Nested selection.
- Clear/restore selection.
- Selection keyboard controls.

### useTransformHandles

- Drag.
- Resize.
- Rotate.
- Snap.
- Group transforms.
- Transaction bundling.

### useObjectCreation

- Toolbar creation.
- Slash creation.
- Quick-add creation.
- Default placement.
- Template creation.
- AI insertion entry points.

### useCanvasClipboard

- Copy/paste canvas objects.
- Paste text/images/URLs/files.
- Semantic conversion.
- Batch placement.

### useCanvasDragDrop

- Drag files/links/blocks.
- Drop previews.
- Drop into group/frame/block.
- Upload/import state.

### useBlockExpansion

- Open/close expansion.
- Store return state.
- Handle routes/focus/fullscreen.
- Error/loading handling.

### useCanvasHistory

- Undo/redo stacks.
- Mutation transactions.
- Snapshots.
- Branch/fork.

### useAgentOnCanvas

- Create agent task.
- Scope to selection/region/object.
- Stream generated blocks.
- Preview mutations.
- Apply/revert mutations.
- Human checkpoints.

## State stores

### canvasStore

Owns:

- Canvas metadata.
- Object records.
- Connection records.
- Binding records.
- Asset refs.
- Active branch/snapshot.

### viewportStore

Owns:

- Camera state.
- Viewport history.
- Focus modes.
- Presentation modes.
- Per-user viewport memory.

### selectionStore

Owns:

- Current selection.
- Hovered object.
- Editing object.
- Marquee state.
- Nested selection path.

### objectGraphStore

Owns:

- Semantic relationships.
- Clusters.
- Frames.
- Agent bindings.
- Memory/provenance links.

### historyStore

Owns:

- Undo/redo.
- Mutation transactions.
- Snapshots.
- Recovery drafts.

### presenceStore

Owns:

- Human presence.
- Agent presence.
- Comments.
- Follow mode.

## MVP build sequence

### Milestone 1 — Canvas core

- CanvasShell.
- InfiniteViewport.
- canvasStore.
- viewportStore.
- simple object rendering.
- pan/zoom.
- create note/text/shape.
- select/move.
- local persistence.

### Milestone 2 — Manipulation

- multi-select.
- marquee.
- transform handles.
- snap guides.
- group/ungroup.
- lock/unlock.
- undo/redo.

### Milestone 3 — Blocks

- NoteCard.
- RichTextBlock.
- ArtifactBlock.
- ChatBlock.
- AgentBlock.
- GoalBlock.
- AppBlock shell.
- ObjectRenderer routing.

### Milestone 4 — Rich behaviors

- slash creation.
- paste-to-create.
- drag/drop.
- connectors.
- frames.
- inspector.
- command palette.

### Milestone 5 — Expansion

- peek.
- side panel.
- focus mode.
- fullscreen expansion.
- breadcrumb return.
- app block runtime.

### Milestone 6 — Agentic canvas

- useAgentOnCanvas.
- selected-region AI actions.
- stream generated blocks.
- mutation previews.
- human checkpoints.
- background agent indicators.

### Milestone 7 — Mobile and polish

- touch gestures.
- bottom sheets.
- mobile create/edit/inspect modes.
- accessibility.
- reduced motion.
- performance.

## Test plan

### Unit tests

- Coordinate transforms.
- Selection logic.
- Mutation transactions.
- Object creation defaults.
- Connection binding math.
- Expansion state.
- Permission gates.

### Integration tests

- Create/move/resize/undo.
- Paste multiple objects.
- Drag file to canvas.
- Expand block and return.
- AI creates blocks then undo.
- Group and connector behavior.

### E2E tests

- First-time empty canvas creation.
- Research board generation.
- Chat-to-canvas flow.
- Goal block expansion.
- Mobile capture flow.
- Agent mutation preview and approve.
- Recovery after simulated crash.

### Performance tests

- 100 objects.
- 1,000 objects.
- 10,000 lightweight objects.
- Many connectors.
- Large images.
- Streaming generation.
- Mobile pan/zoom.

## Acceptance criteria

The implementation is accepted only when:

- The viewport feels fluid.
- Selection/manipulation feels precise.
- Blocks can be created from toolbar, slash, paste, drag/drop, chat, and AI.
- At least five Balnce-native blocks render and expand.
- Undo/redo covers all core spatial changes.
- Expansion preserves camera context.
- Agent actions are scoped and reversible.
- Mobile has dedicated interaction modes.
- No production path depends on mocks, stubs, placeholders, or fake backend claims.
