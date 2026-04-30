# 08 — Connections, Clusters, and Spatial Organization

## Purpose

This document defines how objects relate to each other spatially and semantically. The Imagination Canvas should not become a pile of cards. It needs visual, structural, and agentic organization.

## Relationship types

### Visual relationships

- Arrows.
- Lines.
- Containers.
- Frames.
- Spatial proximity.
- Color/label grouping.
- Stacks.
- Grids.

### Semantic relationships

- Reference.
- Dependency.
- Cause/effect.
- Goal/subgoal.
- Source/derived artifact.
- Memory association.
- Agent responsibility.
- Offer/intent match.
- Workflow edge.
- Identity/provenance relationship.

## Connections

Connections should be first-class records, not decorative lines.

Capabilities:

- Attach to object anchors.
- Follow objects when moved.
- Preserve semantic type.
- Support labels.
- Support directionality.
- Support styles.
- Support metadata.
- Participate in undo/redo.
- Be selectable and editable.

## Connector interaction

Creation:

1. Select connector tool.
2. Drag from source object or empty point.
3. Hover target object to reveal anchors.
4. Release to bind.
5. Optional label entry appears.

Editing:

- Drag endpoint to rebind.
- Double click label to edit.
- Select connector to style or change semantic type.
- Delete removes connection, not objects.

## Cluster model

A cluster is a spatial and semantic group that may be user-created or AI-suggested.

```ts
export interface CanvasCluster {
  id: string;
  canvasId: string;
  title?: string;
  objectIds: string[];
  bounds: Rect;
  type:
    | "manual"
    | "semantic"
    | "research"
    | "goal"
    | "agent-team"
    | "memory"
    | "commerce"
    | "workflow"
    | "presentation";
  confidence?: number;
  createdBy: "user" | "agent" | "system";
  metadata?: Record<string, unknown>;
}
```

## Cluster behaviors

- Can be named.
- Can be collapsed.
- Can be summarized.
- Can be converted into document outline.
- Can be turned into a presentation path.
- Can become a focus region.
- Can be assigned to an agent.
- Can be exported.
- Can be forked.

## Frames

Frames are user-defined spatial containers.

Use cases:

- Presentation slides.
- Sections.
- Work phases.
- Boards.
- App screens.
- Journey stages.
- Research chapters.
- Agent work zones.

Rules:

- Objects inside frame move with frame unless excluded.
- Frames have titles.
- Frames support presentation order.
- Frames can be locked.
- Frames can contain nested frames, but use cautiously.

## Auto-layout

Auto-layout should be an optional assist, not a permanent constraint unless the user chooses it.

Modes:

- Grid.
- Stack.
- Radial.
- Timeline.
- Mind map.
- Kanban.
- Flowchart.
- Evidence map.
- Agent workflow.
- Goal tree.
- Commerce comparison.

AI may suggest auto-layout but must preview before applying large changes.

## Semantic overlays

At certain zoom levels or modes, the canvas can show overlays:

- Connections.
- Source lineage.
- Agent ownership.
- Memory relevance.
- Commerce status.
- Goal progress.
- Risk flags.
- Provenance trust.
- Open tasks.

Rules:

- Overlays are toggleable.
- Do not permanently clutter canvas.
- Overlay state should be remembered per canvas/user.

## Spatial search

User should be able to search:

- Object title/content.
- Tags.
- Source.
- Agent owner.
- Block type.
- Date.
- Status.
- Memory/provenance.
- Commerce terms.
- Goals/tasks.

Results should be shown both as a list and highlighted on canvas. Selecting result zooms to object.

## AI organization flows

AI actions:

- “Cluster these.”
- “Find related ideas.”
- “Create a roadmap from this region.”
- “Turn these notes into a pitch.”
- “Group by audience.”
- “Show dependencies.”
- “Find contradictions.”
- “Summarize this cluster.”
- “Create a presentation path.”

Rules:

- User selects region or objects first when possible.
- AI explains intended transformation.
- Large transformations require preview and confirm.
- Original layout can be restored.
- AI-generated clusters include confidence and rationale.

## Organization acceptance criteria

- Users can connect, group, frame, cluster, and arrange objects.
- Connectors remain attached during movement.
- Semantic relationships are inspectable.
- AI organization is previewable and reversible.
- Large canvases remain navigable through search, minimap, clusters, and overlays.
