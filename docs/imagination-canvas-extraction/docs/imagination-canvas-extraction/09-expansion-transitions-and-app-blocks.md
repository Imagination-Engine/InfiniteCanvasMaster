# 09 — Expansion, Transitions, and App Blocks

## Purpose

This document defines how canvas blocks expand into deeper surfaces. This is one of the most important Balnce differentiators: every block can become an app, workflow, agent workspace, document, dashboard, or immersive experience.

## Expansion principle

Expansion must preserve the user's mental model. The user should feel: “I opened this thing from the canvas,” not “I was teleported to a different app.”

## Expansion states

```ts
export type ExpansionMode =
  | "none"
  | "peek"
  | "inline-expanded"
  | "side-panel"
  | "focus-region"
  | "modal"
  | "fullscreen"
  | "route"
  | "presentation";
```

## Expansion patterns

### Peek

A lightweight preview.

Use for:

- Link preview.
- File metadata.
- Agent status.
- Offer summary.
- Memory snippet.
- Artifact details.

Behavior:

- Triggered by hover, long-press, or quick action.
- Does not change selection deeply.
- Dismisses easily.

### Inline expanded

The block grows in place.

Use for:

- Notes.
- Rich text.
- Small tables.
- Checklists.
- Lightweight app controls.

Behavior:

- Surrounding objects may remain where they are.
- Canvas does not auto-reflow unless in structured layout.
- User can collapse back.

### Side panel

Detailed inspect/configure mode.

Use for:

- Agent settings.
- Block metadata.
- Permissions.
- Provenance.
- Data bindings.
- Goal/task properties.

Behavior:

- Canvas remains visible.
- Selected block remains highlighted.
- Panel can be pinned.

### Focus region

Zooms into selected block, group, frame, or cluster.

Use for:

- Clusters.
- Goal maps.
- Research boards.
- Agent teams.
- Workflows.

Behavior:

- Camera animates into region.
- Breadcrumb appears.
- External objects fade or reduce.
- ESC/back returns.

### Fullscreen expansion

Block becomes full application surface.

Use for:

- App Block.
- Artifact editor.
- Agent Studio.
- Research Stream.
- Memory Cluster.
- Goal Planner.
- Commerce negotiation workspace.

Behavior:

- Transition originates from block bounds.
- Original camera stored.
- Close returns to canvas.
- Fullscreen surface may maintain mini-canvas breadcrumb.

### Route expansion

For complex application surfaces with URL/routing.

Rules:

- Preserve canvas origin in route state.
- Back returns to previous canvas camera if possible.
- Route should not lose block identity.

## Transition choreography

For block → fullscreen:

1. Select block.
2. User opens/expands.
3. Block frame lifts slightly.
4. Background dims or blurs subtly.
5. Block grows toward destination surface.
6. Full app controls fade in.
7. Breadcrumb appears.
8. Canvas state is stored.

For fullscreen → canvas:

1. User closes or navigates back.
2. App chrome fades.
3. Surface compresses toward original block position.
4. Canvas restores camera and selection.
5. Block may show updated summary/activity.

## App Block definition

An App Block is a canvas object that hosts a functional mini-application.

Examples:

- Website builder.
- Goal planner.
- Agent team console.
- Personal analytics dashboard.
- Research workspace.
- Commerce offer comparison.
- Memory explorer.
- Form builder.
- Workflow automation.
- Code/app preview.

```ts
export interface AppBlockObject extends BaseCanvasObject {
  type: "app-block";
  appId: string;
  appKind:
    | "builder"
    | "dashboard"
    | "workflow"
    | "editor"
    | "research"
    | "commerce"
    | "memory"
    | "agent-studio"
    | "custom";
  runtime: {
    status: "idle" | "loading" | "ready" | "running" | "error";
    localFirst: boolean;
    executionScope: "local" | "device-mesh" | "edge-twin" | "external";
  };
  dataBindings: string[];
  permissions: PermissionDescriptor;
}
```

## Expansion route examples

- Note Block → Document editor.
- Artifact Block → Artifact editor.
- Chat Block → Conversation workspace.
- Agent Block → Agent detail/studio.
- Goal Block → Goal planner.
- Memory Cluster → Memory explorer.
- Research Stream → Feed/research environment.
- Intent Block → Intent negotiation surface.
- Offer Block → Commerce comparison/acceptance.
- App Block → Full app runtime.

## Context preservation

Every expansion should preserve:

- Canvas ID.
- Object ID.
- Previous viewport.
- Selection state.
- Inspector state.
- Scroll/editor position inside block where relevant.
- Return reason.

## Error and loading states

Expansion may require loading resources.

States:

- Opening.
- Loading data.
- Loading runtime.
- Permission required.
- Offline unavailable.
- Error.
- Recovery.

Rules:

- Show the block identity while loading.
- Do not show blank modal.
- Allow return to canvas.
- Errors should include retry and inspect.

## Expansion acceptance criteria

- Every expandable block has clear affordance.
- Expansion animations preserve origin and return path.
- Fullscreen surfaces do not break canvas state.
- App Blocks can host meaningful runtime state.
- Expansion works on mobile through bottom sheet, focus, or route.
- Failure states are recoverable.
