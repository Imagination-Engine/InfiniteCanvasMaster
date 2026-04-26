# 05 — Selection, Manipulation, and Transformations

## Purpose

This document defines selection and manipulation behavior for the Imagination Canvas. Selection is the user's handshake with the spatial system. It must feel precise, predictable, and forgiving.

## Selection principles

1. The user must always know what is selected.
2. Selection should not interfere with reading or editing.
3. Nested objects need clear selection depth.
4. Multi-select must be powerful but not chaotic.
5. Transform controls should appear only when actionable.
6. Touch handles must be larger than mouse handles.
7. Locked and agent-controlled objects must communicate restrictions clearly.

## Selection states

```ts
export type SelectionState =
  | { type: "none" }
  | { type: "single"; objectId: string; editing?: boolean }
  | { type: "multi"; objectIds: string[] }
  | { type: "group"; groupId: string; childIds: string[] }
  | { type: "region"; bounds: Rect; objectIds: string[] }
  | { type: "semantic"; semanticQuery: string; objectIds: string[] };
```

## Single selection

Rules:

- Click/tap object selects it.
- Selection outline appears immediately.
- Quick actions may appear after a slight delay or on hover.
- Inspector may open depending on mode.
- Double click enters edit/open behavior depending on object type.
- ESC clears selection or exits editing first.

## Multi-selection

Rules:

- Shift-click toggles object in selection.
- Drag marquee selects intersecting objects.
- Alt/Option behavior may duplicate during drag.
- Multi-selection shows shared bounding box.
- Inspector shows bulk actions only.
- Transform applies to all selected objects.
- Mixed locked/unlocked selection should transform only eligible objects or warn before action.

## Marquee and lasso

### Marquee

- Background drag creates rectangular selection.
- Direction may determine containment vs intersection if desired.
- Visual overlay should be subtle, translucent, and readable.
- Should not begin if drag starts on an interactive object unless modifier key is held.

### Lasso

- Useful for organic visual boards and stylus.
- More optional than marquee.
- Should be supported later if not MVP.

## Transform handles

Desktop handle set:

- Corner resize.
- Edge resize.
- Rotation handle.
- Move via body drag.
- Connection anchors for supported objects.
- Quick action affordances.

Touch handle set:

- Larger corners.
- Fewer visible controls at once.
- Rotation may be secondary or hidden behind mode.
- Long-press opens more actions.

## Transform rules

### Move

- Drag selected object.
- Snap to grid, guides, frames, or nearby object edges if enabled.
- Movement must be undoable as one transaction.
- While dragging, connectors should follow via bindings.
- Drag threshold prevents accidental movement during click.

### Resize

- Corner resize preserves aspect ratio when modifier held or object requires it.
- Edge resize adjusts one dimension.
- Text and rich blocks may reflow contents.
- Minimum sizes must be type-specific.
- Resize should not corrupt child layouts.

### Rotate

- Rotation handle appears for rotatable objects.
- Snapping to 0/45/90 degrees with modifier or proximity.
- Some blocks should disable rotation by default, especially app, chat, and data blocks.

### Group

- Multi-select can create group.
- Group has its own selection bounds.
- Double click or Enter enters group selection depth.
- Ungroup preserves child positions.

### Lock

- Locked objects cannot move, edit, or transform unless unlocked.
- Locked state must be visible in inspector and optionally as small icon.
- Lock should be useful for background frames, templates, and guided experiences.

## Snapping and guides

Snap targets:

- Canvas grid.
- Object edges.
- Object centers.
- Frame boundaries.
- Semantic cluster boundaries.
- Connection anchors.
- Layout columns/rows.
- Nearby sibling blocks.

Guidelines:

- Snapping should feel magnetic, not sticky.
- Provide a setting to disable.
- Show temporary guide lines only when relevant.
- Snap strength should adapt to zoom level.

## Z-order

Actions:

- Bring forward.
- Send backward.
- Bring to front.
- Send to back.
- Move into frame/group.
- Pin above background.
- Pin to viewport for special overlays.

Rules:

- Connectors should render below primary objects but above background.
- Comments and agent indicators should render above objects.
- Expanded blocks leave normal z-order and enter expansion layer.

## Nested selection

Nested blocks are critical for Balnce.

Example:

- A Goal Block contains task cards.
- An App Block contains UI components.
- A Research Stream contains article cards.
- A Memory Cluster contains memory nodes.

Rules:

- First click selects container.
- Second click or Enter enters container.
- Breadcrumb shows depth.
- ESC exits child editing first, then group focus.
- Keyboard navigation should work within nested context.

## Agent-protected selection

Some objects may be actively generated or controlled by agents.

Rules:

- User can always select them.
- Editing may require pausing agent work.
- Transforming while generating should either be allowed with reconciliation or blocked with explanation.
- Agent changes must never override active user drag/edit.

## Selection acceptance criteria

- Single select, multi-select, marquee, drag, resize, and keyboard nudging work predictably.
- Handles are readable at standard zoom levels.
- Touch handles are usable with fingers.
- Connectors follow moved objects.
- Group/nesting rules are clear.
- Locked objects behave consistently.
- All selection changes and transforms are undoable.
