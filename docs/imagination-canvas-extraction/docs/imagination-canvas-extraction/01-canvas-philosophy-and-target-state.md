# 01 — Canvas Philosophy and Target State

## Purpose

This document defines the target state for the Balnce Imagination Canvas: an infinite, agentic, spatial creation environment where thought becomes tangible and every object can evolve from a lightweight idea into a full application, workflow, artifact, memory structure, agent, or economic relationship.

The canvas is the visual-spatial counterpart to the Intent Navigator. Chat is where intent is spoken. The canvas is where intent becomes visible, composable, and executable.

## Extraction stance

The target references are:

- **tldraw** for canvas fluency: camera, shapes, selection, transforms, bindings, tools, responsiveness, and direct manipulation.
- **AFFiNE** for hybrid knowledge structure: edgeless/page modes, block-based documents, structured content, rich embeds, and the ability for knowledge to live both linearly and spatially.

The Balnce implementation must not copy the branding, aesthetics, or product structure of either system. It must extract interaction laws.

## What the Imagination Canvas is

The Imagination Canvas is:

1. **An infinite spatial surface**  
   Users can pan, zoom, organize, cluster, connect, and explore ideas without a fixed page boundary.

2. **A block-based knowledge environment**  
   Notes, text, media, documents, artifacts, search results, goals, agents, data views, and apps all appear as blocks with shared behaviors.

3. **A mini-application runtime**  
   A block is not only a rectangle. It can contain state, tools, data bindings, model bindings, permissions, history, and expansion routes.

4. **An agentic workspace**  
   Agents can create, observe, organize, summarize, transform, and negotiate across selected regions of the canvas.

5. **A memory and provenance surface**  
   Important artifacts can be linked to user memory, PLOGs, identity, source references, and share/revocation policies.

6. **A creative operating layer**  
   It is where users can make anything: a plan, a pitch, a research map, an app, a workflow, a commerce negotiation, a visual story, a product strategy, a family calendar, or an agent team.

## What it is not

The Imagination Canvas is not:

- A generic whiteboard.
- A clone of Miro, Figma, tldraw, or AFFiNE.
- A note app with an infinite background.
- A dashboard grid.
- A diagramming tool only.
- A static artifact board.
- A container for random cards without deep interaction grammar.

## The product feeling

The canvas must feel:

- Open, not empty.
- Calm, not sterile.
- Alive, not noisy.
- Precise, not rigid.
- Playful, not childish.
- Powerful, not complicated.
- Cinematic, not over-animated.
- Sovereign, not cloud-owned.
- Agentic, not automated chaos.

A user should feel like they are standing inside the IMAX of their mind: a spatial field where thoughts can be placed, connected, expanded, and transformed into action.

## Core design law

Every object on the canvas should be treated as four things at once:

1. **Spatial object**: it has position, size, z-order, selection, transform, and viewport behavior.
2. **Knowledge container**: it may contain text, media, data, relationships, metadata, and references.
3. **Interaction surface**: it can be edited, opened, inspected, linked, grouped, or acted upon.
4. **Agentic primitive**: it may be created, modified, reasoned over, monitored, summarized, or executed by an agent.

## Universal object lifecycle

Every object should support this lifecycle:

1. **Created** — via toolbar, slash command, drag/drop, paste, chat output, AI generation, template, or import.
2. **Placed** — positioned in the viewport with predictable defaults.
3. **Selected** — single, multi, grouped, nested, or semantic selection.
4. **Edited** — inline, side panel, expanded frame, or full application mode.
5. **Connected** — linked visually or semantically to other objects.
6. **Expanded** — opened into deeper mode without losing canvas context.
7. **Persisted** — autosaved, versioned, undoable, recoverable.
8. **Shared** — optionally published, permissioned, exported, or connected to agentic commerce.
9. **Evolved** — transformed into app, workflow, agent, goal, stream, memory, or artifact.
10. **Archived or revoked** — removed from active canvas while maintaining provenance where necessary.

## Canvas mental model

The user should understand the surface in simple language:

- “This is a space for my ideas.”
- “I can put anything here.”
- “I can zoom into anything.”
- “My AI can help me organize or build from what is here.”
- “Every block can become more than it looks like.”
- “Nothing important disappears.”
- “I can return to where I was.”

## Design principles

### 1. Spatial context is sacred

When the user expands a block, enters a focus mode, opens a side panel, or lets an agent modify a region, the system must preserve their sense of where they are. Never teleport the user without visual cause.

### 2. Motion explains state

Motion should reveal relationships: a card expands from its location, a panel emerges from the selected block, a generated artifact materializes near the prompt that created it. Motion should not be decorative noise.

### 3. AI never hijacks the canvas

AI may suggest, cluster, generate, transform, or execute. But it should not yank the camera, rearrange the canvas, or mutate user work without consent or clear preview.

### 4. Blocks are calm until activated

A block should not constantly scream for attention. Activity indicators should be subtle. Deep details should appear on select, hover, inspect, expand, or explicit request.

### 5. Depth is progressive

A first-time user should be able to add a note and drag it. A power user should be able to create multi-agent workflows with memory, identity, commerce, provenance, and Edge Twin execution. The interface should reveal complexity only when context demands it.

## Target user stories

1. A student drops research links, lecture notes, images, and a question onto the canvas. Balnce clusters the material into a study map and opens an AI tutor block.
2. A founder asks the Intent Navigator for a pitch deck. The answer becomes canvas blocks: problem, solution, market, GTM, traction, ask, visuals. Each block can expand into a mini-editor.
3. A designer drags product screenshots onto the canvas. The AI extracts flows, identifies missing microinteractions, and creates a UX gap map.
4. A family user creates a trip plan. Blocks become itinerary, budget, lodging, packing list, maps, and agent-monitored deal alerts.
5. A builder creates an app idea. The canvas expands into an app-spec workspace, with blocks for data model, UI flows, components, prompts, tests, and deployment.
6. A user intentcasts to brands. Offer blocks appear, can be compared, negotiated, accepted, rejected, or delegated to an agent.
7. A long-running goal block decomposes into tasks, learning plans, reminders, collaborators, rewards, and weekly reviews.

## Production readiness definition

The canvas is production-ready only when:

- Pan/zoom feels smooth on desktop, trackpad, mobile, and stylus.
- Object creation is predictable and fast.
- Selection, transform, grouping, and locking are precise.
- Rich blocks can be edited without breaking spatial flow.
- Expansion transitions preserve context.
- Agent actions are inspectable, reversible, and permissioned.
- Autosave, undo/redo, and recovery are robust.
- The design system has stable tokens for motion, typography, spacing, density, and elevation.
- No production path depends on mocks, fake state, or placeholder behavior.
