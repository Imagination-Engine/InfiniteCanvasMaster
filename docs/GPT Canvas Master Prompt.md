````
# MASTER IMPLEMENTATION PROMPT
# Balnce Imagination Canvas Extraction, Planning, and Production Implementation

You are working inside the Balnce codebase.

Your mission is to implement the Balnce Imagination Canvas: an infinite, agentic, spatial creation environment inspired by the best interaction patterns of tldraw and AFFiNE, but adapted into Balnce’s own product, architecture, backend, identity, memory, agent, and block system.

This is not a generic whiteboard.
This is not a clone of tldraw.
This is not a clone of AFFiNE.
This is not a simple canvas demo.
This is not a prototype full of mocks, fake data, or placeholders.

This is a production-grade implementation effort for the Balnce Imagination Canvas, where every object on the canvas may be:

- a spatial object
- a knowledge object
- a semantic object
- a mini-application
- an agent
- a workflow
- a memory surface
- an artifact
- a conversation
- a goal
- a commerce object
- a provenance object
- an expandable application surface

The user should feel like they are inside an infinite, calm, precise, cinematic workspace where thought becomes tangible and every block can become something deeper.

---

# 0. Source of Truth

Before implementing anything, recursively read the full documentation folder:

/docs/imagination-canvas-extraction/

Treat this folder as the canonical product, UX, interaction, architecture, and implementation specification.

The folder is not inspirational context.
The folder is not optional.
The folder is not background reading.

It is the build contract.

You must interpret every major instruction, behavior, pattern, and acceptance criterion in this folder as something that must become one of the following:

- a component
- a hook
- a state store
- an event contract
- a schema
- a design token
- an interaction rule
- a test
- an acceptance criterion
- a gap-list item
- a documented implementation decision

---

# 1. Primary Reference Targets

Use tldraw as a behavioral reference for:

- infinite canvas interaction
- camera movement
- pan and zoom behavior
- pointer interactions
- drawing and object manipulation
- selection behavior
- transform handles
- bindings and connectors
- multiplayer/presence concepts
- editor/store separation
- extensibility through custom shapes, tools, and UI

Use AFFiNE as a behavioral reference for:

- edgeless canvas + document hybrid thinking
- block-based knowledge composition
- rich content inside spatial surfaces
- note cards
- embedded documents
- page/canvas transitions
- structured knowledge living inside freeform space
- workspace-level cohesion

Do not copy either product visually.

Extract their interaction grammar and adapt it into Balnce’s product language.

---

# 2. Balnce Product Context

The Balnce Imagination Canvas is part of a broader personal AI operating system.

It must support:

- chat-to-canvas flows
- artifact-to-canvas flows
- agent-to-canvas flows
- goal-to-canvas flows
- memory-to-canvas flows
- intentcasting-to-canvas flows
- app-block-to-canvas flows
- research-stream-to-canvas flows
- workflow-to-canvas flows
- identity/provenance/commerce blocks
- local AI, device mesh, and Edge Twin delegation states
- future multiplayer and agent-to-agent collaboration

The canvas is a living spatial workspace.

Every block should be designed with the assumption that it may eventually become:

- inspectable
- expandable
- executable
- agentic
- collaborative
- persistent
- versioned
- permissioned
- monetizable
- connected to memory
- connected to provenance
- connected to the user’s personal AI system

---

# 3. Non-Negotiable Implementation Philosophy

You must implement with the mindset of a senior staff-level frontend, product, interaction, and systems engineer.

You are not allowed to implement shallow UI.

You are not allowed to implement only the happy path.

You are not allowed to leave final code containing:

- mock
- stub
- placeholder
- TODO: real implementation
- fake implementation
- dummy data
- hardcoded temporary behavior
- “in production this would...”
- “for now...”
- “simplified version...”
- “basic demo...”

If a dependency, backend integration, or data source is missing, you must do one of the following:

1. Connect to the real existing system if available.
2. Define a typed interface boundary for the real system.
3. Implement a real local version that can later be swapped.
4. Document the missing integration clearly in the gap list.
5. Prevent the fake path from being confused with production behavior.

Do not silently fake production behavior.

---

# 4. Required First Step: Read and Summarize

Before writing implementation code, create:

/docs/imagination-canvas-extraction/IMPLEMENTATION_READING_SUMMARY.md

This file must prove that you read and understood the full documentation package.

It must include:

## 4.1 Canvas Purpose

Summarize what the Balnce Imagination Canvas is.

Include the distinction between:

- whiteboard
- note app
- document editor
- infinite canvas
- agentic spatial operating environment

## 4.2 Extracted Interaction Laws

Summarize the most important interaction laws extracted from tldraw and AFFiNE.

Include:

- stable shell
- fluid camera
- spatial object manipulation
- block-based knowledge composition
- rich content inside freeform space
- expansion without losing context
- calm motion
- predictable selection
- precise editing

## 4.3 Required Object Model

Summarize the canonical object model.

Include:

- CanvasObject
- CanvasBlock
- CanvasConnection
- CanvasViewport
- CanvasSelection
- CanvasEvent
- ExpansionSurface
- AgentCanvasTask

## 4.4 Required Balnce Block Types

Summarize every Balnce-native block type:

- Chat Block
- Agent Block
- Goal Block
- Artifact Block
- Memory Cluster Block
- Research Stream Block
- Intent Block
- Offer / Commerce Block
- Identity / Wallet Block
- Workflow Block
- Knowledge Pod Block
- App Block
- AURA Block
- PLOG / Provenance Block
- Edge Twin Block
- Device Mesh Block

For each block, identify:

- purpose
- compact state
- expanded state
- inspect state
- active state
- error state
- required events
- required data contract

## 4.5 Major Implementation Phases

Summarize the implementation phases in order.

## 4.6 Biggest Risks

Identify the biggest implementation risks, including:

- accidentally building a generic whiteboard
- losing spatial context during expansion
- insufficient object model
- shallow blocks
- weak mobile/touch behavior
- fake AI states
- unstable pan/zoom behavior
- no real history model
- poor performance at scale
- missing accessibility
- poor test coverage

## 4.7 Non-Negotiable Acceptance Criteria

Summarize the criteria that define whether the implementation is acceptable.

Do not proceed to implementation until this summary exists.

---

# 5. Required Second Step: Create the Execution Task List

Create:

/docs/imagination-canvas-extraction/CANVAS_TASK_LIST.md

This must become the living execution tracker for the full canvas implementation.

It must be updated after every phase and every major task.

Each task must include:

- task ID
- phase
- title
- goal
- files expected to be touched
- implementation details
- dependencies
- acceptance criteria
- test requirements
- no-stub verification
- completion notes
- open questions
- risk notes

Use this task format:

```md
## TASK: CANVAS-PHASE-TASKNUMBER

### Title
Short title.

### Phase
Phase name.

### Goal
What this task achieves.

### Files / Areas Expected
- path
- path
- path

### Implementation Details
Detailed description of the implementation.

### Dependencies
What must exist first.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Tests Required
- [ ] Unit tests
- [ ] Interaction tests
- [ ] Accessibility checks
- [ ] Mobile/touch checks where relevant

### No-Stub Verification
- [ ] No mock final behavior
- [ ] No stubbed implementation
- [ ] No fake production data
- [ ] Missing integrations documented in gap list

### Completion Notes
Filled in after implementation.

### Open Questions
Any questions or uncertainties.

### Risk Notes
Potential implementation risks.
````

---

# **6\. Required Third Step: Create Architecture Decisions**

Create:

/docs/imagination-canvas-extraction/ARCHITECTURE_DECISIONS.md

This file must document major implementation decisions, including:

- whether to build directly on tldraw SDK, fork parts of its architecture, or build a custom layer
- whether to use existing canvas libraries
- how the object model is persisted
- how selection state is managed
- how viewport/camera state is stored
- how history/undo/redo is implemented
- how blocks expand into app surfaces
- how AI/agent events enter the canvas
- how mobile/touch behavior is handled
- how performance is protected
- how accessibility is implemented

Use ADR format:

```
# ADR-0001: Decision Title

## Status
Proposed | Accepted | Rejected | Superseded

## Context
What problem are we solving?

## Decision
What decision was made?

## Alternatives Considered
- Option A
- Option B
- Option C

## Consequences
Positive and negative consequences.

## Follow-Up Tasks
- Task reference
```

---

# **7\. Required Fourth Step: Maintain the Gap List**

Update:

/docs/imagination-canvas-extraction/15-gap-list.md

This file must record every missing, incomplete, weak, risky, or deferred area.

Do not hide gaps.

A good gap list is a strength, not a weakness.

Every gap must include:

- description
- severity
- affected files
- affected UX
- affected block types
- implementation recommendation
- owner/phase
- acceptance criteria for closure

Use this format:

```
## GAP-ID: Short Name

### Severity
Critical | High | Medium | Low

### Description
What is missing or weak?

### Affected Areas
- area
- area

### User Impact
How this affects the experience.

### Technical Impact
How this affects architecture, performance, reliability, or maintainability.

### Recommended Fix
Specific implementation recommendation.

### Closure Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

---

# **8\. Implementation Slicing Strategy**

Do not attempt to implement the entire Imagination Canvas in one giant pass.

You must slice the implementation into disciplined phases.

Each phase must produce working, testable, production-quality increments.

Each phase must update:

- IMPLEMENTATION_READING_SUMMARY.md, if understanding changes
- CANVAS_TASK_LIST.md
- ARCHITECTURE_DECISIONS.md, if decisions are made
- 15-gap-list.md
- tests
- relevant package files

The preferred implementation structure is:

/packages/imagination-canvas-kit/

This package should contain reusable canvas primitives that can be integrated into the main app.

---

# **9\. Phase 0 — Repo Scan, Integration Map, and Reality Check**

Before implementation, scan the existing repository.

Identify:

- existing frontend framework
- existing state management
- existing design system
- existing animation libraries
- existing routing/navigation model
- existing chat/artifact/agent surfaces
- existing backend event contracts
- existing AI streaming/event systems
- existing persistence/storage systems
- existing mobile/desktop platform differences
- existing canvas-related packages, if any
- test framework
- lint/typecheck commands
- build commands

Create or update:

/docs/imagination-canvas-extraction/REPO_INTEGRATION_MAP.md

This file must include:

## **Existing Architecture**

- app structure
- relevant packages
- design system
- state management
- event system
- backend boundaries

## **Integration Targets**

- where the canvas package will live
- where it will be consumed
- which existing routes/screens will use it
- which existing components can be reused
- which existing components must be replaced

## **Constraints**

- framework constraints
- platform constraints
- dependency constraints
- performance constraints
- schedule constraints

## **Recommended Integration Path**

Describe the least destructive production-grade integration path.

---

# **10\. Phase 1 — Canvas Foundation Slice**

Goal:

Build the minimum real foundation for an infinite canvas system.

This is not a demo.

This phase establishes the core package, core contracts, shell, viewport, and object rendering pipeline.

## **Implement**

Package:

/packages/imagination-canvas-kit/

Core folders:

- /components
- /hooks
- /state
- /contracts
- /tokens
- /utils
- /tests

Core contracts:

- CanvasObject
- CanvasBlock
- CanvasConnection
- CanvasViewport
- CanvasSelection
- CanvasEvent
- ExpansionSurface
- AgentCanvasTask

Core components:

- CanvasShell
- InfiniteViewport
- ObjectRenderer
- CanvasSurface
- CanvasLayer
- CanvasObjectFrame

Core state:

- canvasStore
- viewportStore
- objectGraphStore

Core hooks:

- useViewportCamera
- useCanvasObjects
- useCanvasEvents

## **Required Behaviors**

- render a real infinite canvas viewport
- render objects from typed state
- support object coordinates
- support z-index/layering
- support viewport transforms
- support initial camera state
- support object creation through real events
- support controlled/uncontrolled canvas state where appropriate
- expose public API for integration

## **Acceptance Criteria**

- Canvas package compiles.
- Typed object model exists.
- Canvas shell renders.
- Infinite viewport renders.
- Objects render from state.
- Viewport transform is applied correctly.
- No hardcoded demo-only assumptions.
- No final mock object data hidden in production path.
- Public exports are clean.
- Unit tests exist for object contracts and basic state updates.
- Integration docs updated.

Do not implement rich Balnce blocks in this phase.

---

# **11\. Phase 2 — Camera, Viewport, Pan, Zoom, and Spatial Stability**

Goal:

Make the canvas feel physically stable, fluid, and trustworthy.

This phase creates the motor cortex of the canvas.

## **Implement**

Components:

- InfiniteViewport
- Minimap, if feasible in this phase
- ViewportControls
- ZoomIndicator

Hooks:

- useViewportCamera
- useSpatialNavigation
- useWheelZoom
- usePointerPan
- useViewportRestore

State:

- viewportStore

## **Required Behaviors**

- pan with mouse/trackpad
- zoom with wheel/trackpad
- zoom under pointer when possible
- fit-to-content
- zoom-to-selection, once selection exists
- reset view
- preserve camera state
- restore previous viewport
- support min/max zoom
- support smooth but non-distracting motion
- support reduced-motion mode
- support mobile/touch hooks even if final mobile polish comes later

## **Acceptance Criteria**

- Panning feels stable.
- Zooming feels anchored and predictable.
- Zoom limits prevent disorientation.
- Fit-to-content works.
- Viewport state can be persisted/restored.
- Camera does not jump unexpectedly.
- Reduced motion mode is respected.
- Tests cover viewport math.
- Performance does not degrade with reasonable object count.

---

# **12\. Phase 3 — Object Model, Renderer, Layering, and Hit Testing**

Goal:

Create the reliable object system behind the canvas.

This phase ensures the canvas is not merely drawing boxes, but rendering typed, extensible objects.

## **Implement**

Contracts:

- BaseCanvasObject
- ShapeObject
- NoteObject
- RichTextObject
- ImageObject
- MediaObject
- FileObject
- LinkObject
- ConnectorObject
- GroupObject
- ArtifactObject
- ChatObject
- AgentObject
- GoalObject
- AppBlockObject
- MemoryClusterObject
- EmbedObject
- DataViewObject
- IntentObject
- CommerceObject
- ProvenanceObject
- EdgeTwinObject
- DeviceMeshObject

Components:

- ObjectRenderer
- CanvasObjectFrame
- ShapeRenderer
- BlockRenderer
- ConnectorRenderer
- UnknownObjectFallback, only for safe recoverable rendering, not as a lazy implementation

State:

- objectGraphStore
- canvasStore

Utilities:

- hitTestObject
- sortObjectsByZIndex
- getObjectBounds
- getObjectCenter
- getObjectChildren
- getObjectAncestors

## **Required Behaviors**

- typed object registry
- renderer registry by object type
- safe handling of unknown object types
- z-index ordering
- parent/child relationship support
- group support foundation
- metadata support
- capability flags per object
- object bounds calculation
- hit testing
- object lifecycle events

## **Acceptance Criteria**

- Object registry exists.
- All required object categories have typed contracts.
- Renderer can dispatch by object type.
- Bounds are calculated correctly.
- Hit testing works for rendered objects.
- Z-index order is stable.
- Parent/child relationships are represented.
- Unknown object handling is safe and documented.
- Tests cover object creation, update, bounds, and rendering dispatch.

---

# **13\. Phase 4 — Selection, Manipulation, Dragging, and Transform Handles**

Goal:

Make objects feel precise and mature.

This phase implements the interaction rules that distinguish a production canvas from a toy canvas.

## **Implement**

Components:

- SelectionOverlay
- TransformHandles
- SelectionBox
- MarqueeSelection
- AlignmentGuides
- ContextualObjectToolbar

Hooks:

- useCanvasSelection
- useTransformHandles
- useObjectDrag
- useMarqueeSelection
- useKeyboardNudge
- useObjectLocking
- useZOrderControls

State:

- selectionStore

## **Required Behaviors**

- single select
- multi-select
- deselect
- marquee selection
- keyboard selection controls
- drag to move
- keyboard nudge
- resize handles
- rotate support if required by object type
- lock/unlock
- group/ungroup foundation
- z-order controls
- selection outline
- hover affordances
- nested selection rules
- selected vs editing mode distinction

## **Acceptance Criteria**

- Single selection works.
- Multi-selection works.
- Marquee selection works.
- Dragging objects works.
- Resize handles work.
- Selection state is clear.
- Locked objects cannot be accidentally modified.
- Keyboard nudge works.
- Z-order can be changed.
- Selection does not conflict with pan/zoom.
- Tests cover selection state transitions and transform math.

---

# **14\. Phase 5 — Creation, Insertion, Clipboard, Drag/Drop, and Quick Add**

Goal:

Make creating objects effortless and predictable.

This phase defines how ideas enter the canvas.

## **Implement**

Components:

- CanvasToolbar
- QuickAddMenu
- ContextMenu
- InsertMenu
- SlashCommandMenu
- DropPreview
- PastePreview

Hooks:

- useObjectCreation
- useCanvasClipboard
- useCanvasDragDrop
- useCanvasShortcuts
- usePasteToCanvas
- useDropToCanvas

Events:

- canvas.object.create.requested
- canvas.object.created
- canvas.object.paste.requested
- canvas.object.drop.requested
- canvas.quickAdd.opened
- canvas.quickAdd.selected

## **Required Behaviors**

- create note from toolbar
- create text block
- create shape
- create connector
- paste text into canvas as note/text block
- paste image into canvas as image object
- drag/drop files into canvas as file/media objects
- quick add menu at pointer or viewport center
- slash command creation
- default placement rules
- collision-aware placement if feasible
- keyboard shortcuts
- event-driven insertion path for future AI-generated blocks

## **Acceptance Criteria**

- Toolbar insertion works.
- Quick add insertion works.
- Paste text works.
- Paste image works where platform supports it.
- Drag/drop creates typed objects.
- Slash menu creates typed objects.
- New objects are placed predictably.
- Object creation emits typed events.
- No fake insertion paths.
- Tests cover object creation events.

---

# **15\. Phase 6 — History, Undo/Redo, Persistence, and Recovery**

Goal:

Make the canvas safe to use.

Users must trust that their work will not be lost.

## **Implement**

State:

- historyStore
- persistenceAdapter
- snapshotStore

Hooks:

- useCanvasHistory
- useCanvasPersistence
- useAutosave
- useCanvasRecovery

Events:

- canvas.history.undo
- canvas.history.redo
- canvas.snapshot.created
- canvas.autosave.started
- canvas.autosave.completed
- canvas.autosave.failed
- canvas.recovery.available
- canvas.recovered

## **Required Behaviors**

- undo
- redo
- object creation history
- object movement history
- object deletion history
- object resize history
- selection changes should not pollute history unless product requires
- autosave
- restore canvas state
- recover after failure
- serialize and deserialize canvas
- version canvas schema
- safe migration path for schema changes

## **Acceptance Criteria**

- Undo works for object creation.
- Undo works for object movement.
- Redo works.
- Autosave path exists.
- Canvas can serialize.
- Canvas can restore.
- Schema version is included.
- Recovery states are represented.
- Tests cover history and serialization.
- Missing backend persistence is documented if not yet available.

---

# **16\. Phase 7 — Core Rich Blocks**

Goal:

Create the first meaningful content blocks.

This phase turns the canvas from a spatial engine into a usable creative environment.

## **Implement**

Core blocks:

- NoteBlock
- RichTextBlock
- ArtifactBlock
- ChatBlock
- ImageBlock
- FileBlock
- LinkBlock
- EmbedBlock

Each block must support:

- compact rendering
- selected state
- hover state
- editing state
- inspect state where relevant
- error state
- loading state where relevant

Components:

- NoteCard
- RichTextBlock
- ArtifactBlock
- ChatBlock
- MediaBlock
- FileBlock
- LinkPreviewBlock
- EmbedBlock

Hooks:

- useBlockEditing
- useBlockExpansion
- useInlineEditing

## **Required Behaviors**

- inline edit note text
- rich text foundation
- artifact preview
- chat block preview
- image/file rendering
- link preview with safe fallback
- block frame controls
- block-specific action menus
- edit vs move gesture distinction
- escape to exit editing
- enter/double-click to edit where appropriate

## **Acceptance Criteria**

- NoteBlock is usable.
- RichTextBlock has real editing behavior.
- ArtifactBlock renders typed artifact data.
- ChatBlock renders a real conversation preview contract.
- Image/File/Link blocks render through typed contracts.
- Editing does not conflict with dragging.
- Blocks have compact/error/loading states.
- Tests cover block rendering and editing transitions.

---

# **17\. Phase 8 — Balnce-Native Blocks**

Goal:

Implement the Balnce-specific block system.

This is where the product stops being a generic canvas and becomes the Imagination Canvas.

## **Required Balnce Blocks**

Implement typed contracts, renderers, and interaction states for:

1. Chat Block
2. Agent Block
3. Goal Block
4. Artifact Block
5. Memory Cluster Block
6. Research Stream Block
7. Intent Block
8. Offer / Commerce Block
9. Identity / Wallet Block
10. Workflow Block
11. Knowledge Pod Block
12. App Block
13. AURA Block
14. PLOG / Provenance Block
15. Edge Twin Block
16. Device Mesh Block

## **Required Block States**

Every Balnce-native block must support:

- compact
- expanded
- inspect
- active
- loading
- error
- empty
- permission-required, where relevant
- provenance-visible, where relevant
- agent-running, where relevant
- human-checkpoint-required, where relevant

## **Required Fields Per Block**

Each block contract must define:

- id
- type
- title
- description
- spatial bounds
- status
- metadata
- source
- createdAt
- updatedAt
- permissions
- provenance, where relevant
- agentBinding, where relevant
- memoryBinding, where relevant
- expansionRoute, where relevant
- actions
- events

## **Block-Specific Requirements**

### **Chat Block**

Represents a conversation or conversation fragment.

Must support:

- latest message preview
- participant/agent identity
- unread/activity state
- compact thread view
- expansion into full chat
- conversion from chat response to canvas blocks

### **Agent Block**

Represents an agent, sub-agent, or active AI worker.

Must support:

- identity
- capability summary
- current state
- assigned task
- activity stream
- permissions
- start/pause/inspect actions
- human checkpoint state

### **Goal Block**

Represents a goal or objective.

Must support:

- goal title
- progress
- sub-goals/tasks
- linked agents
- milestone states
- expansion into workflow/planning view

### **Artifact Block**

Represents generated content.

Must support:

- artifact type
- preview
- version
- source conversation/agent
- edit/open action
- provenance
- export/share actions where available

### **Memory Cluster Block**

Represents a semantic cluster of memories.

Must support:

- memory summary
- time range
- source types
- confidence/sensitivity indicators
- expansion into memory view
- permissions

### **Research Stream Block**

Represents a stream of curated research/content.

Must support:

- topic
- sources
- update cadence
- latest items
- filtering
- expansion into stream reader

### **Intent Block**

Represents a user intent.

Must support:

- declared intent
- status
- required inputs
- agent assignment
- related offers/actions
- expansion into intent workspace

### **Offer / Commerce Block**

Represents an offer, negotiation, deal, or transaction.

Must support:

- offer summary
- counterparties
- status
- value
- expiration
- trust/provenance markers
- accept/decline/inspect states

### **Identity / Wallet Block**

Represents identity, wallet, passes, credentials, or proofs.

Must support:

- safe compact display
- no leaking secrets
- credential summary
- wallet/action state
- provenance
- permission boundaries

### **Workflow Block**

Represents a workflow or process.

Must support:

- steps
- statuses
- assigned agents
- blockers
- progress
- expansion into workflow editor

### **Knowledge Pod Block**

Represents a portable knowledge container.

Must support:

- title
- summary
- contents
- source
- owner/permission state
- expansion into knowledge view

### **App Block**

Represents a mini-application on canvas.

Must support:

- compact preview
- app identity
- embedded state
- expansion into full app
- safe runtime boundaries

### **AURA Block**

Represents AURA balance, reward, credit, transaction, or earning opportunity.

Must support:

- value display
- transaction status
- earning/spending context
- privacy-aware rendering
- expansion into wallet/economy surface

### **PLOG / Provenance Block**

Represents provenance, authorship, rights, or history.

Must support:

- provenance summary
- source chain
- verification state
- revocation state where available
- expansion into provenance detail

### **Edge Twin Block**

Represents Cloudflare/edge compute delegation or an always-on twin.

Must support:

- compute tier/status
- active jobs
- model delegation state
- availability
- expansion into compute/task view

### **Device Mesh Block**

Represents local personal network devices.

Must support:

- connected devices
- compute/storage/inference capabilities
- status
- pooling state
- privacy indicators
- expansion into device mesh view

## **Acceptance Criteria**

- Every Balnce block has a typed contract.
- Every Balnce block has a renderer.
- Every Balnce block has compact state.
- Every Balnce block has inspect or expanded state.
- Every Balnce block has error state.
- Sensitive blocks are privacy-aware.
- Agentic blocks expose real event/state boundaries.
- No Balnce block is represented as a generic card only.
- Tests cover rendering and state transitions for each block.

---

# **18\. Phase 9 — Expansion, Inspection, and App-Surface Transitions**

Goal:

Make blocks expandable into deeper experiences without losing spatial context.

This phase is essential to the Balnce vision.

## **Implement**

Components:

- ExpandableBlockFrame
- SideInspector
- ExpansionSurface
- FullscreenBlockSurface
- BlockPeek
- CanvasBreadcrumbs
- ReturnToCanvasControl
- ExpansionTransitionLayer

Hooks:

- useBlockExpansion
- useExpansionRoute
- useSpatialReturn
- useInspectorState

Events:

- block.inspect.opened
- block.inspect.closed
- block.expansion.started
- block.expanded
- block.fullscreen.opened
- block.fullscreen.closed
- block.returnedToCanvas

## **Required Behaviors**

- compact block to side inspector
- compact block to expanded card
- compact block to full app surface
- block peek
- return to previous canvas position
- preserve selected object where appropriate
- preserve camera before expansion
- animated but calm transition
- reduced-motion support
- expansion route per block type
- prevent accidental loss of work

## **Acceptance Criteria**

- Blocks can inspect.
- Blocks can expand.
- App blocks can open into deeper surfaces.
- Return-to-canvas preserves spatial context.
- Camera state is restored.
- Motion is polished and optional.
- Expansion does not break object state.
- Tests cover expansion state transitions.

---

# **19\. Phase 10 — Connections, Semantic Links, Clusters, and Graph Behavior**

Goal:

Allow the canvas to become a spatial knowledge graph.

## **Implement**

Components:

- ConnectorLayer
- ConnectorRenderer
- SemanticLinkOverlay
- ClusterFrame
- GroupFrame
- RelationshipInspector

Hooks:

- useCanvasConnections
- useSemanticGrouping
- useAutoLayout
- useConnectorEditing

Contracts:

- CanvasConnection
- SemanticRelationship
- CanvasCluster
- CanvasGroup

## **Required Behaviors**

- connect objects with arrows
- connect objects with semantic links
- create group containers
- create cluster containers
- display relationship labels
- support connection editing
- support object movement with connection updates
- support future AI clustering
- support graph overlay modes

## **Acceptance Criteria**

- Connectors render between objects.
- Connectors update when objects move.
- Semantic links are typed.
- Groups/clusters are represented.
- Relationship inspector exists or is planned with typed boundary.
- Tests cover connection geometry.

---

# **20\. Phase 11 — AI and Agent Behaviors on Canvas**

Goal:

Make AI behavior native to the canvas.

AI must not feel like a bolted-on chatbot.

It must feel like a spatial co-creator.

## **Implement**

Components:

- AgentActivityLayer
- AIInsertionPreview
- StreamingBlock
- RegionSummaryBlock
- AgentTaskBadge
- HumanCheckpointCard
- AgentSuggestionOverlay

Hooks:

- useAgentOnCanvas
- useAIBlockGeneration
- useRegionSummary
- useAgentActivity
- useHumanCheckpoint
- useStreamingIntoBlock

Events:

- agent.canvas.task.started
- agent.canvas.task.progress
- agent.canvas.task.completed
- agent.canvas.task.failed
- agent.canvas.human_checkpoint.required
- ai.block.generation.started
- ai.block.generation.delta
- ai.block.generation.completed
- ai.region.summary.created
- ai.cluster.suggested

## **Required Behaviors**

- generate blocks from prompt
- stream AI output into a block
- summarize selected region
- suggest organization/clustering
- agent activity indicators
- human checkpoint states
- AI insertion preview before committing, where appropriate
- support local model / device mesh / Edge Twin status labels
- no fake AI status unless backed by real event boundary

## **Acceptance Criteria**

- AI can create typed canvas objects through event contracts.
- Streaming into block works through real state.
- Agent activity appears without hijacking the canvas.
- Human checkpoint states are clear.
- AI-generated content has source/provenance hooks.
- Missing backend integrations are documented, not faked.
- Tests cover AI event handling.

---

# **21\. Phase 12 — Collaboration, Presence, Comments, and Permissions**

Goal:

Prepare the canvas for collaborative human and agent work.

Even if multiplayer is not fully available yet, the architecture must not block it.

## **Implement**

Components:

- PresenceLayer
- CursorPresence
- SelectionPresence
- CommentThread
- PermissionBadge
- FollowModeControl

Hooks:

- usePresenceLayer
- useComments
- useCanvasPermissions
- useFollowMode

Contracts:

- PresenceUser
- PresenceAgent
- CanvasComment
- CanvasPermission
- CollaborationEvent

## **Required Behaviors**

- represent user presence
- represent agent presence
- remote cursor contract
- remote selection contract
- comments on objects
- comments on regions
- permission-aware block rendering
- follow mode architecture
- safe fallback when collaboration backend is unavailable

## **Acceptance Criteria**

- Presence contracts exist.
- Presence layer can render local or provided presence.
- Comment contracts exist.
- Permission-aware rendering exists.
- Sensitive blocks respect permissions.
- Missing collaboration backend is documented.

---

# **22\. Phase 13 — Mobile, Touch, Stylus, and Responsive Behavior**

Goal:

Make mobile and touch first-class, not afterthoughts.

## **Implement**

Components/Behaviors:

- mobile canvas shell
- touch-friendly toolbar
- touch selection handles
- gesture disambiguation
- mobile inspector
- compact quick add
- stylus hooks where supported

Hooks:

- useTouchPanZoom
- useGestureMode
- useMobileCanvasControls
- useStylusInput

## **Required Behaviors**

- pinch to zoom
- one-finger/two-finger behavior rules
- touch object selection
- touch object movement
- handle sizing for touch
- mobile quick add
- mobile inspector
- safe keyboard behavior
- avoid tiny hit targets
- reduced complexity mode if needed

## **Acceptance Criteria**

- Mobile layout is intentionally designed.
- Touch targets are usable.
- Pinch zoom works where platform allows.
- Touch selection does not conflict with pan.
- Mobile inspector works.
- No desktop-only assumptions in core architecture.

---

# **23\. Phase 14 — Accessibility, Keyboard, Reduced Motion, and Interaction Completeness**

Goal:

Make the canvas usable, navigable, and respectful of user preferences.

## **Implement**

Hooks:

- useCanvasKeyboardNavigation
- useReducedMotion
- useFocusManagement
- useAccessibleSelection

Required:

- ARIA where appropriate
- keyboard shortcuts
- focus rings
- escape/enter behavior
- screen-reader-friendly object summaries where feasible
- reduced-motion support
- color contrast checks
- non-pointer interaction paths

## **Acceptance Criteria**

- Keyboard shortcuts are documented.
- Focus states are visible.
- Reduced motion is respected.
- Objects have accessible labels where feasible.
- Core controls are keyboard accessible.
- Tests or checks exist for accessibility-critical paths.

---

# **24\. Phase 15 — Performance, Scale, Virtualization, and Stress Testing**

Goal:

Prevent the canvas from collapsing under real use.

## **Implement / Evaluate**

- object virtualization
- viewport culling
- memoized rendering
- batched state updates
- pointer event performance
- large canvas stress tests
- connector performance
- minimap performance
- AI streaming performance
- memory usage
- mobile performance

## **Required Scenarios**

Test or benchmark:

- 100 objects
- 1,000 objects
- 5,000 objects, if realistic for product direction
- many connectors
- many rich blocks
- streaming into blocks
- rapid pan/zoom
- rapid object dragging
- undo/redo under load

## **Acceptance Criteria**

- Reasonable object counts remain usable.
- Viewport culling or virtualization strategy exists.
- Pointer interactions remain responsive.
- Rendering is not needlessly global.
- Performance risks are documented.
- Stress tests or benchmark harness exists.

---

# **25\. Phase 16 — Integration Into Main Product Surface**

Goal:

Integrate the canvas kit into the actual Balnce app.

## **Implement**

- route or screen for Imagination Canvas
- integration with existing navigation
- integration with design system
- integration with chat/artifact surfaces where available
- integration with agent/event system where available
- integration with persistence where available
- integration with mobile/desktop shells

## **Required Behaviors**

- open canvas from app
- create a new canvas
- load existing canvas
- add blocks from current product surfaces
- open block expansions
- return to previous product context
- support app theme/density settings
- no broken routes
- no isolated demo-only screen masquerading as product

## **Acceptance Criteria**

- Canvas is reachable from product UI.
- Canvas uses real app shell conventions.
- Canvas can receive real or typed product data.
- Canvas does not live only as a demo route.
- Product integration is documented.
- Build passes.
- Typecheck passes.
- Tests pass or failures are documented with cause.

---

# **26\. Phase 17 — Production Hardening and No-Stub Audit**

Goal:

Comb through the implementation and remove weak, fake, incomplete, or risky work.

## **Required Audit**

Search the entire implementation for:

- mock
- stub
- placeholder
- TODO
- FIXME
- temporary
- dummy
- fake
- hardcoded
- simplified
- demo
- sample
- not implemented
- future work
- in real implementation

For every occurrence:

- remove it
- replace it with production logic
- or document it in the gap list with severity and closure plan

## **Required Validation**

Run:

- typecheck
- lint
- unit tests
- interaction tests where available
- build
- accessibility checks where available
- mobile/responsive checks where available

## **Acceptance Criteria**

- No unapproved mocks/stubs/placeholders remain.
- All known gaps are documented.
- Typecheck passes.
- Build passes.
- Tests pass or failures are explicitly documented.
- Critical UX flows work.
- Critical block states work.
- Critical interaction states work.
- Implementation is ready for human review.

---

# **27\. Cross-Cutting State Model Requirements**

Every meaningful behavior must map to explicit state.

Do not implement invisible implicit behavior that cannot be reasoned about.

Required state domains:

## **Canvas State**

- canvas ID
- title
- objects
- connections
- groups
- clusters
- schema version
- createdAt
- updatedAt
- permissions

## **Viewport State**

- x
- y
- zoom
- previous viewport
- focused region
- minimap state
- reduced motion state

## **Selection State**

- selected object IDs
- hovered object ID
- editing object ID
- focused object ID
- marquee bounds
- transform mode
- locked state

## **History State**

- undo stack
- redo stack
- transaction boundaries
- snapshot references
- autosave state

## **Block State**

- compact
- selected
- editing
- inspecting
- expanded
- loading
- active
- error
- permission required
- agent running
- human checkpoint required

## **Agent State**

- idle
- thinking
- working
- waiting for input
- using local model
- using device mesh
- using Edge Twin
- completed
- failed
- paused

## **Persistence State**

- saved
- unsaved
- saving
- save failed
- recovery available
- conflict detected

---

# **28\. Cross-Cutting Event Model Requirements**

Every meaningful state transition should be driven by typed events.

Examples:

```ts
type CanvasEvent =
  | { type: "canvas.created"; canvasId: string }
  | { type: "canvas.loaded"; canvasId: string }
  | { type: "viewport.changed"; x: number; y: number; zoom: number }
  | { type: "object.created"; objectId: string; objectType: string }
  | { type: "object.updated"; objectId: string; patch: unknown }
  | { type: "object.deleted"; objectId: string }
  | { type: "selection.changed"; selectedIds: string[] }
  | { type: "block.expanded"; objectId: string; surface: string }
  | { type: "block.inspected"; objectId: string }
  | { type: "agent.task.started"; objectId: string; taskId: string }
  | { type: "agent.task.progress"; taskId: string; message: string }
  | { type: "agent.task.completed"; taskId: string }
  | { type: "agent.task.failed"; taskId: string; error: string }
  | { type: "history.undo" }
  | { type: "history.redo" }
  | { type: "persistence.save.started" }
  | { type: "persistence.save.completed" }
  | { type: "persistence.save.failed"; error: string };
```

The exact implementation can vary, but the principle cannot.

The canvas must be inspectable, debuggable, and resilient.

---

# **29\. Design Token Requirements**

Do not scatter magic numbers across the canvas.

Create token files for:

- spacing
- typography
- radius
- elevation
- motion
- density
- z-index
- icon sizing
- touch target sizing
- viewport constants
- selection constants
- block constants

Minimum token examples:

```ts
export const canvasSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const canvasMotion = {
  instant: 0,
  fast: 120,
  normal: 180,
  slow: 260,
};

export const canvasTouchTargets = {
  minimum: 44,
  comfortable: 48,
};

export const canvasZoom = {
  min: 0.1,
  max: 4,
  default: 1,
};
```

Acceptance:

- no unexplained repeated magic numbers in core interaction code
- tokens are imported consistently
- mobile/touch tokens exist
- reduced-motion behavior uses tokens/settings

---

# **30\. Testing Requirements**

Each phase must include appropriate tests.

Minimum test categories:

## **Unit Tests**

- object model
- bounds calculation
- hit testing
- z-index sorting
- viewport math
- selection state
- history reducer/store
- event handling

## **Component Tests**

- CanvasShell
- InfiniteViewport
- ObjectRenderer
- SelectionOverlay
- TransformHandles
- NoteBlock
- Balnce block renderers
- ExpansionSurface

## **Interaction Tests**

- create object
- select object
- drag object
- resize object
- pan viewport
- zoom viewport
- open inspector
- expand block
- undo/redo
- paste object
- drag/drop object

## **Accessibility Checks**

- keyboard focus
- visible focus indicators
- labels for controls
- reduced motion

## **Integration Tests**

- open canvas route
- create canvas
- save/restore canvas where available
- insert block from product surface where available
- expand app block

No phase should be marked complete without relevant tests or a documented reason in the gap list.

---

# **31\. Dependency Policy**

Before adding a dependency:

1. Check whether the repo already has a suitable dependency.
2. Check whether the dependency is production-grade and maintained.
3. Check bundle/performance implications.
4. Check mobile compatibility.
5. Check licensing.
6. Document the decision in ARCHITECTURE_DECISIONS.md.

Do not add heavy dependencies casually.

Do not add a dependency to avoid understanding the interaction model.

Do not patch around dependency issues with fake behavior.

---

# **32\. Performance Requirements**

The canvas must be designed for scale.

Do not build an architecture that re-renders the entire canvas on every pointer move.

Performance principles:

- isolate pointer state
- memoize object renderers
- avoid global re-render storms
- batch updates where possible
- use viewport culling for large object sets
- separate transient interaction state from persisted object state
- throttle/debounce carefully
- keep animation smooth
- prevent connector recalculation from becoming expensive
- avoid heavy rich content rendering outside viewport

Add performance notes to:

/docs/imagination-canvas-extraction/PERFORMANCE_NOTES.md

Include:

- current strategy
- known risks
- test scenarios
- future optimization path

---

# **33\. UX Quality Bar**

The canvas must feel:

- calm
- precise
- responsive
- cinematic
- spatially stable
- powerful
- non-chaotic
- native to Balnce
- not generic
- not like a 1990s block dashboard
- not like a junior whiteboard clone

Every interaction should be evaluated against:

## **Does this preserve spatial context?**

The user must not feel lost.

## **Does this preserve intent?**

The system should understand whether the user is trying to pan, select, edit, drag, create, or inspect.

## **Does this feel reversible?**

The user should trust undo, escape, cancel, and back paths.

## **Does this feel calm?**

Motion should clarify, not perform.

## **Does this feel agentic?**

AI and agents should feel native to the canvas, not pasted on.

## **Does this feel Balnce-native?**

Blocks should represent life, memory, intent, agents, commerce, identity, and creation, not just shapes.

---

# **34\. Human Language and Status Copy**

Avoid system-y language in user-facing UI.

Bad:

- Executing tool call
- Running orchestration node
- Invoking inference backend
- Stream pending
- Edge delegation protocol active

Better:

- Looking through your memory…
- Asking your devices…
- Bringing in more compute…
- Organizing this space…
- Building the next block…
- Waiting for your approval…
- Ready for review.

Developer/debug views may expose raw technical details, but normal user surfaces should remain human, calm, and clear.

---

# **35\. Security, Privacy, and Sensitive Blocks**

Certain Balnce blocks are sensitive:

- Identity / Wallet Block
- AURA Block
- PLOG / Provenance Block
- Memory Cluster Block
- Offer / Commerce Block
- Edge Twin Block
- Device Mesh Block

These must not leak sensitive information in compact state.

For sensitive blocks:

- show safe summaries
- require explicit expansion for details
- respect permission states
- avoid displaying secrets
- avoid exposing private keys, tokens, credentials, raw biometric data, or hidden identifiers
- support redacted state
- support permission-required state
- document security assumptions

Acceptance:

- sensitive blocks have redacted compact states
- no secrets are rendered
- permission states are represented
- expansion paths are intentional

---

# **36\. Definition of Done Per Phase**

A phase is not complete unless:

- implementation exists
- relevant docs are updated
- task list is updated
- gap list is updated
- tests exist or missing tests are documented
- typecheck passes, unless blocked and documented
- no unapproved stubs remain
- acceptance criteria are checked
- architecture decisions are recorded
- implementation is reviewable by a human engineer

---

# **37\. Final Definition of Done**

The full Imagination Canvas implementation is not complete unless:

1. The canvas renders as a real product surface.
2. The infinite viewport supports stable pan and zoom.
3. Objects render through a typed registry.
4. Selection and manipulation are precise.
5. Object creation is predictable and event-driven.
6. Rich blocks exist.
7. Balnce-native blocks exist.
8. Blocks can inspect and expand.
9. Spatial context is preserved during expansion.
10. AI/agent events can create or modify blocks through typed boundaries.
11. History, undo/redo, and persistence are implemented or clearly integrated.
12. Mobile/touch behavior is intentionally designed.
13. Accessibility and reduced motion are considered.
14. Performance has been evaluated.
15. Sensitive blocks are privacy-aware.
16. Tests cover critical behavior.
17. No final mocks/stubs/placeholders remain.
18. Gaps are documented honestly.
19. The system feels Balnce-native, not generic.

---

# **38\. Final Instruction**

Proceed in phases.

Do not rush to visible UI at the expense of architecture.

Do not build a shallow canvas.

Do not build boxes on a plane.

Build the foundation of the Balnce Imagination Canvas: a spatial, semantic, agentic creation environment where every block can become a living application, every idea can become a workspace, and every interaction preserves the user’s sense of agency, context, and creative flow.

```

```
