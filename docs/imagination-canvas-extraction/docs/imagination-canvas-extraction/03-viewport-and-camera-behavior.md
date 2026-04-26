# 03 — Viewport and Camera Behavior

## Purpose

This document defines the camera system for the Imagination Canvas. The camera is the user's body in the space. If the camera feels wrong, the entire product feels wrong.

## Camera principles

1. **Pan and zoom must feel native.**
2. **The pointer should remain the anchor during zoom.**
3. **The user should never feel lost after a transition.**
4. **AI should not move the camera without preview or permission.**
5. **Camera motion should explain navigation, not decorate it.**

## Coordinate spaces

The implementation should distinguish:

- **Screen coordinates**: pointer, touch, DOM elements.
- **Viewport coordinates**: visible rectangle and UI overlays.
- **Canvas/world coordinates**: object positions in infinite space.
- **Object-local coordinates**: internal editing and transform math.
- **Semantic coordinates**: clusters, groups, paths, focus regions.

All transformations must be explicit and testable.

## Camera state contract

```ts
export interface CanvasViewport {
  id: string;
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
  width: number;
  height: number;
  mode: "free" | "focus" | "presentation" | "follow" | "locked";
  previous?: {
    x: number;
    y: number;
    zoom: number;
    reason: string;
  };
}
```

## Pan behavior

### Mouse

- Spacebar + drag pans.
- Middle mouse drag pans.
- Background drag may pan when selection tool is not in marquee mode.
- Cursor should change to hand/grabbing states.

### Trackpad

- Two-finger pan should follow OS expectations.
- Avoid fighting browser scroll.
- Diagonal movement should feel smooth.
- Momentum should be damped, not endless.

### Touch

- One-finger pan when not editing an object.
- Two-finger pan/zoom when object is selected or editing state is ambiguous.
- Avoid accidental object moves during pan.

## Zoom behavior

Rules:

- Zoom should anchor under pointer/finger midpoint.
- Zoom levels should be continuous but may snap subtly at useful thresholds.
- Zoom should support:
  - trackpad pinch
  - mouse wheel + modifier
  - keyboard shortcuts
  - toolbar controls
  - minimap interactions
  - zoom-to-selection
  - fit-to-content
  - reset view

Recommended ranges:

```txt
Min zoom: 0.05x
Comfort overview: 0.15x–0.35x
Default: 1.0x
Detail: 1.5x–3.0x
Max zoom: 8x–16x depending on rendering
```

## Zoom thresholds

At different zoom levels, the rendering system should adapt.

### Far overview

- Hide detailed text.
- Show blocks as semantic cards or labels.
- Show cluster boundaries.
- Reduce shadows and heavy effects.
- Show active/important blocks only.

### Normal work level

- Full object rendering.
- Standard selection and manipulation.
- Text readable.
- Inline actions available.

### Detail level

- Rich editing available.
- Fine transform handles.
- Embedded app interactions.
- Developer/debug details may be visible.

## Fit and focus commands

### Fit to content

- Calculates bounding box of all visible objects.
- Applies comfortable padding.
- Does not include hidden/archived objects.
- If canvas is empty, returns to origin/default view.

### Zoom to selection

- Calculates selected objects' bounding box.
- Applies padding based on object count and type.
- Preserves selection.
- Should not over-zoom tiny objects beyond a readable maximum.

### Focus region

- Creates a temporary camera state scoped to object, group, cluster, or frame.
- Breadcrumb records previous camera.
- ESC/back returns.

### Return to previous camera

- Required after expansion, focus, presentation, and AI preview modes.
- Must restore x, y, zoom, selected object, and panel state where appropriate.

## Minimap behavior

Minimap is optional but recommended for large canvases.

Rules:

- Shows object density and current viewport.
- Allows click/drag to move camera.
- Should hide at small canvas sizes.
- Should not expose private/provenance-sensitive object contents.
- Agent activity can appear as subtle pings.

## Spatial memory

Each canvas should remember:

- Last viewport per user.
- Last selected object.
- Last open inspector state.
- Focus history.
- Presentation path.
- Per-device viewport preferences.

## AI camera rules

AI actions may propose camera movement but should not surprise the user.

Allowed automatic camera moves:

- First insertion into an empty canvas.
- User explicitly says “show me,” “focus on,” “organize this,” or “zoom to results.”
- After creating a block from the current prompt, if the block appears outside current viewport, camera may reveal it.
- Guided onboarding sequences.

Forbidden automatic moves:

- Background agent work yanking the user away.
- AI clustering while user is editing another object.
- Tool results opening far away without a visible path.
- Repeated camera jumps during streaming generation.

## Camera motion tokens

Suggested defaults:

```ts
export const cameraMotion = {
  immediate: 0,
  fast: 120,
  standard: 180,
  spatial: 260,
  cinematic: 420,
  maxComfort: 600,
};
```

Use shorter motion for utility actions and longer motion only when the transition carries meaning.

## Viewport acceptance criteria

- Pan/zoom feels smooth at 60fps where possible.
- Zoom anchors under pointer.
- Fit-to-content and zoom-to-selection feel predictable.
- User can always return from focus/expanded/presentation modes.
- Mobile gestures do not conflict with object editing.
- Large canvases remain navigable through minimap, search, and semantic zoom.
- AI actions do not hijack the camera.
