# 12 — Collaboration, Presence, and Comments

## Purpose

This document defines collaboration behaviors for the Imagination Canvas. Collaboration should feel alive and respectful, not chaotic. Even if MVP is single-user, the architecture should not block future multiplayer and agent-human co-creation.

## Collaboration principles

1. Presence should orient, not distract.
2. Users need clear ownership and authorship.
3. Comments should attach to objects or regions.
4. Follow mode should be explicit.
5. Permission boundaries must be clear.
6. Agent presence should be distinguishable from human presence.
7. Collaboration should never break local-first trust.

## Presence model

Presence includes:

- Cursor/pointer position.
- Viewport.
- Selected objects.
- Active editing state.
- User/agent identity.
- Status.
- Last active time.

```ts
export interface CanvasPresence {
  actorId: string;
  actorType: "human" | "agent" | "system";
  displayName: string;
  color?: string;
  cursor?: { x: number; y: number };
  viewport?: CanvasViewport;
  selection?: SelectionState;
  status?: "active" | "idle" | "editing" | "presenting" | "running-task";
  updatedAt: string;
}
```

## Human cursors

Rules:

- Show live cursor when active.
- Show name label briefly, then reduce.
- Hide or fade idle cursors.
- Show selection outlines in user color if useful.
- Avoid clutter with many collaborators; use presence list and hover reveal.

## Agent presence

Agent presence should feel different from human presence.

Examples:

- Soft halo around scoped region.
- Small agent badge on block.
- Activity trace in inspector.
- “Agent is working here” status.
- No fake human cursor unless explicitly represented as a persona.

## Comments

Comment types:

- Object comment.
- Region comment.
- Threaded discussion.
- Agent suggestion.
- Review note.
- Decision record.

Rules:

- Comments attach via bindings.
- Moving object moves attached comments.
- Region comments preserve bounds.
- Resolved comments can hide but remain available.
- Comments can be converted to tasks or blocks.

## Follow mode

Use cases:

- Co-presenting.
- Teacher/student.
- Agent guided tour.
- Live design review.
- Presentation.

Rules:

- Follow mode is explicit.
- Follower can exit anytime.
- Presenter camera changes control follower viewport only while following.
- Private panels or sensitive blocks should not be revealed without permission.

## Permissions

Permission dimensions:

- View canvas.
- Comment.
- Edit.
- Move objects.
- Create objects.
- Run agents.
- Access memory.
- Access identity/provenance.
- Access commerce actions.
- Export/share.
- Publish.

Balnce-specific:

- User can share a canvas without sharing underlying private memory.
- Agent blocks may have narrower permission than the human owner.
- Commerce/identity blocks require stronger permission gates.
- Shared artifacts may have revocation rights.

## Collaboration states

```ts
export type CollaborationState =
  | "private"
  | "shared-view"
  | "shared-comment"
  | "shared-edit"
  | "live-session"
  | "presentation"
  | "agent-collaboration"
  | "published";
```

## Conflict handling

Potential conflicts:

- Two users edit same rich block.
- User moves object while agent reorganizes.
- User deletes object another user comments on.
- Permissions change during session.
- Offline collaborator syncs stale state.

Rules:

- Active human edit wins over agent automation.
- Rich text should merge if technically possible.
- Spatial conflicts should preserve both when unsure.
- Deleting commented/shared/provenance objects requires warning.
- Conflicts should create recoverable versions.

## Collaboration acceptance criteria

- Presence is helpful and not distracting.
- Comments attach to objects/regions and survive movement.
- Follow mode is explicit and escapable.
- Permissions are granular enough for Balnce privacy model.
- Agent collaboration is inspectable and distinguishable from human collaboration.
- Conflict handling protects user work.
