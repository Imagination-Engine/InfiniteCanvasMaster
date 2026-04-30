# 13 — Mobile, Touch, and Stylus Rules

## Purpose

This document defines how the Imagination Canvas behaves on mobile, tablet, and stylus surfaces. Mobile must not be an afterthought. The canvas should feel native to touch, even if full power is easier on desktop.

## Mobile philosophy

Desktop canvas is a studio.
Tablet canvas is a sketchbook.
Mobile canvas is a pocket portal into creation.

Mobile users should be able to:

- Review a canvas.
- Add quick thoughts.
- Talk to their AI.
- Create simple blocks.
- Move and organize lightweight objects.
- Expand a block.
- Approve agent actions.
- Capture media.
- Continue work started elsewhere.

They do not need every desktop affordance visible at once.

## Gesture grammar

### One-finger gestures

- Pan canvas when background touched.
- Select object on tap.
- Drag selected object after threshold.
- Edit text after second tap or explicit edit button.
- Long-press opens context menu.

### Two-finger gestures

- Pinch zoom.
- Two-finger pan.
- Rotate canvas should be disabled unless explicitly enabled.
- Two-finger tap may undo if platform convention supports it.

### Stylus gestures

- Stylus draws in draw mode.
- Finger pans while stylus draws if hardware supports.
- Barrel button or long press opens tool switch/context menu.
- Pressure/tilt optional, not MVP-critical.
- Palm rejection should be enabled where possible.

## Mobile modes

### Navigate mode

Default.

- One-finger pan.
- Pinch zoom.
- Tap selects.
- Toolbar minimized.

### Create mode

Activated by bottom `+`.

- Quick-add sheet.
- Recent block types.
- Voice/prompt input.
- Camera/file capture.
- Paste/import.

### Edit mode

Activated after selecting block and choosing edit.

- Block is prioritized.
- Keyboard opens.
- Canvas chrome reduces.
- Done button exits edit mode.
- Background pan disabled while typing.

### Inspect mode

Bottom sheet.

- Object details.
- Style.
- Agent actions.
- Metadata.
- Permissions.

### Agent mode

Natural for mobile.

- User asks AI to organize, create, summarize, or update.
- AI does heavier spatial work.
- User reviews and approves.

## Hit target rules

- Minimum touch target: 44px.
- Preferred primary controls: 48–56px.
- Transform handles: 18–28px visual, 44px invisible target.
- Context menu rows: 44–52px.
- Bottom sheet drag handle: obvious and reachable.

## Mobile selection

Rules:

- Tap selects object.
- Tap selected object reveals quick actions.
- Double tap edits or opens depending on object type.
- Long press opens context.
- Multi-select via explicit selection mode.
- Marquee/lasso optional for tablet, not required for phone MVP.

## Mobile transform

- Move by dragging selected object.
- Resize through large handles.
- Rotation hidden under more controls unless object type needs it.
- Snap guides simplified.
- Fine alignment can be AI-assisted.

## Mobile expansion

Expansion choices:

- Bottom sheet for inspect/peek.
- Focus mode for clusters.
- Fullscreen route for app blocks.
- Document mode for rich writing.
- Chat sidecar becomes bottom/primary screen.

Rules:

- Always show back/close.
- Return to previous canvas camera.
- Avoid tiny embedded app controls inside small blocks.

## Camera on mobile

- Pinch zoom anchored under midpoint.
- Avoid over-sensitive zoom.
- Fit-to-selection helpful.
- Mini-map usually hidden unless large tablet.
- Search/outline may replace minimap.

## Capture-first flows

Mobile should excel at capture.

Create from:

- Voice note.
- Camera photo.
- Screenshot.
- File share sheet.
- URL share sheet.
- Text selection share.
- Quick thought.
- Location/event where permitted.

These should land as blocks on the canvas or into an inbox region for later organization.

## Mobile AI affordances

Because spatial manipulation is harder on phone, AI should assist:

- “Organize this.”
- “Add this to my launch canvas.”
- “Summarize this cluster.”
- “Turn this note into tasks.”
- “Create blocks from this voice memo.”
- “Find where this belongs.”

## Mobile acceptance criteria

- Pan/zoom/select feel natural.
- Users can add and edit simple blocks.
- Bottom sheets replace complex side panels.
- App blocks can expand fullscreen.
- Touch targets are large enough.
- Mobile supports capture and approval flows beautifully.
- Desktop power features degrade gracefully, not chaotically.
