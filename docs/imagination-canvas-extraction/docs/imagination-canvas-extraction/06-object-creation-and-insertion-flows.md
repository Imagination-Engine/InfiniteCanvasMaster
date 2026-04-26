# 06 — Object Creation and Insertion Flows

## Purpose

This document defines how users create objects on the Imagination Canvas. Creation must feel instant, forgiving, and context-aware. The system should support both direct manipulation and intent-driven generation.

## Creation principles

1. Creation should take one action when possible.
2. Default placement should be predictable.
3. New objects should appear in or near the user's current focus.
4. Users should be able to create by typing, drawing, dropping, pasting, asking, or selecting a tool.
5. AI-created objects must appear with provenance and reversible actions.
6. Empty canvas should invite creation, not intimidate.

## Creation channels

### 1. Toolbar creation

User selects tool, then clicks/taps on canvas.

Objects:

- Text.
- Note.
- Shape.
- Connector.
- Draw/freehand.
- Image/media/file.
- Frame.
- Balnce block.

Rules:

- Tool state is visible.
- ESC returns to select tool.
- After creating one object, tool may remain active or return to select depending on tool type.
- Created object is selected by default.

### 2. Quick-add menu

Triggered by:

- `+` button.
- Double-click background.
- Keyboard shortcut.
- Right-click context menu.
- Mobile floating action button.

Quick-add should include:

- Note.
- Text.
- Image/file.
- Chat block.
- Agent block.
- Artifact block.
- Goal block.
- Research stream.
- App block.
- Intent block.
- Template.

### 3. Slash command on canvas

User clicks empty canvas and types `/`.

Examples:

```txt
/note
/agent
/goal
/artifact
/app
/research
/memory
/offer
/wallet
/timeline
/table
/kanban
```

Rules:

- Command menu appears at cursor/click location.
- Selecting a command creates object at that location.
- Search within commands supports synonyms.
- Recent and recommended block types appear first.

### 4. Type-to-create

If user starts typing on empty canvas:

- Create text object or note depending on default mode.
- Text appears at pointer/camera center.
- Enter or blur completes.
- Markdown shortcuts may transform block type.

### 5. Paste-to-create

Clipboard handling:

- Text → text/note block.
- URL → link preview block.
- Image → image block.
- File → file block.
- JSON/schema → data/code block.
- Multiple lines → note, checklist, or table suggestion.
- Copied canvas objects → duplicate with offset.
- Screenshot → image/artifact block with OCR/extraction option.

Rules:

- Pasted content appears near viewport center or cursor.
- Large batches are arranged in a readable stack/grid.
- User can undo entire paste as one transaction.

### 6. Drag-and-drop

Sources:

- Local files.
- Desktop.
- Browser tabs/URLs.
- Existing app objects.
- Search results.
- Chat messages.
- Artifact outputs.

Rules:

- Drop preview shows target placement.
- Unsupported files produce clear message.
- Multiple files create organized group.
- Dropping onto an existing block may attach, embed, or replace based on affordance.

### 7. Chat-to-canvas

From Intent Navigator:

- User can “place this on canvas.”
- Assistant response can split into blocks.
- Artifact previews become Artifact Blocks.
- Code/spec output becomes App/Workflow/Document blocks.
- Search results become Research Stream or cluster.

Rules:

- Placement should happen in visible canvas region.
- User can choose one block, multiple blocks, or auto-layout.
- Original chat message should retain link to created blocks.

### 8. AI-generated creation

User prompts:

- “Create a roadmap.”
- “Turn this into a product map.”
- “Make a canvas for my launch plan.”
- “Generate an app architecture.”
- “Cluster these notes.”
- “Create an agent team for this goal.”

Rules:

- AI should preview plan before destructive changes.
- New generated objects should stream into view as blocks.
- Each generated block has source/provenance.
- Generation can be stopped.
- Partial generation is preserved unless user discards.
- User can accept, edit, regenerate, or undo.

## Placement rules

### Default placement

- If triggered by pointer, place at pointer.
- If triggered by keyboard, place at viewport center.
- If generated from selected object, place near selection.
- If generated from chat, place in a new clear region near current viewport.
- If generated from a cluster, place inside or adjacent to cluster.
- If canvas is empty, place near origin with welcoming composition.

### Collision handling

- Avoid covering selected objects.
- Offset duplicates slightly.
- Arrange multiple created objects into grid, stack, radial cluster, or semantic map based on type.
- Do not scatter objects randomly.

### Insertion into frames/groups

- If user creates inside frame bounds, object belongs to frame.
- If user drops onto group, show attach/insert intent.
- If ambiguous, default to top-level but allow reparenting.

## Templates

Template types:

- Blank idea board.
- Research board.
- Pitch deck map.
- Product spec canvas.
- Goal plan.
- Agent team workspace.
- Commerce/intentcasting board.
- Personal memory map.
- Learning module.
- App builder workspace.

Templates should create structured clusters, not rigid locked layouts.

## Creation states

```ts
export type CreationState =
  | "idle"
  | "tool-selected"
  | "placing"
  | "previewing"
  | "creating"
  | "generating"
  | "uploading"
  | "importing"
  | "complete"
  | "error";
```

## Creation acceptance criteria

- Users can create notes, text, shapes, connectors, files, and Balnce blocks with minimal friction.
- Paste and drag/drop produce intelligent defaults.
- Chat outputs can become canvas blocks.
- AI-generated blocks appear in a controlled, reversible way.
- Newly created objects are selected and ready to edit.
- Creation is fully undoable.
