\# IMPLEMENTATION PROMPT

\# Imagination Canvas Block UI, Block Library, Drag/Drop, and Orchestrator Intelligence Correction

You are working inside the Balnce / Imagination Canvas repository.

The current implementation is partially functional but does not meet product expectations. Your task is to correct the minimized block UI, block library, drag/drop behavior, and on-canvas orchestrator intelligence.

This is not a new architecture pass.

This is a precise product-quality repair pass.

Do not create more speculative abstractions.

Do not create generic cards.

Do not add new large systems unless required to make the existing system work.

Do not fake operational runtime.

Do not break existing canvas movement, expansion, registry, or message fabric behavior.

\---

\# 1\. Required Outcome

The Imagination Canvas should feel like a premium, living creative workspace.

The current issues are:

1\. Minimized blocks look disjointed and squeezed.

2\. The block library opens but looks ugly and shallow.

3\. Block cards are perfunctory and not educational or capability-rich.

4\. Dragging blocks from the library to the canvas does not work.

5\. The orchestrator agent responds too abruptly and misunderstands casual/emotional user input.

6\. The orchestrator does not feel context-aware or continuous from the original immersive chat.

7\. Blocks do not visually communicate capability, purpose, runtime status, or human-in-the-loop needs well enough.

Your job is to repair these areas with production-grade UI/UX.

\---

\# 2\. First Step: Inspect Before Editing

Before modifying code, inspect the current implementation and create/update:

\`\`\`txt

/docs/imagination-canvas-block-runtime-library/08-ui-repair-audit.md

Include:

- current minimized block component files
- current block library component files
- current registry files
- current drag/drop implementation
- current orchestrator chat files
- current expansion/maximize implementation
- current block projection/runtime state hooks
- exact problems found
- exact files you will modify

Do not spend too long on documentation, but do not edit blindly.

---

# **3\. Minimized Block UI Repair**

## **Current Problem**

The minimized block UI currently looks like a maximized card squeezed into a small rectangle.

Observed issues:

- top bar has too many controls
- title is truncated too aggressively
- tag is truncated and not useful
- gear icon is unnecessary
- minimize icon is irrelevant because the block is already minimized
- maximize icon is useful and should remain
- icons are insufficiently differentiated across block types
- the block has a strange thick white border with sharp edges while the block itself is rounded
- layout feels broken and disjointed
- useful dynamic generated text exists, but it is not presented beautifully
- human-in-the-loop or attention-needed state is not clearly represented

## **Required Minimized Block Structure**

Each minimized block should have a deliberate compact UI, not a compressed modal.

The minimized block should include:

```
Top row:
- block icon
- clean title
- single maximize icon only

Body:
- role / persona / purpose label
- one meaningful dynamic line or status summary
- optional capability chips, max 2 visible
- activity/status indicator

Footer or subtle lower zone:
- runtime state
- human-in-the-loop indicator if needed
- output/artifact preview cue if available
```

## **Top Bar Requirements**

Remove from minimized state:

- gear icon
- minimize icon
- extra duplicated controls
- truncated tag if it adds no value

Keep:

- title
- block icon
- maximize icon

The close action belongs only in the maximized modal as an `X`.

## **Visual Requirements**

Minimized blocks must have:

- rounded corners that match the border
- no mismatched sharp white border
- premium contrast
- clear selected state
- clear hover state
- clear active/running state
- subtle glow/pulse only when meaningful
- differentiated icons by block type
- visually distinct variants by category/studio
- readable hierarchy
- no cramped controls

## **Human-in-the-Loop Indicator**

Add a top or corner indicator for blocks needing user input.

Examples:

```
Needs input
Decision needed
Waiting on you
Review required
Approval needed
```

This should be visually clear but not alarming.

Suggested states:

```
type HumanInputState =
 | 'none'
 | 'input_needed'
 | 'decision_needed'
 | 'review_needed'
 | 'approval_needed';
```

## **Acceptance Criteria**

- Minimized block has only one primary control: maximize.
- Gear/minimize icons are removed from minimized block state.
- Top bar is clean and readable.
- Block icon is mapped by block type/category.
- Border and block radius are visually consistent.
- Dynamic generated text is presented beautifully.
- Human-in-the-loop indicator exists.
- Block variants are visually distinguishable.
- Blocks remain draggable and selectable.
- Maximize still opens the full block UI.

---

# **4\. Block Icon System**

## **Problem**

There are not enough unique visual identities for blocks in complex DAGs.

## **Required Implementation**

Create or complete a block icon mapping system.

The icon must be selected from:

1. explicit block type
2. category
3. studio
4. runtime type fallback

Example mapping:

```
const blockIconMap = {
 'video.studio': Video,
 'reel.studio': Clapperboard,
 'game.runtime': Gamepad2,
 'writer.studio': PenLine,
 'app.creation': Code2,
 'agent.generic': Bot,
 'agent.swarm': Network,
 'imagiclaw.sandbox': ShieldCheck,
 'commerce.checkout': CreditCard,
 'intentcasting': RadioTower,
 'wallet': Wallet,
 'artifact': Package,
 'research': Search,
 'knowledge': Brain,
 'audio': Mic,
 'image.generator': Image,
 'browser': Globe,
 'terminal': Terminal,
 'database': Database,
};
```

Use the available icon library already in the project. Do not add a new icon package unless necessary.

## **Acceptance Criteria**

- 40+ block types/categories have explicit icon mappings.
- Every block has a fallback icon.
- Complex DAGs show more than 2 repeated icons.
- Library cards and canvas blocks use the same icon identity system.

---

# **5\. Connector / Intention Lines**

## **Required Behavior**

Blocks should be connected by solid, flowing connector lines that show direction and data/intention flow.

They should not overwhelm the canvas.

Implement or improve:

```
- directional connectors
- subtle pulse animation
- dependency direction
- hover emphasis
- selected path emphasis
- no excessive visual noise
```

If the current connector system exists, improve styling.  
 If it does not exist, implement a minimal SVG overlay or canvas-layer connector renderer.

## **Acceptance Criteria**

- Blocks connected by DAG dependency lines.
- Lines show direction.
- Active/running edges can pulse subtly.
- Lines do not dominate the UI.
- Lines update when blocks move.

---

# **6\. Drag/Move Feel**

## **Problem**

Blocks can be moved but feel janky.

## **Required Fix**

Improve movement feel without rewriting the canvas engine.

Check for:

- pointer capture
- transform-based movement instead of layout thrashing
- unnecessary re-renders during drag
- bad z-index while dragging
- snapping or collision behavior causing jumps
- text selection interfering with drag
- event propagation conflicts
- drag handle vs content drag ambiguity

## **Requirements**

- drag should feel smooth
- selected block should lift visually while dragging
- cursor should be correct
- no accidental text selection
- no jump at drag start
- block should stay under pointer
- connector lines should update smoothly or after drag if live update is too expensive

## **Acceptance Criteria**

- Drag does not jump.
- Block movement feels smooth.
- Dragged block gets elevated visual state.
- Drag does not trigger unwanted selection or modal.
- Connectors remain coherent.

---

# **7\. Block Library UI Repair**

## **Current Problem**

The block library opens but feels ugly, shallow, and perfunctory.

Observed issues:

- cards only show simple title
- description is too short and meaningless
- tag is shallow
- search input padding is broken and overlaps icon
- carousel filter works but styling is poor
- cards are static
- drag/drop does not work
- cards do not communicate capabilities, skills, tools, outputs, or usage

## **Required Library Experience**

The block library must feel like a premium creative toolkit.

Each card should educate the user quickly:

```
- what this block is
- what it helps create
- what capabilities it has
- what tools/models/skills it may use
- what outputs it can produce
- how it is commonly used
```

Cards may be taller. Width can remain similar.

## **Required Card Structure**

Each block library card should include:

```
Header:
- icon
- title
- category/studio badge

Body:
- meaningful 1-2 sentence description
- capability chips, 2-4 visible
- output type preview

Footer:
- runtime/demo/agentic indicator
- drag affordance
```

Example description quality:

Bad:

```
A necessary condition for success.
```

Good:

```
Turns a rough launch idea into structured messaging, audience angles, hooks, and draft campaign assets.
```

Bad:

```
Video block.
```

Good:

```
Creates, edits, and organizes short-form video concepts, shot lists, scripts, reels, and generated visual assets.
```

## **Search Bar Fix**

Fix:

- icon overlap
- placeholder padding
- focus state
- border/contrast
- keyboard usability

## **Filter Styling**

Improve:

- carousel/chip styling
- active state
- hover state
- scroll behavior
- spacing
- readability

## **Acceptance Criteria**

- Library looks premium.
- Search input icon and text do not overlap.
- Category/studio filters are styled cleanly.
- Cards have richer descriptions.
- Cards show capabilities.
- Cards show outputs or runtime type.
- Cards are draggable.
- Drag affordance is clear.
- Library supports 65+ blocks without feeling chaotic.

---

# **8\. Block Drag From Library to Canvas**

## **Current Problem**

Dragging a card from the library onto the canvas does not work.

## **Required Behavior**

Every block library card must be draggable to the canvas.

When dropped:

1. A new typed block is created in canvas state.
2. The block appears at the drop coordinates.
3. The block briefly comes into focus.
4. The block is selected.
5. The orchestrator receives a canvas event.
6. The orchestrator responds contextually.
7. The block can be moved, maximized, and interacted with.

## **Implementation Requirements**

Use the existing canvas store if available.

Add or repair:

```
createBlockFromDefinition(definition, position)
```

or equivalent.

Drop position must account for:

- canvas viewport offset
- zoom
- pan transform
- screen-to-canvas coordinate conversion

Do not place all blocks at a fixed position.

## **Drop Event**

On successful drop, emit something like:

```
canvas.block.added
```

Payload:

```
{
 blockId,
 blockType,
 title,
 category,
 studio,
 position,
 source: 'block_library'
}
```

## **Acceptance Criteria**

- Every library card can be dragged.
- Drop creates a typed block.
- Drop position is correct relative to canvas transform.
- Dropped block is selected/focused.
- Orchestrator is notified.
- Block can be maximized after drop.
- Drag/drop works without breaking normal canvas drag.

---

# **9\. Block Runtime Expectations**

## **Reality Rule**

Do not pretend every block is fully operational if backend runtime is not wired.

However, every block should be runtime-ready.

Each block should expose:

```
type BlockRuntimeReadiness = {
 mode: 'live' | 'demo' | 'adapter_ready' | 'not_connected';
 agentic: boolean;
 supportsChat: boolean;
 supportsCommands: boolean;
 supportsArtifacts: boolean;
 supportsStreaming: boolean;
};
```

## **Required UI States**

Show one of:

```
Live
Demo flow
Runtime ready
Waiting for adapter
Needs configuration
```

Do not show misleading “running” states unless events actually arrive from the fabric/runtime.

## **Acceptance Criteria**

- Runtime states are honest.
- Agentic blocks expose chat affordance.
- ImagiClaw block has a strong maximized experience.
- Unsupported real execution is clearly marked as demo/adapter-ready.

---

# **10\. ImagiClaw Block Requirements**

## **Product Name**

Use:

```
ImagiClaw
```

Do not expose “OpenClaw” as the primary product-facing block name.

## **Minimized State**

Should communicate:

- sandboxed agent
- builder/operator capability
- tool execution potential
- runtime state
- human-in-the-loop if needed

## **Maximized State**

Build or improve an immersive ImagiClaw UI with:

```
- agent chat
- instruction collection
- task description
- tool/capability panel
- sandbox status
- artifact/output panel
- activity timeline
- command controls
- runtime readiness state
```

If live OpenClaw runtime is not wired:

- show “Sandbox adapter ready”
- show demo-mode activity only if clearly labeled
- do not fake actual tool execution

## **Acceptance Criteria**

- ImagiClaw exists in block registry.
- ImagiClaw has unique icon/visual identity.
- ImagiClaw card is rich and compelling.
- ImagiClaw minimized block is distinct.
- ImagiClaw expanded modal is immersive.
- Runtime state is honest.

---

# **11\. Custom Agent / Saved Block Flow**

## **Required Capability**

The system should support the idea of creating a custom agent block from the canvas or library.

Initial implementation can be UI \+ local definition persistence if backend persistence is not available.

Flow:

1. User drags “Blank Agent Template.”
2. Orchestrator asks what the agent should become.
3. User describes role/capabilities.
4. System creates a configured custom agent block.
5. User can save the recipe to the block library.
6. Saved block appears under Custom / My Blocks.

## **Do Not Fake**

If persistence is not wired, store locally and label as local/draft.

## **Acceptance Criteria**

- Blank Agent Template exists.
- Expanded state supports defining role, skills, outputs.
- Save-to-library affordance exists.
- Saved block appears in local/custom category if feasible.
- Limitations are honest.

---

# **12\. Orchestrator Intelligence Repair**

## **Current Problem**

The on-canvas orchestrator responds poorly.

Example:

User says:

```
This canvas is awesome!
```

Current response:

```
I'll create a plan for that now.
```

This is wrong.

The orchestrator is over-triggering planning behavior and failing to understand conversational intent.

## **Required Orchestrator Behavior**

The orchestrator must distinguish between:

```
- praise / emotional expression
- question
- request for explanation
- request for plan
- request for modification
- request for block creation
- request for execution
- request for refinement
- request for help
- playful exploration
```

## **Add Intent Classifier**

Implement a lightweight intent classification layer before action.

Example:

```
type OrchestratorUserIntent =
 | 'emotional_expression'
 | 'question'
 | 'explain_canvas'
 | 'modify_canvas'
 | 'create_block'
 | 'run_workflow'
 | 'refine_block'
 | 'plan_request'
 | 'help_request'
 | 'unknown';
```

If the user intent is emotional expression, respond warmly, do not create a plan.

Example desired response:

```
I love that. This is the moment where your original idea starts becoming something you can actually move, shape, and build with. Want me to walk you through what each block is doing, or should we keep exploring?
```

## **Context Continuity**

The on-canvas orchestrator must feel like the same intelligence from the original immersive chat.

It should have access to:

- original user intent summary
- original DAG/plan summary
- canvas block list
- selected block
- recent canvas events
- recent user actions
- runtime states
- known outputs/artifacts

If full history is not wired, create a context adapter boundary and use available summaries.

## **Canvas Awareness**

The orchestrator should react to:

- block added
- block selected
- block expanded
- block moved
- workflow run started
- output generated
- human input needed
- canvas empty
- library opened

## **Response Style**

The orchestrator should be:

- subtle
- intelligent
- creative
- supportive
- playful when appropriate
- educational through progressive reveal
- not abrupt
- not over-eager
- not always planning
- not always executing
- context-aware
- user-agency preserving

## **Action Gating**

The orchestrator should not execute actions unless the user actually requests action.

For ambiguous cases, ask or suggest.

Examples:

User: “This is awesome.”  
 Response: appreciation \+ optional guided next step.

User: “Can you make this cleaner?”  
 Response: propose layout refinement, ask or offer one-click apply.

User: “Add a video editor.”  
 Response: create or prepare to create Video Studio block.

User: “Run it.”  
 Response: clarify what “it” means if no current workflow is selected.

## **Acceptance Criteria**

- Orchestrator does not create plans for praise.
- Orchestrator classifies user intent before action.
- Orchestrator knows selected block.
- Orchestrator knows recent block drops.
- Orchestrator reacts to block added events.
- Orchestrator can suggest but does not over-execute.
- Orchestrator has access to original intent/DAG summary or adapter boundary.
- Responses feel continuous from initial chat.

---

# **13\. Orchestrator as Composer / Tool of the Canvas**

The orchestrator should treat each block as a tool it can help the user shape.

It should be able to:

- explain a block
- refine a block
- rename a block
- suggest better block settings
- connect two blocks
- suggest missing blocks
- improve layout
- update DAG plan
- help user define a custom agent
- help user configure ImagiClaw
- help user understand outputs
- help user move from idea to artifact

Initial implementation may be command-boundary-driven if full action execution is not ready.

Do not fake completed changes.

Use clear states:

```
Suggestion
Ready to apply
Applied
Needs confirmation
Runtime not connected
```

---

# **14\. Final Verification**

Run:

```
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

If commands differ, use the repo’s actual commands.

Also manually verify:

1. Open canvas.
2. Open block library.
3. Search does not overlap icon.
4. Filter categories/studios.
5. Drag a block to canvas.
6. Dropped block appears at correct position.
7. Dropped block is selected/focused.
8. Orchestrator reacts appropriately.
9. Minimized block looks clean.
10. Maximize opens immersive modal.
11. ImagiClaw block has unique minimized and expanded UI.
12. Praise message does not trigger plan creation.
13. “Add a video editor” creates/suggests the correct block.
14. “Make this cleaner” suggests layout refinement.
15. Runtime gaps are honest.

---

# **15\. Final Report**

Create/update:

```
/docs/imagination-canvas-block-runtime-library/09-ui-repair-implementation-report.md
```

Include:

- files changed
- minimized block improvements
- library improvements
- drag/drop fix
- orchestrator improvements
- ImagiClaw improvements
- remaining gaps
- commands run
- manual verification result

---

# **16\. Critical Instruction**

This pass succeeds only if the canvas feels meaningfully better to a human.

Passing typecheck is not enough.

The minimized blocks must look intentional.  
 The block library must feel valuable.  
 Dragging blocks must work.  
 The orchestrator must feel intelligent and context-aware.  
 The user must feel like the canvas is becoming a living creative system, not a pile of generic cards.

Implement exactly that.
