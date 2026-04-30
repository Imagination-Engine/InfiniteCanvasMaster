# 07 — Rich Editing and Embedded Content

## Purpose

This document defines how rich content lives inside canvas blocks. The goal is to blend spatial freedom with serious writing, structured editing, media handling, and application-level interaction.

## Editing principles

1. Selection and editing are separate states.
2. Rich content should not break canvas navigation.
3. Inline editing should be fast for simple changes.
4. Deep editing should expand into a suitable surface.
5. Every editable block needs save, undo, focus, and escape rules.
6. Mobile editing must temporarily reduce spatial complexity.

## Editing modes

### Inline edit

Used for:

- Short notes.
- Titles.
- Text blocks.
- Captions.
- Labels.
- Checklist items.

Entry:

- Double click.
- Enter while selected.
- Type on selected text object.
- Mobile tap then edit.

Exit:

- ESC.
- Click outside.
- Cmd/Ctrl+Enter.
- Blur on mobile if safe.

Rules:

- Canvas pan/zoom should be disabled or scoped while editing.
- Text selection must work normally.
- Keyboard shortcuts should route to editor while editing.
- Object selection outline should remain but be softened.

### Embedded edit

Used for:

- Rich text blocks.
- Tables.
- Checklists.
- Code blocks.
- Media controls.
- Small app blocks.

Rules:

- User interacts inside the object.
- Canvas drag must not steal pointer events.
- Object can show an “editing” frame.
- ESC exits embedded editor before clearing selection.

### Side-panel edit

Used for:

- Metadata.
- Permissions.
- Agent settings.
- Prompt/system settings.
- Data bindings.
- Provenance.
- Commerce terms.
- Goal details.

Rules:

- Keeps canvas context visible.
- Does not require full expansion.
- Suitable for structured configuration.

### Expanded edit

Used for:

- Full documents.
- Complex apps.
- Workflows.
- Dashboards.
- Agent studios.
- Goal planners.
- Memory clusters.
- Research streams.

Rules:

- Block expands from its canvas position.
- Previous camera and selection are stored.
- Breadcrumb or close action returns to canvas.
- Expansion does not destroy block identity.

## Rich text behavior

Supported content:

- Headings.
- Paragraphs.
- Bullets.
- Numbered lists.
- Checklists.
- Quotes.
- Code.
- Links.
- Mentions.
- References.
- Inline AI actions.

Suggested controls:

- Floating selection toolbar.
- Slash menu.
- Markdown shortcuts.
- Paste cleanup.
- Link previews.
- Transform block type.

## Embedded content types

### Media

- Images.
- Video.
- Audio.
- PDFs.
- Screenshots.
- Generated visual artifacts.

Requirements:

- Resize and crop.
- Captions.
- Source/provenance.
- Open/expand.
- Extract text or summarize with AI.
- Replace media without losing object identity.

### Files

- Display filename, type, size, source, upload/sync status.
- Allow preview if supported.
- Allow chat/research over file if permissions allow.
- Version and provenance should be visible.

### Links and embeds

- URL preview.
- Web embed where safe.
- Fallback card.
- Source metadata.
- Refresh preview.
- Convert to research block or artifact.

### Code

- Syntax highlighting.
- Copy.
- Expand.
- Run/preview only if execution environment is available and safe.
- Link to App Block or Workflow Block when code becomes functional.

### Data views

- Table.
- Kanban.
- Timeline.
- Calendar.
- Graph.
- Dashboard card.

Data views need explicit data source bindings and refresh state.

## Canvas vs document mode

AFFiNE-style hybrid behavior is important:

- A block can be a document on the canvas.
- A document can contain embedded canvas sections.
- A canvas cluster can be converted into a linear doc outline.
- A doc section can be exploded into spatial blocks.

Balnce-specific examples:

- Chat answer → document block → canvas storyboard.
- Goal plan → task board → weekly report doc.
- Research stream → evidence map → final memo.
- Agent workflow → visual graph → system spec.

## Editing conflict rules

Potential conflicts:

- Drag vs select text.
- Pan vs scroll inside block.
- Keyboard shortcut for canvas vs editor.
- Pinch zoom vs image zoom.
- Agent update vs user edit.
- Autosave vs remote sync.

Resolution:

- Editing state owns keyboard/pointer inside the block.
- Canvas shortcuts require ESC or modifier when editing.
- Agent updates cannot overwrite active user edit.
- Conflicting remote/agent edits create merge notice.

## Autosave

Rules:

- Inline edits debounce locally.
- Critical blocks save immediately on exit.
- Offline edits queue.
- Unsynced status visible but quiet.
- User should almost never need a manual save.

## Rich editing acceptance criteria

- Users can edit simple text inline with no friction.
- Rich blocks support deeper editing without losing canvas context.
- Embedded content handles pointer/keyboard conflicts correctly.
- AI actions can operate on selected text/block/region.
- Autosave and undo work inside and outside expanded modes.
- Mobile editing is usable and intentional.
