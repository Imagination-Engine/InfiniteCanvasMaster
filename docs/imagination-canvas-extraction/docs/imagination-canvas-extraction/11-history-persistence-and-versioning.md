# 11 — History, Persistence, and Versioning

## Purpose

This document defines persistence, undo/redo, autosave, snapshots, branching, and recovery for the Imagination Canvas. A canvas that users trust must make work feel durable and reversible.

## Persistence principles

1. User work should feel impossible to lose.
2. Undo/redo must cover spatial and content changes.
3. Autosave should be quiet and reliable.
4. Agent changes must be auditable.
5. Large transformations require snapshots.
6. Offline-first behavior is a product advantage, not an afterthought.
7. Provenance-sensitive objects need history beyond simple undo.

## Event-sourced canvas mutations

Every meaningful change should be represented as a mutation.

```ts
export type CanvasMutation =
  | { type: "object.created"; object: CanvasObject }
  | {
      type: "object.updated";
      objectId: string;
      before: Partial<CanvasObject>;
      after: Partial<CanvasObject>;
    }
  | { type: "object.deleted"; objectId: string; object: CanvasObject }
  | {
      type: "objects.moved";
      objectIds: string[];
      delta: { x: number; y: number };
    }
  | {
      type: "objects.transformed";
      objectIds: string[];
      before: Transform[];
      after: Transform[];
    }
  | { type: "connection.created"; connection: CanvasConnection }
  | {
      type: "connection.updated";
      connectionId: string;
      before: Partial<CanvasConnection>;
      after: Partial<CanvasConnection>;
    }
  | {
      type: "connection.deleted";
      connectionId: string;
      connection: CanvasConnection;
    }
  | { type: "selection.changed"; before: SelectionState; after: SelectionState }
  | { type: "viewport.changed"; before: CanvasViewport; after: CanvasViewport }
  | { type: "agent.applied"; taskId: string; mutations: CanvasMutation[] }
  | { type: "snapshot.created"; snapshotId: string; reason: string };
```

## Undo/redo

Undoable actions:

- Create/delete object.
- Move/resize/rotate.
- Group/ungroup.
- Connect/disconnect.
- Edit content.
- Change style.
- Change metadata.
- Apply AI transformation.
- Paste/import batch.
- Auto-layout.
- Expansion edits if they mutate the block.

Not necessarily undoable:

- Viewport pan/zoom by default.
- Selection changes by default.
- Inspector open/close.
- Ephemeral hover/menus.
- Background sync.

Rules:

- Drag movement is one undo transaction.
- Batch paste is one undo transaction.
- AI generation can be undone as one group.
- Agent mutation previews should create snapshots before apply.
- Redo stack clears after new mutation.

## Autosave

Autosave layers:

1. **Immediate local write**: every mutation recorded locally.
2. **Debounced persistence**: content edits saved after delay.
3. **Background sync**: remote or mesh sync when available.
4. **Snapshot points**: before major transformations.

Status language:

- Saved.
- Saving.
- Offline, saved locally.
- Syncing.
- Conflict detected.
- Recovery available.

## Snapshots

Snapshots should be created:

- Before large AI rearrangements.
- Before imports.
- Before destructive deletes.
- Before applying templates over existing canvas.
- Before major app/workflow generation.
- Before collaboration merge if risky.

Snapshot metadata:

- Title.
- Reason.
- Timestamp.
- Created by user/agent/system.
- Object count.
- Optional thumbnail.
- Restore action.

## Branching and forking

Use cases:

- Explore alternative design.
- Create pitch variations.
- Try AI-generated strategy without destroying original.
- Fork a goal plan.
- Fork a research cluster into a report.

Branch model:

```ts
export interface CanvasBranch {
  id: string;
  parentCanvasId: string;
  rootSnapshotId: string;
  title: string;
  createdAt: string;
  createdBy: string;
  reason?: string;
}
```

## Recovery

Recovery cases:

- Browser crash.
- App crash.
- Offline sync conflict.
- Failed import.
- Failed agent operation.
- Corrupted object.
- Device sync interruption.

Rules:

- Offer recovery on next open.
- Show timestamp and summary.
- Allow preview before restore.
- Never silently discard local changes.
- Preserve conflict copies when unsure.

## Collaboration merge considerations

If multiplayer/collaboration is used:

- Last-write-wins is not acceptable for rich blocks.
- Use CRDT or operation-based merge for text where possible.
- Spatial object changes can merge by object ID and mutation timestamp.
- Conflicts must be visible if semantic collision occurs.
- Agent changes should be marked as agent-authored.

## Provenance history

Balnce-specific objects may require deeper history:

- Identity/Wallet Block.
- Commerce Offer Block.
- PLOG-attached Artifact.
- Shared Memory Block.
- Agent actions with external consequences.

These require:

- Audit trail.
- Signatures where applicable.
- Revocation state.
- Rights changes.
- Source lineage.

## History acceptance criteria

- Normal editing feels impossible to lose.
- Undo/redo works across spatial and content operations.
- Agent changes are reversible or checkpointed.
- Offline work is preserved.
- Snapshots and branch/fork are available for major creative divergence.
- Provenance-sensitive objects have audit trails.
