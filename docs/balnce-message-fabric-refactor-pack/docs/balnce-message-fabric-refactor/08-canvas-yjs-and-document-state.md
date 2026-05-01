# 08 — Canvas, Yjs, and Document State

## Principle

The canonical canvas document state must not be the same stream as agent token deltas.

## Document state owns

- canvas objects
- object positions
- object dimensions
- block metadata
- connector relationships
- rich text state
- group/cluster state
- final accepted generated outputs

## Yjs/tldraw sync role

If using custom/AFFiNE-like block canvas, Yjs is a strong candidate for collaborative shared state.

If using tldraw as the engine, tldraw sync may own store synchronization.

## Agent streaming rule

Do not commit every token or partial generation to the document-state lane.

Correct flow:

```txt
agent_stream delta
  ↓
UI projection renders live text in block
  ↓
message/artifact completes
  ↓
user/system accepts or stabilizes output
  ↓
document_state commits final content
  ↓
durable_event/provenance records important completion
```

## Presence

Cursor, selection, and collaborator viewport state belong in `presence`, not `document_state`, unless explicitly persisted as an artifact.

## Adapter boundary

The fabric should expose document-state actions, but the CRDT adapter owns merge behavior.

Example:

```ts
await fabric.commitDocumentChange({
  canvasId,
  objectId,
  change: { type: "object.patch", patch },
});
```

The adapter may turn that into a Yjs transaction or tldraw store update.
