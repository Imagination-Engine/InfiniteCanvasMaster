# 02 — Shell and Layout Audit

## Purpose

This document defines the shell, layout, and surface architecture for the Imagination Canvas. The shell must provide enough structure to make infinite space usable without making the canvas feel trapped inside a traditional app frame.

## Shell philosophy

The shell should behave like a quiet cockpit around an infinite field. It should be present enough to orient the user and powerful enough to expose tools, but restrained enough that the canvas remains the primary experience.

The canvas shell must support three levels of density:

1. **Creation mode** — minimal UI, maximum open space.
2. **Work mode** — toolbars, inspector, panels, and object details visible.
3. **Review/presentation mode** — chrome reduced, selected story/flow emphasized.

## Primary shell regions

### 1. Top workspace bar

Responsibilities:

- Workspace name.
- Canvas/page title.
- Current mode: Canvas, Doc, Split, Focus, Present.
- Save/sync/offline status.
- Share/collaboration controls.
- Search/command entry.
- Agent status entry point.
- User/account/wallet shortcut where relevant.

Behavior:

- Stays anchored.
- Can collapse into a minimal pill in focus mode.
- On mobile, becomes a compact top rail or bottom sheet trigger.
- Should not contain dense editing controls.

### 2. Left rail or floating tool dock

Responsibilities:

- Selection tool.
- Pan/hand tool.
- Draw/freehand.
- Text/note.
- Shape.
- Connector.
- Media/file insert.
- Balnce block insert.
- Quick-add / slash / command launcher.

Behavior:

- Desktop: vertical floating dock or left rail.
- Tablet: floating dock with larger hit targets.
- Mobile: condensed bottom toolbar or radial action button.
- Can be hidden in presentation or focus mode.
- Tool selection must be visibly clear but visually quiet.

### 3. Right inspector

Responsibilities:

- Selected object properties.
- Style controls.
- Data bindings.
- Agent bindings.
- Block-specific settings.
- Permissions/provenance.
- History and activity.
- Expansion controls.

Behavior:

- Opens only when useful.
- Supports pinned and transient states.
- Does not cover the selected object unless viewport makes that unavoidable.
- On mobile, appears as a bottom sheet.
- Inspector sections should be collapsible and contextual.

### 4. Bottom command zone

Responsibilities:

- Contextual hints.
- Selected object quick actions.
- “Ask AI about selection.”
- Generation status.
- Navigation breadcrumbs in focus modes.

Behavior:

- Should not duplicate the top bar.
- Should appear only during selection, generation, guided flows, or keyboard shortcut discovery.
- On mobile, merges with bottom toolbar.

### 5. Canvas viewport

Responsibilities:

- Infinite spatial rendering.
- Camera/pan/zoom.
- Object rendering.
- Selection overlays.
- Connector layer.
- Agent activity indicators.
- Presence layer.
- Minimap overlay.

Behavior:

- Occupies maximum available real estate.
- Must own pointer and gesture disambiguation.
- Must not be destabilized by side panels; if panels appear, the viewport should smoothly resize or overlay predictably.

## Layering model

The shell should use clear z-index layers:

1. Background grid / infinite field.
2. Canvas objects.
3. Connectors and semantic relationship overlays.
4. Selection outlines and transform handles.
5. In-object editors.
6. Presence cursors and comments.
7. Floating object actions.
8. Minimap and viewport utilities.
9. Toolbars and inspectors.
10. Menus, popovers, command palette.
11. System modals and permission gates.

## Layout modes

### Full canvas mode

Default creative mode.

- Canvas fills the screen.
- Tool dock visible.
- Inspector hidden unless selection requires it.
- Top workspace bar visible.
- Minimap optional.

### Canvas + inspector mode

Used when an object is selected or configured.

- Right inspector opens.
- Canvas resizes or overlays depending on screen width.
- Selected object remains visible.
- Camera may gently pan to keep selection unobstructed, but only with user-friendly easing.

### Canvas + chat mode

Used when the Intent Navigator is cohabiting the canvas.

- Chat can appear as a docked panel, floating block, or sidecar.
- Chat outputs can be “placed” onto canvas.
- Chat should not visually dominate unless user is in intent-first mode.

### Focus mode

Used to zoom into a region, cluster, or block.

- External chrome fades/reduces.
- Breadcrumbs preserve return path.
- ESC or back returns to previous camera.
- Agent actions are scoped to the focus region.

### Split page/canvas mode

Used for AFFiNE-style page + edgeless relationship.

- Left or center document mode.
- Canvas preview or embedded canvas region.
- User can move between linear document and spatial arrangement.
- A document block on canvas can open into page mode and return.

### Presentation mode

Used to present selected frames, story paths, or generated outputs.

- Toolbars hidden.
- Navigation through frames/clusters.
- Camera transitions are cinematic but controlled.
- Presenter notes and agent prompts can appear privately.

## Desktop rules

- Toolbars can be compact but must have 36–44px hit targets.
- Trackpad gestures must feel native.
- Keyboard shortcuts must be first-class.
- Hover states may reveal secondary actions.
- Inspector may be persistent.
- Minimap is useful for large canvases.

## Tablet rules

- Hit targets increase to 44–56px.
- Stylus support should distinguish draw, select, and pan.
- Long-press opens context menu.
- Inspector becomes larger and more touch-friendly.
- Transform handles must be large enough for fingers.

## Mobile rules

Mobile cannot be treated as compressed desktop.

Rules:

- Default to one mode at a time: navigate, create, inspect, or edit.
- Use bottom sheets for inspectors and insert menus.
- Use large handles and simplified toolbars.
- Pinch zoom and one-finger pan must be reliable.
- Text editing should temporarily prioritize the selected block.
- Complex multi-select should be possible but not primary.
- AI-assisted organization becomes more important on mobile.

## Shell acceptance criteria

The shell is accepted only if:

- The canvas remains the visual hero.
- The user can hide/reveal chrome without losing orientation.
- Selection and creation remain accessible within one gesture/click.
- Inspector appears contextually and never feels like a random drawer.
- Mobile has intentionally designed controls, not squeezed desktop controls.
- Focus and presentation modes have clear entry and exit.
- Every panel has a defined owner state.
