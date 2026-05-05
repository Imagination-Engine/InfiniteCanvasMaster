# **1\. Product Naming and Scope Rules**

## **1.1 OpenCove**

Do not expose “OpenCove Agent Workspace” as a product-facing block name.

Fold useful OpenCove-inspired capabilities into Balnce-native block/studio concepts such as:

- Agent Workspace
- Research Studio
- Code Studio
- Launch Studio
- Task Studio
- Knowledge Studio
- Business Builder Studio
- App Creation Studio
- Game Studio
- Writer’s Studio

You may reference OpenCove only in technical comments/spec notes if necessary.

## **1.2 OpenClaw**

OpenClaw-inspired runtime blocks must be called:

```
ImagiClaw
```

Examples:

- ImagiClaw Agent
- ImagiClaw Sandbox
- ImagiClaw Swarm
- ImagiClaw Tool Runner
- ImagiClaw Builder

## **1.3 Remove these for now**

Do not build exposed production UI for:

- AURA
- Device Mesh
- Edge Twin
- Identity
- real PLOG cryptography

However, you may include a **static visual Provenance / Origin Trail block** as a choreographed demo of future provenance intent, with no cryptographic claims.

## **1.4 Commerce stays**

Include visually rich but static/demo-mode flows for:

- Wallet
- Checkout
- Payments
- Commerce
- Intentcasting
- Offer negotiation
- Brand response simulation
- Cart / sovereign checkout
- Creator storefront
- Digital product sale
- Data / knowledge exchange offer

These must look alive and choreographed, but must not claim real brand/payment/network connectivity unless actually wired.

---

# **2\. Desired Product Flow**

Implement toward this full flow:

## **2.1 Immersive Intent Chat**

The user begins in a beautiful ChatGPT-style intent/imagination experience.

The orchestrator breaks down:

- what the user wants
- what they are imagining
- desired outputs
- style
- constraints
- required tools
- required blocks
- required agents
- required studios
- required artifacts

## **2.2 DAG / Plan Compilation**

The orchestrator compiles the user’s intent into a plan/DAG.

The plan becomes:

- agents
- tasks
- studios
- artifacts
- checkpoints
- media generators
- code/app blocks
- commerce/intentcasting blocks
- runtime blocks

## **2.3 Canvas Emergence**

The canvas should visually emerge from the compiled plan.

Blocks should appear arranged intelligently:

- tree
- mind map
- production board
- swarm cluster
- studio layout
- timeline
- dependency graph

Choose the best layout based on the DAG shape.

The layout must have:

- room for cognitive load
- clean spacing
- sharp contrast
- elegant motion
- pulsing intention lines
- visible dependencies
- meaningful block grouping
- poetic but precise visual language

## **2.4 Blocks as Living Functional Units**

Every block should have:

1. Library card state
2. Minimized canvas state
3. Active/running state
4. Expanded immersive modal state
5. Block chat/control interface
6. Purpose
7. Accepted inputs
8. Produced outputs
9. Capabilities
10. Runtime/fabric bindings
11. Settings/controls
12. Error/loading/empty states

## **2.5 Block Chat**

Each important block must include a chat/control surface.

The block chat allows the human to talk directly to that block’s agent.

The block agent is also coordinating with other agents through:

- Mastra
- A2A Message Fabric
- ui_projection lane
- agent_stream lane
- command_control lane
- workflow_trace lane

## **2.6 Canvas Orchestrator**

The main orchestrator agent must exist as a floating, draggable canvas chat.

It is the same intelligence from the original intent chat.

It knows the user’s first spark.

It reacts to canvas changes.

When the user drags a block out, the orchestrator should react contextually:

- “You added a Video Studio. Want this to become a launch reel, cinematic ad, or creator short?”
- “You dropped in ImagiClaw. Should I sandbox it as a builder, researcher, coder, or operator?”
- “That Writer’s Studio can become the narrative spine of this project.”
- “I can connect this Game Runtime to your Storyboard and Asset Generator.”

This can be implemented initially with deterministic contextual messages if full LLM reaction is not wired yet, but the interface must be designed to connect to Mastra orchestrator logic.

---

# **3\. Current Architectural Gap to Fix**

The current system has the shell but lacks the experience.

You must implement:

## **3.1 ImmersiveBlockModal**

The `Maximize2` action currently sets expansion state, but there is no proper deep modal.

Build:

```
ImmersiveBlockModal
ExpandedBlockSurface
BlockModalHeader
BlockModalSidebar
BlockModalChatPanel
BlockModalControlsPanel
BlockModalOutputPanel
BlockModalActivityTimeline
BlockModalSettingsPanel
```

The modal must overtake the screen edge-to-edge or near edge-to-edge.

It must render unique deep UIs per block type.

## **3.2 Floating Orchestrator Chat**

Port the landing-page chat into the canvas as:

```
FloatingOrchestratorChat
```

Requirements:

- draggable
- collapsible
- expandable
- aware of selected block
- aware of recently added block
- aware of current canvas objects
- able to send commands to the canvas store
- able to create blocks
- able to suggest layout improvements
- able to react to block drops
- visually premium

## **3.3 Block Library**

Build a slick left-side block library.

Requirements:

- filterable by category/studio
- searchable
- draggable cards
- framer-motion powered
- beautiful preview cards
- maps over existing BlockRegistry
- supports 60+ blocks
- supports mixed blocks on one workspace
- supports “studios” as category filters
- supports drag-to-canvas instantiation
- not generic
- visually excellent

## **3.4 Runtime Wiring**

Agentic blocks must not only render.

They must have runtime-ready bindings:

- block status from fabric projection
- block activity state
- block chat/control channel
- command hooks
- runtime adapter placeholders only where real backend is not wired
- no fake claims of real execution

If ImagiClaw is dropped, it should create a real block instance and prepare or call the runtime adapter boundary.

If sandbox execution is not fully wired, show “Sandbox ready / awaiting runtime connection” honestly, and log the gap. Do not pretend.

---

# **4\. Block Library Requirements**

Implement or normalize at least 65+ block definitions.

If existing registry already has them, enhance them.

If missing, add definitions.

Each block definition must include:

```
type BlockDefinition = {
 type: string;
 title: string;
 category: string;
 studio?: string;
 description: string;
 icon?: string;
 accent?: string;
 capabilities: string[];
 accepts: string[];
 produces: string[];
 agentic: boolean;
 runtime: 'none' | 'agent' | 'studio' | 'generator' | 'sandbox' | 'app' | 'commerce' | 'media' | 'document';
 libraryCardVariant: string;
 canvasVariant: string;
 expandedVariant: string;
 demoMode?: boolean;
};
```

## **Required categories**

Use these high-level categories:

```
Intent & Planning
Agents & Swarms
Chat & Communication
Text & Knowledge
Generative Media
Studios
Runtime & Apps
Commerce & Intentcasting
Files & Data
System & Utility
```

## **Required studio filters**

Include studio-style filters:

```
All
Agent Studio
Video Studio
Game Studio
Writer’s Studio
App Creation Studio
Commerce Studio
Research Studio
Knowledge Studio
Launch Studio
Media Studio
Automation Studio
```

## **Required blocks**

Ensure the library includes strong equivalents of these blocks, with product-facing names:

### **Intent & Planning**

- Intent Block
- Goal Block
- Task Block
- Milestone Block
- Requirement Block
- Decision Block
- Constraint Block
- Human Checkpoint Block
- Timeline Block
- Plan / DAG Block

### **Agents & Swarms**

- Agent Block
- Blank Agent Template
- Mastra Workflow Block
- Supervisor Agent Block
- Agent Swarm Block
- ImagiClaw Agent
- ImagiClaw Sandbox
- ImagiClaw Swarm
- Tool Runner Block
- MCP Tool Block
- Model Router Block
- Research Agent Block
- Builder Agent Block
- Code Agent Block
- Operator Agent Block

### **Chat & Communication**

- Block Chat
- Multi-Agent Room
- User Interview Block
- Approval Queue Block
- Inbox Block
- Comment Thread Block
- Voice Note Block
- Notification Block
- Agent Status Feed
- Canvas Orchestrator Chat

### **Text & Knowledge**

- Note Block
- Rich Document Block
- Markdown Block
- Table Block
- Checklist Block
- Code Block
- Prompt Block
- Source / Citation Block
- Knowledge Card Block
- Transcript Block
- Research Brief Block
- Writer’s Studio Block

### **Generative Media**

- Image Generator Block
- Image Editor Block
- Video Generator Block
- Video Editor Block
- Reel Studio Block
- Audio Generator Block
- Voice / TTS Block
- Music Block
- 3D Asset Block
- Storyboard Block
- Brand Creative Block
- Media Asset Board

### **Studios**

- Video Studio
- Game Studio
- App Creation Studio
- Writer’s Studio
- Launch Studio
- Research Studio
- Commerce Studio
- Knowledge Studio
- Automation Studio
- Brand Studio
- SaaS Builder Studio
- World Builder Studio

### **Runtime & Apps**

- Iframe Block
- Web App Block
- Game Runtime Block
- Simulation Block
- Terminal Block
- Browser Block
- API Tester Block
- Database View Block
- Dashboard Block
- File Workspace Block
- Code Workspace Block
- Live Preview Block

### **Commerce & Intentcasting**

- Wallet Block
- Checkout Block
- Payment Flow Block
- Offer Block
- Intentcasting Block
- Brand Response Block
- Negotiation Block
- Storefront Block
- Product Block
- Digital Asset Sale Block
- Creator Commerce Block
- Sovereign Cart Block

### **Files & Data**

- File Block
- Upload Dropzone Block
- Dataset Block
- CSV/Table Import Block
- Knowledge Pod Block
- Research Stream Block
- Memory Cluster Block
- Artifact Block
- Provenance / Origin Trail Block
- Data View Block

### **System & Utility**

- Timer Block
- Status Monitor Block
- Settings Block
- Environment Block
- Debug Trace Block
- Workflow Log Block
- Event Stream Block
- Output Compiler Block
- Canvas Runner Block
- Export Block

---

# **5\. UI Quality Requirements**

The UI must be beautiful.

Do not use plain gray generic cards.

Visual standards:

- sharp contrast
- deep glass / satin / dark premium surfaces if consistent with app
- clear typography hierarchy
- meaningful icons
- subtle gradients
- animated hover states
- active running pulse
- line glow for intention/dependency edges
- strong selected state
- clear minimized state
- crisp expanded state
- smooth modal transitions
- motion that clarifies, not distracts
- strong empty states
- no clutter

Use existing design system if present.

Use framer-motion if available.

If lucide-react or icon set exists, use it.

Do not introduce random styling patterns. Create reusable block primitives.

---

# **6\. Required Components**

Implement or complete these:

```
BlockLibraryDrawer
BlockLibrarySearch
BlockLibraryCategoryTabs
BlockLibraryStudioFilter
BlockLibraryCard
BlockLibraryCardPreview
DraggableBlockCard

CanvasBlockFrame
CanvasBlockHeader
CanvasBlockStatusBadge
CanvasBlockCapabilityChips
CanvasBlockActivityPulse
CanvasBlockActionBar
CanvasBlockChatDock
CanvasBlockOutputPreview

ImmersiveBlockModal
ExpandedBlockSurface
ExpandedAgentSurface
ExpandedArtifactSurface
ExpandedStudioSurface
ExpandedCommerceSurface
ExpandedRuntimeSurface
ExpandedDocumentSurface
ExpandedMediaSurface

FloatingOrchestratorChat
OrchestratorMessageList
OrchestratorComposer
OrchestratorCanvasAwareness
OrchestratorSuggestionCard

IntentionEdge
DependencyEdge
PulsingConnectionLine
CanvasLayoutCompiler
DagToBlockCompiler

BlockRuntimeStatus
BlockActivityTimeline
BlockCommandBar
BlockSettingsPanel
BlockAgentChat
```

---

# **7\. Required Hooks / Stores**

Implement or complete:

```
useBlockRegistry
useBlockLibrary
useBlockDragToCanvas
useBlockProjection
useBlockCommand
useBlockExpansion
useBlockChat
useCanvasOrchestrator
useCanvasAwareness
useDagToBlocks
useCanvasLayoutCompiler
useBlockRuntimeStatus
useImmersiveBlockModal
```

Do not call the hook `useBlockA2A` if it only reads UI events.

Use:

```
useBlockProjection
```

for read-only projected UI events.

Use:

```
useBlockCommand
```

for command/control actions.

Use:

```
useBlockDocumentState
```

for canonical document/canvas state if needed.

---

# **8\. Message Fabric Integration Rules**

Use the lane architecture correctly.

## **ui_projection**

Use for:

- block status
- live output preview
- streaming text preview
- progress
- transient activity
- visual pulse
- agent is thinking/running/waiting

Do not use for canonical state.

## **agent_stream**

Use for:

- agent deltas
- tool progress
- generated output in progress
- runtime logs

## **command_control**

Use for:

- start
- stop
- pause
- approve
- deny
- retry
- assign task
- spawn agent
- run canvas

## **workflow_trace**

Use for:

- DAG execution history
- plan step completed
- dependency completed
- block task completed

## **document_state**

Use for:

- final block position
- final block content
- final artifact placement
- final saved document/canvas state

## **durable_event**

Use for:

- artifact created
- workflow completed
- approval required
- commerce demo action completed
- output compiled

Do not commit token deltas to document_state.

Do not use SSE as canonical state.

Do not open one stream per block.

Use one canvas-level multiplexed projection stream or existing fabric projection store, then select by blockId.

---

# **9\. DAG-to-Block Compiler**

Implement or complete a DAG-to-block mapping layer.

Input:

- compiled plan/DAG
- node type
- agent role
- desired output
- tool requirements
- model requirements
- media/runtime needs

Output:

- block type
- block title
- block description
- initial position
- dependencies
- runtime capability
- visual grouping
- suggested studio category

Examples:

```
research task → Research Agent Block / Research Studio
write copy → Writer’s Studio / Rich Document Block
generate reel → Video Studio / Reel Studio Block
build app → App Creation Studio / Code Agent / Live Preview Block
run game → Game Runtime Block
sandbox autonomous builder → ImagiClaw Sandbox
commerce simulation → Intentcasting Block + Offer Block + Checkout Block
approval required → Human Checkpoint Block
final output → Output Compiler Block
```

---

# **10\. Canvas Layout Compiler**

Implement or complete an intelligent layout system.

It should support:

```
tree
mind_map
studio_board
timeline
swarm_cluster
pipeline
radial_orchestration
```

Choose layout based on DAG shape.

Minimum implementation:

- group by phase/category
- space blocks generously
- draw dependency lines
- avoid overlap
- place orchestrator near top/left or floating
- place output/compiler block at end
- place agent swarm blocks near their task clusters

Add pulsing intention/dependency edges.

---

# **11\. Immersive Modal Requirements**

Every major block type must open into an immersive modal.

At minimum implement deep UIs for:

```
Agent Block
ImagiClaw Sandbox
Artifact Block
App Creation Studio
Video Studio
Game Runtime Block
Writer’s Studio
Intentcasting / Commerce Block
Output Compiler Block
```

Each modal should include:

- title/header
- status
- block chat
- controls
- settings
- live activity
- output/artifact area
- related blocks
- run/stop/pause buttons where appropriate
- close/minimize
- beautiful layout

---

# **12\. Runtime Honesty Rules**

Do not fake real execution.

If a runtime is not wired, show:

```
Runtime boundary ready
Waiting for backend adapter
Demo mode active
```

But still build the UI beautifully and choreograph the intended flow.

For commerce/payment/intentcasting:

- demo mode is okay
- choreographed simulation is okay
- static but live-looking UI is okay
- do not claim real payments or real brands are connected

For ImagiClaw:

- create the block
- create the runtime adapter boundary
- show sandbox state honestly
- wire command_control if available
- do not pretend autonomous SaaS build execution is complete unless actually wired

---

# **13\. Implementation Phases**

You must implement in this order.

## **Phase 0 — Audit Current Block UI**

Create:

```
/docs/imagination-canvas-block-runtime-library/00-current-block-ui-audit.md
```

Document:

- current block components
- what is ugly or generic
- what registry exists
- what blocks exist
- what expansion wiring exists
- what orchestrator exists
- what drag/drop exists
- what runtime wiring exists
- what is missing

Do not stop at audit. Continue implementing.

## **Phase 1 — Block Registry Normalization**

Ensure the registry has 65+ rich block definitions with:

- category
- studio
- capabilities
- accepts
- produces
- runtime type
- demoMode flag
- visual metadata

## **Phase 2 — Left Block Library Drawer**

Implement:

- beautiful left drawer
- search
- category filter
- studio filter
- draggable cards
- registry-driven rendering
- block preview cards
- drag-to-canvas

## **Phase 3 — Canvas Block UI Upgrade**

Replace generic block UI with rich typed block views.

Implement:

- CanvasBlockFrame
- unique visual variants
- status badges
- capability chips
- active pulse
- output preview
- action bar
- chat affordance
- maximize affordance

## **Phase 4 — ImmersiveBlockModal**

Build full modal system and deep surfaces for core blocks.

## **Phase 5 — Floating Orchestrator Chat**

Implement draggable floating orchestrator.

It must react to:

- block added
- block selected
- block moved
- block expanded
- workflow run started
- canvas empty state

## **Phase 6 — DAG-to-Block Compiler**

Map plan nodes to block types.

## **Phase 7 — Canvas Layout Compiler**

Lay blocks out as tree/mind map/studio/swarm/timeline.

## **Phase 8 — Runtime and Fabric Wiring**

Wire:

- useBlockProjection
- useBlockCommand
- block runtime status
- block activity timeline
- orchestrator awareness events

## **Phase 9 — Core Demo Flows**

Implement beautiful demo flows for:

1. Create an app/SaaS
2. Create a game
3. Create a video/reel
4. Write a launch narrative
5. Run intentcasting/commerce simulation
6. Spawn ImagiClaw sandbox/swarm

## **Phase 10 — Polish and Tests**

Run:

- typecheck
- lint
- tests
- build

Fix related issues.

---

# **14\. Acceptance Criteria**

The implementation is not acceptable unless:

- Left-side block library exists and is beautiful.
- Library is filterable by category and studio.
- 65+ block definitions exist or existing ones are normalized.
- Cards are draggable to canvas.
- Dropping a block creates correct typed block state.
- Orchestrator reacts when blocks are added.
- Blocks are not generic cards.
- Blocks have unique minimized canvas states.
- Important blocks have immersive expanded modal states.
- Blocks expose chat/control affordances.
- Agentic blocks show runtime/activity state.
- ImagiClaw exists as product-facing block name.
- OpenCove is not exposed as product-facing block name.
- Aura, Device Mesh, Edge Twin, Identity are not exposed for now.
- Wallet/checkout/payment/intentcasting demo blocks exist.
- Canvas can visually emerge from a DAG/plan.
- Layout compiler avoids clutter and shows dependencies.
- Pulsing intention/dependency lines exist.
- Floating orchestrator chat exists on canvas.
- useBlockProjection is used for UI projection.
- ui_projection does not mutate canonical state.
- SSE is not treated as internal control bus.
- Runtime gaps are honest and documented.
- UI is visually premium.
- No mock/stub/placeholder-looking final UI.
- Typecheck/build pass or failures are documented.

---

# **15\. Files to Create or Update**

Likely areas:

```
packages/**/canvas/**
packages/**/blocks/**
packages/**/block-registry/**
packages/**/components/BlockLibrary*
packages/**/components/ImmersiveBlockModal*
packages/**/components/FloatingOrchestrator*
packages/**/components/CanvasBlock*
packages/**/hooks/useBlockProjection*
packages/**/hooks/useBlockCommand*
packages/**/hooks/useCanvasOrchestrator*
packages/**/stores/canvasStore*
packages/**/stores/expansionStore*
packages/**/stores/projectionStore*
packages/**/utils/dagToBlocks*
packages/**/utils/canvasLayoutCompiler*
```

Create docs:

```
/docs/imagination-canvas-block-runtime-library/00-current-block-ui-audit.md
/docs/imagination-canvas-block-runtime-library/01-block-registry-implementation.md
/docs/imagination-canvas-block-runtime-library/02-block-library-ui.md
/docs/imagination-canvas-block-runtime-library/03-immersive-modal-surfaces.md
/docs/imagination-canvas-block-runtime-library/04-orchestrator-chat-wiring.md
/docs/imagination-canvas-block-runtime-library/05-dag-to-block-layout.md
/docs/imagination-canvas-block-runtime-library/06-runtime-wiring-gaps.md
/docs/imagination-canvas-block-runtime-library/07-final-implementation-report.md
```

---

# **16\. Final Output Required**

When complete, report:

```
## Imagination Canvas Block Runtime Pass Complete

Implemented:
- ...

Block library:
- number of blocks
- categories
- studios

Core UI:
- library drawer
- canvas blocks
- immersive modal
- orchestrator chat
- layout compiler

Runtime wiring:
- projection
- command
- fabric
- gaps

Demo flows:
- app creation
- game
- video
- writer
- commerce/intentcasting
- ImagiClaw

Commands run:
- typecheck
- lint
- tests
- build

Remaining gaps:
- ...
```

---

# **17\. Critical Final Instruction**

Do not reduce this to “better cards.”

The goal is not a node library.

The goal is a living Imagination Canvas where:

- the user’s first spark becomes a plan,
- the plan becomes a spatial DAG,
- the DAG becomes beautiful functional blocks,
- blocks become agents, studios, tools, media generators, apps, games, and commerce flows,
- every block can talk to the human,
- every block can coordinate with other blocks,
- the orchestrator floats above the canvas as collaborator,
- and the entire workspace feels like thought becoming executable reality.

Implement that.
