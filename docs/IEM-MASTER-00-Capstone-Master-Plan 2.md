# IEM-MASTER-00 — The Imagination Engine Capstone Master Plan

> A six-week, five-student ascent from a promising React Flow canvas into an elite, multi-surface imagination studio. One substrate. Five expressions. Infinite canvases. This document is the north star the agentic engineering team will use to upgrade the repo, and the primer every student's CLI will re-read on arrival.

**Document ID:** IEM-MASTER-00
**Status:** Canonical. All subsidiary IEM documents derive from this.
**Audience:** The agentic engineering team (first), the student team (second), faculty and future investors (third).
**Governing Project:** [Imagination-Engine/InfiniteCanvasMaster](https://github.com/Imagination-Engine/InfiniteCanvasMaster)
**Relationship to Balnce Agentic Series:** Downscaled derivative. Honors the vision. Not a substitute. Suitable for consumption by undergraduate engineers with agent-CLI assistance.

---

## Table of Contents

**Part I — Foundation**

1. The Mission
2. Current-State Audit
3. The North-Star Architecture
4. The Unifying Thesis — Why Five Visions Are One Engine

**Part II — The Common Substrate** 5. The Block Protocol 6. The Agent Runtime 7. The Canvas Runtime 8. The Chat Shell 9. The Creations Drawer 10. The Custom Agent Flow 11. Data Model and Persistence

**Part III — The Five Surfaces** 12. Surface A — Playable (game studio) 13. Surface B — Conductor (workflow orchestration) 14. Surface C — Reel (generative media) 15. Surface D — Forge (app builder) 16. Surface E — Writers cove (writing and prose)

**Part IV — The Development Collaboration System** 17. Monorepo Layout and Ownership 18. Local Development Setup 19. Branch, PR, and Conflict Resolution Workflow 20. Agent-Assisted Bug Triage 21. TDD Harness — Red, Green, Refactor, Adversarial 22. Code Review and Hardening Gates

**Part V — The Documentation Repo** 23. README-at-Every-Juncture 24. The Agent Primer System 25. Semantic Document Map

**Part VI — The Demo** 26. The Target Demo Experience 27. Per-Student Demo Scripts 28. Faculty Presentation Framing 29. Beyond the Capstone

**Appendices**

- A. Dependency Inventory and Upgrade List
- B. MCP Primer for the Team
- C. The Block-Agent-Canvas Recursion, Explained Three Ways
- D. The Five-Step Discovery Method, Applied
- E. Glossary

---

# Part I — Foundation

## 1. The Mission

Five students, eight weeks deep, six weeks remaining. Each picked an expression of the Imagination Engine that spoke to them personally. A game studio that friends can play inside of. A workflow conductor that chains tools the way n8n chains tools, but on a canvas. An anime movie, scene by scene. A software forge, where the mind itself becomes the IDE.

Four visions named. A fifth student holding a slot. Good.

The instinct of a less experienced team would be to split the codebase, let each student own a subtree, and merge at the end with a prayer. That path produces four or five nice-looking demos that don't talk to each other, and a professor who nods politely.

The instinct of a senior team is the opposite. Pick the right substrate. Make the substrate composable. Hand each student a vision that, when they pull on their thread, pulls the entire fabric taller. Make their individual ambition and the collective rise be the same act.

This document designs that substrate.

The mission is not to ship a product in six weeks. The mission is to give five students a six-week experience that compounds... such that what shows up at the faculty demo would have taken a conventional team sixteen months, looks worthy of a seed round, and leaves each student with a piece of work they will quietly carry for a decade.

The engine is the teacher. The repo is the teacher. The agent CLI that primes itself from `/AGENTS.md` on first run is the teacher.

And behind all of it, so are we.

## 2. Current-State Audit

The repo is in a genuinely respectable state for eight weeks of undergraduate work. Acknowledge this. Do not rewrite what earns its keep.

### 2.1 What exists

**Stack (confirmed from README and language breakdown):**

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Canvas library: **React Flow**
- Routing: React Router
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (with a `migrations/` directory, which is a good sign)
- Auth: bcrypt + JWT
- LLMs: Ollama (local) + Google Gemini (cloud)
- Agent framework exploration: Microsoft Autogen (Python, in `autogen_exploration/`)
- Agent primer scaffolding: `.agent/rules/` exists
- Documentation scaffolding: `Documentation/` exists
- Language split: TypeScript 93.3%, JavaScript 4.8%, Python 1.3%
- 87 commits, active development

**Shipped node types (nine):**

Refiner, Summarizer, Translator, Color Swapper, Filter, Web Scraper, Formatter, Programmer, Gmail.

These are real working nodes. They are proof the team understands the basic primitive. They are also, as currently implemented, the thing that needs the most architectural lift... because right now each node is a hardcoded function with a direct LLM call behind it. We will upgrade them in place without throwing them away.

### 2.2 What is missing (and why it matters)

**Entry surface.** There is no chat shell. The user opens the app and is dropped onto a canvas. The natural cognitive move of a new user is to type a thought, not to drag a node from a palette. The missing chat-first entry costs more first-run conversions than any other single thing.

**Chat-canvas duality.** Chat and canvas are not the same object. They should be. One session, two views, one toggle.

**Left sidebar.** No persistent navigation. No history. No grid view of past canvases. No creations drawer. The user cannot find their own past work.

**Creations drawer.** No launchable artifact gallery. The student who builds a game has nowhere for that game to live except as "a canvas you happen to remember."

**Custom agent flow.** No way to create a new agent. The nine node types are a fixed palette.

**Block-as-agent.** Each node is a hardcoded TypeScript function. It is not an MCP tool. It cannot be swapped, wrapped, composed, or exposed to external agents. This is the single most important upgrade, architecturally.

**Canvas-as-agent.** The canvas has no MCP surface of its own. An external agent cannot ask the canvas "what's on you, what are your connections, add a block here." The canvas is passive.

**Onboarding carousel.** No first-run experience that teaches the mental model.

**Multi-student collaboration infrastructure.** No monorepo, no workspace split, no CODEOWNERS, no PR templates, no conflict-resolution playbook, no agent-assisted triage. Five students on one repo without this produces pain within three days.

**TDD harness.** No visible test discipline. This is fine at week eight of a prototype. It is not fine for the artifact we are aiming at.

**Deployment.** Terminal-only. Acceptable for demos from a student laptop. Not acceptable as a bar for what this project should become.

**Per-surface specialization.** No explicit home for the game studio, the workflow conductor, the media pipeline, or the software forge. Without surface packages, the five visions will merge into a slush.

### 2.3 What to keep

React + Vite + TypeScript + Tailwind. Keep. Modern, fast, well-documented, the right choice.

React Flow. Replace. Use TLDraw or Affine as benchmarks to create the world class canvas the capstone needs.

PostgreSQL with migrations. Keep. Add Drizzle ORM on top for type-safe queries and schema-as-code. Do not migrate to SurrealDB. Scope discipline.

bcrypt + JWT. Keep for now. Note the long-term production path moves toward passkeys and VLAD-shaped identity, but that is Balnce-proper, not capstone.

Ollama + Gemini dual setup. Keep, and formalize it. Both get MCP-wrapped. The Agent Runtime treats them as interchangeable model providers.

The nine existing nodes. Keep. Refactor each into a Block Protocol conformant module. Their logic does not change. Their packaging does.

Autogen exploration. Keep as a reference in `autogen_exploration/`. Do not extend it. The production path is MCP-first, which is simpler, more composable, and aligned with the direction the ecosystem is moving. Treat Autogen as a sibling artifact the team explored; archive it with dignity.

### 2.4 What to upgrade

The upgrade list, in order of leverage:

1. Wrap every block as an MCP tool (Section 5).
2. Introduce the MCP-first Agent Runtime (Section 6).
3. Extend the Canvas Runtime with presence, DAG execution, timeline, and artifact registry (Section 7).
4. Add the Chat Shell as the entry surface (Section 8).
5. Add the Creations Drawer and the unified navigation (Section 9).
6. Add the Custom Agent Flow (Section 10).
7. Formalize the data model (Section 11).
8. Refactor to monorepo with per-surface packages (Section 17).
9. Stand up TDD, CI, CODEOWNERS, PR workflow, and bug triage (Sections 20-22).
10. Populate the documentation repo (Section 23).

The rest of this document specifies each of these precisely.

## 3. The North-Star Architecture

The target architecture is small, recursive, and agent-native. It fits on one page conceptually, and expands fractally into whatever each surface needs.

### 3.1 The architecture, one paragraph

A **Canvas** is a holonic surface. It holds **Blocks**. Every Block is an **Agent** with an **MCP** binding and a typed I/O surface. Blocks connect to each other to form **Graphs**, which can be executed as DAGs, streamed as timelines, or sampled live as playable state. The **Canvas itself** is also an Agent, with its own MCP surface, so an external agent or another Canvas can ask it to add blocks, wire them, and run them. A **Session** is the thread that binds a Chat conversation and a Canvas together... same session, two views. Completed sessions become **Creations** that live in a drawer and can be relaunched. A **Custom Agent** is just a Block template that a user has parameterized with a story, persona, skillset, context, and purpose.

That paragraph is the whole engine.

### 3.2 Mermaid overview

```mermaid
flowchart TB
  subgraph SHELL["Application Shell"]
    CHAT[Chat View]
    CANVAS[Canvas View]
    DRAWER[Creations Drawer]
    NAV[Sidebar Navigation]
  end

  subgraph CORE["Common Substrate"]
    SESSION[(Session Store)]
    BLOCKPROTO[Block Protocol]
    AGENTRT[Agent Runtime]
    CANVASRT[Canvas Runtime]
    REGISTRY[Artifact Registry]
  end

  subgraph SURFACES["Five Surfaces"]
    A[Surface A - Playable]
    B[Surface B - Conductor]
    C[Surface C - Reel]
    D[Surface D - Forge]
    E[Surface E - Open]
  end

  subgraph PROVIDERS["Model & Tool Providers"]
    OLLAMA[Ollama]
    GEMINI[Gemini]
    MCP_EXT[External MCP Servers]
  end

  CHAT <--> SESSION
  CANVAS <--> SESSION
  DRAWER --> REGISTRY
  NAV --> SESSION

  SESSION --> CANVASRT
  CANVASRT --> BLOCKPROTO
  BLOCKPROTO --> AGENTRT
  AGENTRT --> OLLAMA
  AGENTRT --> GEMINI
  AGENTRT --> MCP_EXT

  A -.extends.-> CANVASRT
  B -.extends.-> CANVASRT
  C -.extends.-> BLOCKPROTO
  D -.extends.-> REGISTRY
  E -.extends.-> AGENTRT

  CANVASRT -.MCP surface.-> AGENTRT
```

The dotted `-.extends.-` arrows are the crucial bit. Each surface extends a shared substrate capability. When Surface A adds multiplayer presence to the Canvas Runtime, Surfaces B, C, D, and E inherit it for free.

### 3.3 The invariants

Four rules govern every engineering decision in this project. Any change that violates one of these is rejected at review.

**Invariant 1 — Every Block is an MCP Agent.** No hardcoded node functions. Every capability is a tool exposed via MCP, with a typed manifest. The block class is a thin UI wrapper over an MCP tool call. This is non-negotiable because it is the mechanism by which the five surfaces compose.

**Invariant 2 — The Canvas is Holonic.** The Canvas exposes its own MCP surface. It is a Block at one level of observation and a host at another. A Canvas can contain a Canvas. A Block can be promoted to a Canvas. A Canvas can be collapsed into a Block. This recursion is what lets Surface D (Forge) compose apps out of other canvases, and what lets Surface A (Playable) treat the game world as a composite of playable mini-blocks.

**Invariant 3 — Session is the Continuity Object.** A Chat and a Canvas are two projections of the same Session. Navigation between them is a view toggle, never a data migration. Every new chat creates a Canvas eagerly. Every new Canvas has a Chat backchannel eagerly. The DB model reflects this.

**Invariant 4 — Creations are Relaunchable.** Any Session can be marked as a Creation. A Creation appears in the Drawer. Launching a Creation re-hydrates its Session and restores whatever interactive state the surface chose to preserve. A Creation is self-contained... it travels without its authoring context if needed.

### 3.4 The scope discipline

Two things this capstone is **not**:

It is not a startup MVP aimed at paying customers. It is a thesis-quality engineering artifact that demonstrates what five mentored undergraduates can do in six weeks when given the right substrate and agent tooling. The standard is faculty-jaw-dropping, and customer-ready.

It is not some side project, it is the ultimate expression of what ingenious, driven stidents learning how to create and build will be able to do. The team, and you the Agentic engineer, should be proud of this project and every line of code you write, which means an unparalleld level of attention to detail, nuance, and critical thinking.

Holding these two boundaries keeps the team from both oversimplifying (losing the soul) and overscoping (shipping nothing).

## 4. The Unifying Thesis — Why Five Visions Are One Engine

The five student visions, as described, look like five different products. They are not. They are five expressions of the same substrate, each touching a different substrate capability.

Consider what each vision actually requires:

**Game Studio (Surface A).** Requires real-time presence. Requires a playable execution sandbox where a block can be "stepped into." Requires an embeddable runtime for the game world. The substrate capability is **multiplayer presence and sandboxed execution.**

**Workflow Automation / N8N-like (Surface B).** Requires the graph of blocks to actually execute in a defined order, with data flowing along edges. Requires error handling, retries, logging, and triggering. The substrate capability is **DAG execution semantics and the runtime scheduler.**

**Anime Movie (Surface C).** Requires media generation blocks (text-to-image, text-to-video). Requires a timeline overlay on the canvas so scenes can be ordered in time. Requires export to a final rendered video. The substrate capability is **streaming/media block I/O and the timeline view mode.**

**Software / App Builder (Surface D).** Requires chains of agent blocks (architect, designer, builder, tester). Requires the output to be a runnable artifact, not just a chat transcript. Requires the artifact to live in the Creations drawer and be launchable. The substrate capability is **the artifact registry and the compilation target.**

**Surface E (Writers Studio).** Whatever the fifth student chose. See Section 16 for how to map any fifth vision to a substrate capability. Likely candidates: collaborative knowledge graph, music studio, coaching/fitness companion, personal CRM, etc.

Each student extends one substrate capability. Their extension is visible to and usable by the other four surfaces the day they merge it. The game studio's presence layer becomes available to the workflow conductor, so two people can build a workflow together in real time. The workflow's DAG executor becomes available to the anime studio, so a scene-generation pipeline can run as a proper graph. The media pipeline's streaming primitive becomes available to the game studio, so live video can be a game texture. And so on.

This is not a happy accident. It is the reason the architecture was designed recursively.

The students will not fully see this on week one. They will see it around week three, when Student A asks Student B a casual question about the DAG executor because they realize their game loop wants one too. That moment is the moment the engine teaches.

Our job is to make sure that moment happens on week three, not week six.

---

# Part II — The Common Substrate

Every element in Part II is built in `@iem/core` (name per monorepo section). No surface owns these. All surfaces depend on them.

## 5. The Block Protocol

The Block Protocol is the most important abstraction in the system. Get this right and everything else follows.

### 5.1 Purpose

A Block is a unit of capability on the Canvas. It has:

- A **typed input surface** — a Zod schema describing what it receives.
- A **typed output surface** — a Zod schema describing what it produces.
- A **visual presentation** — a React component that renders it inside React Flow.
- An **agent binding** — an MCP tool or toolset that performs the work.
- An **execution mode** — one of `triggered` (runs on demand), `streaming` (emits over time), or `ambient` (persists state, responds to queries).

### 5.2 The TypeScript interface

Every block in the system implements `BlockDefinition<I, O>`:

```typescript
// packages/core/src/block/protocol.ts

import { z } from "zod";
import type { ComponentType } from "react";
import type { MCPToolBinding } from "@iem/core/mcp";

export type BlockExecutionMode = "triggered" | "streaming" | "ambient";

export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
> {
  /** Unique identifier, reverse-DNS style, e.g. "iem.core.refiner" */
  id: string;

  /** Human-readable display name */
  name: string;

  /** One-line description for palette and AI discovery */
  description: string;

  /** Category for palette grouping */
  category:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "code"
    | "data"
    | "io"
    | "meta"
    | string;

  /** Input schema. Validates what arrives on the input edge. */
  input: TInput;

  /** Output schema. Validates what leaves on the output edge. */
  output: TOutput;

  /** React component rendered inside React Flow. */
  view: ComponentType<BlockViewProps<z.infer<TInput>, z.infer<TOutput>>>;

  /** MCP binding that performs the actual work. */
  agent: MCPToolBinding;

  /** How this block participates in execution. */
  mode: BlockExecutionMode;

  /** Optional: default parameters the user can override in the inspector. */
  defaults?: Record<string, unknown>;

  /** Optional: capability tags for the AI to reason about composition. */
  capabilities?: string[];
}

export interface BlockViewProps<I, O> {
  id: string;
  data: {
    params: Record<string, unknown>;
    input?: I;
    output?: O;
    status: "idle" | "running" | "streaming" | "done" | "error";
    error?: string;
  };
  onParamsChange: (params: Record<string, unknown>) => void;
  onRun: () => void;
}
```

This is the only interface a student writes against when adding a new block. The rest is handled by the runtime.

### 5.3 The block registry

`@iem/core` exports a `BlockRegistry` singleton:

```typescript
// packages/core/src/block/registry.ts

import type { BlockDefinition } from "./protocol";

class BlockRegistry {
  private blocks = new Map<string, BlockDefinition<any, any>>();

  register(def: BlockDefinition<any, any>): void {
    if (this.blocks.has(def.id)) {
      throw new Error(`Block ${def.id} already registered`);
    }
    this.blocks.set(def.id, def);
  }

  get(id: string): BlockDefinition<any, any> | undefined {
    return this.blocks.get(id);
  }

  list(): BlockDefinition<any, any>[] {
    return Array.from(this.blocks.values());
  }

  byCategory(category: string): BlockDefinition<any, any>[] {
    return this.list().filter((b) => b.category === category);
  }
}

export const blockRegistry = new BlockRegistry();
```

Surfaces register their blocks on import. The Canvas palette reads from the registry. The AI, when proposing a new block on the canvas, queries the registry. The MCP surface of the Canvas exposes the registry to external agents.

### 5.4 Migrating the existing nine nodes

Every shipped node (Refiner, Summarizer, Translator, Color Swapper, Filter, Web Scraper, Formatter, Programmer, Gmail) gets migrated in place. The logic does not change. The wrapper does.

Illustrative migration, the Refiner:

```typescript
// packages/core/src/blocks/refiner.ts

import { z } from "zod";
import { RefinerView } from "./refiner.view";
import { createOllamaAgent } from "@iem/core/agent";
import type { BlockDefinition } from "../block/protocol";

const RefinerInput = z.object({
  text: z.string(),
  style: z.enum(["formal", "casual", "academic", "marketing", "poetic"]),
});

const RefinerOutput = z.object({
  text: z.string(),
  model: z.string(),
  latencyMs: z.number(),
});

export const refinerBlock: BlockDefinition<
  typeof RefinerInput,
  typeof RefinerOutput
> = {
  id: "iem.core.refiner",
  name: "Refiner",
  description: "Refine text into a specific writing style.",
  category: "text",
  input: RefinerInput,
  output: RefinerOutput,
  view: RefinerView,
  mode: "triggered",
  agent: createOllamaAgent({
    systemPrompt:
      "You are a skilled editor. Rewrite text in the requested style with no commentary.",
    tool: "refine_text",
  }),
  defaults: { style: "formal" },
  capabilities: ["text-transformation", "style-transfer"],
};

blockRegistry.register(refinerBlock);
```

All nine legacy nodes get this treatment as task IEM-MIGR-001 through IEM-MIGR-009 in the backlog.

### 5.5 The testing contract

Every block ships with:

- A schema test (the Zod schemas compile and round-trip).
- An agent binding test (the MCP tool it targets is reachable, mocked in CI).
- A render test (the view renders without error given a stub data object).
- A happy-path integration test (given valid input, the block produces schema-valid output).
- An adversarial test (given malformed input, the block fails gracefully with a user-facing error).

No block merges without all five. This is Section 21's territory but it begins here.

## 6. The Agent Runtime

The Agent Runtime is the layer that lets blocks talk to models and tools without each block reinventing that conversation.

### 6.1 Purpose

The runtime provides three things:

1. A uniform interface over Ollama, Gemini, and any future provider.
2. An MCP client that can call external MCP servers.
3. An MCP server that exposes every block in the registry as a tool the Canvas itself (and any external agent) can invoke.

### 6.2 The provider abstraction

```typescript
// packages/core/src/agent/provider.ts

export interface ModelProvider {
  id: string;
  name: string;
  supportedModels: string[];
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncIterable<ChatChunk>;
  supportsTools: boolean;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  tools?: MCPToolDescriptor[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: { inputTokens: number; outputTokens: number };
  latencyMs: number;
}
```

`OllamaProvider` and `GeminiProvider` both implement this interface, Mastra becomes the underlying multi-agent orchestration and capabilities layer. A block's `agent` field points to a provider and a prompt, not to a raw API call. Swapping Gemini for Claude later is a one-line change.

### 6.3 The MCP client

The runtime wraps `@modelcontextprotocol/sdk` for TypeScript. A block's agent binding can be any MCP tool, local or remote:

```typescript
// packages/core/src/agent/mcp-binding.ts

export interface MCPToolBinding {
  kind: "local" | "remote";
  serverUrl?: string; // for remote
  toolName: string;
  defaultArgs?: Record<string, unknown>;
  invoke: (input: unknown) => Promise<unknown>;
}
```

Local bindings dispatch to in-process handlers (which under the hood may call Ollama or Gemini). Remote bindings dispatch to an external MCP server. From the block's perspective, both look identical.

### 6.4 The Canvas as MCP server

This is the recursive part. Every Canvas exposes itself via MCP. The server runs in the backend and offers these tools:

- `canvas.describe()` — returns the current block graph as JSON.
- `canvas.addBlock(blockId, position, params)` — adds a block to the canvas.
- `canvas.connect(fromBlockId, fromPort, toBlockId, toPort)` — wires two blocks.
- `canvas.run(blockId?)` — runs the whole canvas or a subgraph.
- `canvas.get(blockId)` — reads the output of a block.
- `canvas.listBlocks()` — lists registered block types available to place.

This is what Zachary meant by "the canvas itself can be armed with MCP." An external agent, or the Chat Shell, or another Canvas, can look at a canvas, understand its structure, add to it, and run it. This recursion is what makes the engine imagine with the user rather than just respond to them.

### 6.5 The Block as MCP tool

Inversely, every block in the registry is automatically exposed as a named MCP tool on the Canvas's MCP server. A remote agent doesn't need to know about React Flow. It asks the Canvas "run refiner on this text" and the Canvas runtime dispatches.

### 6.6 Testing contract

The runtime must ship with:

- Unit tests for each provider (mocked network).
- Contract tests that both providers implement the same interface identically for a fixed prompt.
- An integration test that the Canvas MCP server round-trips `addBlock` and `run`.
- A spec test that running a three-block chain via MCP from outside produces the same output as running it from the Canvas UI.

## 7. The Canvas Runtime

The Canvas Runtime is a highly dynamic, beautifully engineered, highly enriched 60 +FPS environment where blocks can be dragged, dropped, moved, and arranged seamlessly against the advanced phyics and benchmarks of, and by taking it directly from TLDraw and Affine rendering layer. It gains four capabilities on top:

1. **Presence** — who else is looking at this canvas, where their cursor is, what block they're editing (Surface A extends this).
2. **DAG execution** — the scheduler that runs a graph in topological order, respecting async and streaming blocks (Surface B extends this).
3. **Timeline overlay** — a time-ordered view of the graph where a subset of blocks can be placed on a track (Surface C extends this).
4. **Artifact registry hooks** — bindings that let a canvas commit itself as a Creation (Surface D extends this).

### 7.1 Presence

Presence is opt-in per canvas. When enabled, the client maintains a websocket connection to a presence server. Cursor positions, selections, and block-edit locks broadcast at a throttled rate.

Technology choice for capstone: **`y-websocket` with Yjs** for CRDT-backed presence, or **`@liveblocks/client`** if the team prefers managed. Recommendation: **Yjs** because it is free, well-understood, and sets the team up for proper CRDT-native sync later. Remove the liveblocks dependency, it is not needed and we can engineer a solid system for local demonstration with yjs.

Presence is a Surface A responsibility to build out to full multiplayer game state. The base layer (cursors + selections) ships in `@iem/core`.

### 7.2 DAG Execution

The scheduler takes a canvas graph and executes it:

```typescript
// packages/core/src/canvas/scheduler.ts

export class CanvasScheduler {
  async run(
    canvas: CanvasGraph,
    startBlockId?: string,
  ): Promise<ExecutionResult> {
    const subgraph = startBlockId
      ? canvas.subgraphRootedAt(startBlockId)
      : canvas.toposort();

    for (const block of subgraph) {
      const inputs = canvas.resolveInputs(block.id);
      const validated = block.def.input.parse(inputs);
      const output = await block.def.agent.invoke(validated);
      const validatedOut = block.def.output.parse(output);
      canvas.setOutput(block.id, validatedOut);
      canvas.emit("block.done", { id: block.id, output: validatedOut });
    }

    return canvas.snapshot();
  }
}
```

Streaming blocks are handled via `AsyncIterable` outputs. Error handling bubbles through a `CanvasExecutionError` that identifies the failing block and preserves the partial graph state. Surface B owns the rich features: retries, conditional branches, parallel execution.

### 7.3 Timeline Overlay

A canvas can be in one of two view modes:

- `spatial` — default. Blocks sit where you place them. React Flow default behavior.
- `temporal` — blocks in the timeline track get a horizontal time-position. Playback runs them in time order. Used by Surface C.

The mode is per-canvas, set on a toggle in the canvas toolbar. The canvas model stores both a spatial position and an optional temporal position for each block.

### 7.4 Artifact Registry Hooks

Every canvas can be committed as a Creation. The commit captures:

- A snapshot of the block graph.
- A snapshot of each block's last output.
- A manifest describing what surface the creation was authored in.
- An optional launchable artifact (a URL, a bundle, a playable spec).

Committing is idempotent... the same canvas can be re-committed and the Creation updates. Surface D owns the compilation-to-launchable-artifact pathway; the base registry ships in core.

## 8. The Chat Shell

The Chat Shell is the front door. Zachary specified this clearly and the spec follows his directive.

### 8.1 Behavior

After login, the user lands on the Chat Shell. Not the Canvas. The Chat Shell is a clean conversation UI, single-pane, inspored by and taking UI/UX and adapting to our project directly from Libre Chat. The Libre Chat components and UI/UX will supply all the advanced interactions, stream states, flows, controls, compinents, states, etc, we will need to make this world-class.

A new Chat creates a new Session. A Session is the continuity object. The Session has a Canvas lazily attached the moment the conversation escalates beyond pure text... the first time the assistant suggests a block, or generates an image, or produces a file, or a tool call happens, or it creates a "Blueprint", the Canvas is materialized in the background.

The user is gently informed the first time this happens, with a small inline affordance: "I created a canvas for this. Open canvas?"

Subsequent canvas events update the existing canvas for that session.

### 8.2 Library choice

Do not import LibreChat wholesale. It is an entire product. We want its _shape_, and its code where applicable to adapt.

Build the Chat Shell in house using:

- **Vercel AI SDK (`ai` package)** for streaming-chat primitives (`research the latest API structure and calls using your search tool). This is the fastest path from zero to a working streaming chat.
- **Assistant UI** (https://github.com/assistant-ui/assistant-ui) for rapid and expert overlay of all chat microinteractions, the claude clone Ui for example: https://www.assistant-ui.com/examples/claude
- **shadcn/ui** for the message bubbles, input, and controls. Clean, composable, copy-paste source.
- **react-markdown** + **remark-gfm** for message rendering.

This gets the Chat Shell to a shippable state in a few focused days.

### 8.3 The Chat ↔ Canvas link

The Session object in the DB has a one-to-one relationship with a Canvas object. The Chat view and the Canvas view are both projections of the Session. The toggle in the nav swaps the view without touching the data.

Under the hood, assistant tool calls during chat (e.g., "use the Programmer block to generate a quicksort in Python") result in a Canvas mutation plus a chat message. The Canvas stays consistent with the conversation history.

### 8.4 The onboarding carousel

First-run only. Four slides, swipeable:

1. **Welcome.** "This is the Imagination Engine. Type what you want, and watch it appear on a canvas." Illustration.
2. **Blocks are Agents.** "Every shape on the canvas is a little AI. Connect them to build something bigger than any one of them." Illustration.
3. **The Canvas is yours.** "Save what you make. Come back to it. Share it. Launch it as an app, a game, a movie." Illustration.
4. **Let's start.** CTA button: "Type your first spark."

Implemented as a modal carousel using **`embla-carousel-react`**. Dismissable. Never shown again after first completion (stored in `users.has_completed_onboarding`).

## 9. The Creations Drawer

Left sidebar, always present once logged in. The navigation Zachary specified:

```
┌─────────────────────────────┐
│ ▣ New Chat                  │
│                             │
│ ─ History ─────────────     │
│ ☰ Grid toggle  🔍 Search    │
│ • Yesterday                 │
│   – Friday weekend idea...  │
│   – First game experiment   │
│ • Last week                 │
│   – Anime test scene        │
│   – ...                     │
│                             │
│ ─ Creations ───────────     │
│ ⊞ (app drawer)              │
│                             │
│ ─ Settings ────────────     │
│ ⚙ Account                   │
└─────────────────────────────┘
```

### 9.1 History section

Scrollable list of Sessions for the logged-in user. Default view: list, sorted by recency, grouped by date (Today / Yesterday / Last Week / Earlier). Each row shows a short title (auto-generated from the first user message, editable), last-updated timestamp, and a tiny indicator of whether the session has a canvas (dot) or is chat-only.

A toggle button in the header switches to **grid view** — a masonry of canvas thumbnails, same filtering and search. This is the request Zachary made.

Search is client-side for capstone scope, server-side for production. Client-side is fine up to a few thousand sessions.

### 9.2 Creations section

Separate from History. Not every session becomes a Creation. A Creation is a Session the user has explicitly committed via the "Save as Creation" action. Creations appear in the drawer as a grid of launchable cards, each with a large thumbnail, a title, and a tiny surface-badge ("Game", "Workflow", "Reel", "App").

Clicking a Creation **launches** it. Launching means:

- For Surface A (Playable): opens the game in full-screen edge-to-edge mode.
- For Surface B (Conductor): opens the workflow in a run-ready view with a "Run" button.
- For Surface C (Reel): opens the media player with the rendered output.
- For Surface D (Forge): opens the built app in a full-screen sandbox iframe.
- For Surface E: whatever the surface defines.

The drawer also has a "Create new" button that launches the Chat Shell for a fresh session. Zachary's spec requires this and it is preserved.

### 9.3 Settings section

Account, profile, preferred model, theme, onboarding reset, logout. Standard. Not a student focus area; ship a minimal page.

## 10. The Custom Agent Flow

A Custom Agent is, architecturally, a Block. A Block with user-authored parameters and persona. Users should be able to create one from three entry points:

1. **In chat.** "I want an agent that summarizes my meetings." Assistant opens the wizard inline.
2. **On canvas.** A palette button "Create custom block" opens the wizard in a side panel.
3. **From the drawer.** A top-level "Agents" tab in the Creations drawer.

All three routes converge on a single six-step wizard:

### 10.1 The Wizard

**Step 1 — Story.** A paragraph field. "What is this agent for? Who or what imagined it? What will it help with?" Saved as `agent.story`.

**Step 2 — Persona.** Name, one-line tagline, avatar (stock set or upload), voice-and-tone selector (concise / warm / analytical / creative). Saved as `agent.persona`.

**Step 3 — Skills.** Multi-select of MCP tools from a catalog (starting with: web search, file read/write, code execution in sandbox, image generation, the nine legacy nodes, etc.). Saved as `agent.skills`.

**Step 4 — Context.** Optional knowledge sources. Paste text, upload files (PDF, MD, TXT), or point to URLs. Ingested into a simple vector store (pgvector in Postgres) and retrieved on invocation.

**Step 5 — Capabilities.** Choose execution mode (`triggered` / `streaming` / `ambient`). Choose output types. Choose whether this agent can call other agents.

**Step 6 — Purpose.** "In one sentence, what is this agent's purpose?" This is the `description` that appears in the block palette and in AI-driven block proposals.

On completion, a `BlockDefinition` is generated programmatically and registered. The custom agent appears in the palette immediately.

### 10.2 Data Model

```sql
CREATE TABLE custom_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  tagline TEXT,
  avatar_url TEXT,
  story TEXT,
  persona JSONB NOT NULL,
  skills TEXT[] NOT NULL,
  context_sources JSONB,
  capabilities JSONB NOT NULL,
  purpose TEXT NOT NULL,
  block_definition JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON custom_agents (owner_id);
```

Context sources use pgvector for embeddings. Provide a simple chunking strategy (500-token chunks with 50-token overlap) and OpenAI text-embedding-3-small or a local embedding model via Ollama.

## 11. Data Model and Persistence

Keep Postgres. Add Drizzle ORM for type-safe schemas.

### 11.1 Core tables

```sql
-- Users (already exists, extend)
users:
  id, email, password_hash, created_at, updated_at,
  has_completed_onboarding boolean default false,
  preferred_model text default 'ollama:llama3'

-- Sessions (new, replaces whatever "projects" currently is)
sessions:
  id, owner_id, title, created_at, updated_at,
  last_active_at,
  is_creation boolean default false,
  creation_surface text,  -- 'playable', 'conductor', 'reel', 'forge', 'e', null
  thumbnail_url text

-- Messages (new, per session chat history)
messages:
  id, session_id, role, content, created_at,
  tool_calls jsonb

-- Canvases (new, one per session)
canvases:
  id, session_id unique, graph jsonb, view_mode text default 'spatial',
  version int default 1, updated_at

-- Canvas executions (new, run history)
canvas_executions:
  id, canvas_id, started_at, finished_at,
  status text, block_results jsonb, error jsonb

-- Custom agents (see 10.2)

-- Bug reports (see Section 20)
-- Backlog items (see Section 20)
```

### 11.2 Migrations

Use Drizzle Kit for migrations. The existing `migrations/` folder already implies this pattern is acceptable to the team. Convert any raw SQL migrations to Drizzle-authored migrations as part of the upgrade work.

### 11.3 Backup and local dev

Docker Compose ships with Postgres and pgvector. A single `docker-compose up -d db` starts a clean local database. A `pnpm db:seed` command populates with a demo user, a demo session, and a demo canvas with three connected blocks, so new students can see something working within minutes.

---

# Part III — The Five Surfaces

Each surface is a package under `packages/surface-*`. Each has an owner (one student). Each extends one or more core capabilities. Each ships a demo.

Every surface follows the same primer structure:

1. Vision in one paragraph.
2. What it extends in core.
3. What it uniquely owns.
4. Six-week milestones.
5. Demo spec.

## 12. Surface A — Playable (Game Studio)

**Owner:** Student A.
**Package:** `packages/surface-playable`

### 12.1 Vision

A game studio on the canvas, where a designer can sketch a playable experience in blocks (a room, a character, a rule, a friend joining) and a friend can hop in live. The game _is_ the canvas. Playtest happens on the canvas. Export ships a playable embed.

### 12.2 What it extends in core

**Presence (Section 7.1).** The student extends the base Yjs presence layer with richer game state: positions, scores, world objects, per-block state that syncs across peers.

**Artifact Registry (Section 7.4).** The student adds a "play this" compilation path that bundles the canvas into a launchable experience.

### 12.3 What this surface uniquely owns

- A `PlayableCanvas` view mode — a canvas view that, instead of showing blocks, runs the blocks as a live world.
- A small set of game-primitive blocks: `Scene`, `Character`, `Item`, `Rule`, `Spawner`, `Win Condition`.
- A presence indicator ("Dillon is here") that overlays the canvas in-play.
- An invite link mechanism (one-click copy a URL to join the live canvas).
- Keyboard/mouse input routing into the canvas execution graph.

### 12.4 Six-week milestones

- Week 9: Presence layer integrated. Two browser tabs can see each other's cursors. Render in both views.
- Week 10: First playable demo. Two game-primitive blocks (`Scene`, `Character`). Manual wiring. Character moves with arrows, synced.
- Week 11: Expand game-primitive blocks to six. Add `Rule` block with a simple DSL (trigger ↔ action).
- Week 12: Invite-link flow. Second user joins via URL. Stable cross-browser.
- Week 13: `PlayableCanvas` view mode polished. Export-as-Creation works. Demo creation appears in drawer.
- Week 14: Integration demo. Student A's game uses one block from Surface B and one block from Surface C.

### 12.5 Demo spec

Onstage, Student A:

1. Signs up, completes onboarding.
2. Starts a new chat, types "I want to build a game where two friends run around a room collecting stars."
3. Assistant creates a canvas with Scene, Character, Character, Item blocks wired up.
4. Student A toggles to Canvas view, adjusts the Rule block ("collision with star = +1 score").
5. Student A hits "Launch as Creation." Creation appears in drawer.
6. Student A launches the Creation. Game fills the screen.
7. Student A copies invite link, pastes it into a second browser, presses play. Both characters visible. They play. Score ticks up.
8. Student A returns to main chat view, types "add a timer." A Timer block appears on the canvas. Game auto-updates.

Six minutes. Wordless applause.

## 13. Surface B — Conductor (Workflow Orchestration)

**Owner:** Student B.
**Package:** `packages/surface-conductor`

### 13.1 Vision

Chain blocks together to accomplish real work across real tools. Pull a calendar event, summarize it, draft a followup, send it. Scrape a site, filter, post to Slack. The n8n feeling, but on the canvas, with agents rather than just functions, and with the chat-and-canvas duality intact.

### 13.2 What it extends in core

**DAG Execution (Section 7.2).** The student hardens and extends the scheduler: conditional edges, parallel branches, retry policies, error branches, scheduled triggers, webhook triggers.

**Agent Runtime (Section 6).** The student expands the catalog of MCP tool bindings: Slack, Discord (as per the README's "planned"), Notion, GitHub, Linear, calendar, filesystem.

### 13.3 What this surface uniquely owns

- Trigger blocks (`WebhookTrigger`, `ScheduleTrigger`, `ManualTrigger`, `EventTrigger`).
- A conditional block (`If`).
- A loop block (`ForEach`).
- A retry wrapper block.
- The run history panel (per-canvas execution log with per-block timings, inputs, outputs, errors).
- MCP bindings for the major SaaS tools listed above.

### 13.4 Six-week milestones

- Week 9: Scheduler hardened. Streaming outputs work. Unit tests pass for a five-block chain with a streaming middle.
- Week 10: Trigger blocks (manual + schedule). ForEach block. Conditional If block. Tests.
- Week 11: Slack and Discord MCP bindings ship. Demo workflow: "every weekday 9am, post a standup prompt to #team-standup."
- Week 12: GitHub and Notion MCP bindings. Demo workflow: "when a GitHub issue is labeled 'bug', create a Notion card and ping me in Slack."
- Week 13: Run history panel polished. Retry/error branching ships.
- Week 14: Integration demo. Student B's workflow uses Student C's Reel to generate a daily image in the morning Slack post.

### 13.5 Demo spec

Onstage, Student B:

1. Starts a new chat, types "I want a workflow that pulls my GitHub issues, summarizes the P0s, and posts to Slack every weekday morning."
2. Assistant generates a canvas. Student B tweaks the schedule to 9am, picks the channel.
3. Clicks "Run Now." Runs live. Real issues are fetched. Real summary is generated by Gemini. Real message is posted.
4. Opens the run history panel. Shows the block-by-block breakdown.
5. Saves as Creation. The Creation lives in the drawer with a "Scheduled" badge.
6. Goes to another canvas mid-run. Points at it. "And this one's been running in the background all morning."

Applause.

## 14. Surface C — Reel (Generative Media)

**Owner:** Student C.
**Package:** `packages/surface-reel`

### 14.1 Vision

An anime movie, one scene at a time, on the canvas. Prompt a character. Prompt a setting. Prompt a shot. Arrange them on a timeline. Playback. Iterate. Export.

### 14.2 What it extends in core

**Block Protocol streaming mode (Section 5).** The student pushes the streaming execution path and the media I/O types.

**Timeline overlay (Section 7.3).** The student owns the timeline view mode end-to-end.

### 14.3 What this surface uniquely owns

- Media generation blocks: `TextToImage`, `ImageToImage`, `TextToAudio`, `TextToSpeech`, optionally `TextToVideo` depending on provider access.
- A `Scene` block that composes image + dialogue + duration.
- A `Cut` block for transitions.
- The timeline track UI (horizontal lane under the canvas spatial view, draggable scene arrangement).
- An export-as-video pipeline (stitch scenes via FFmpeg in a background worker).

### 14.4 Six-week milestones

- Week 9: Streaming block I/O types finalized in core. `TextToImage` block ships with a Replicate or fal.ai provider.
- Week 10: Timeline overlay component. Scene blocks render in the track. Drag reorder works.
- Week 11: `Scene` block composes image + dialogue text-to-speech. Per-scene duration.
- Week 12: Cuts and transitions. First two-minute anime clip generated end-to-end.
- Week 13: Export pipeline (FFmpeg worker). Output is a downloadable MP4.
- Week 14: Integration demo. Reel uses Surface B's Conductor to auto-generate the daily anime "mood" image in the morning Slack post.

### 14.5 Demo spec

Onstage, Student C:

1. New chat: "I want to make a one-minute anime scene where a cat detective solves a mystery in a rainy Tokyo street."
2. Assistant generates a canvas with four Scene blocks. Toggle to timeline view.
3. Student C plays the timeline. The scenes render, text-to-speech narration plays, cuts transition.
4. Student C tweaks one scene's prompt, re-renders that scene only.
5. Student C exports as video. Plays the MP4 full-screen.
6. Saves as Creation. Creation appears in drawer with a play icon.

Applause.

## 15. Surface D — Forge (App Builder)

**Owner:** Student D.
**Package:** `packages/surface-forge`

### 15.1 Vision

Give the mind tools to build. Describe what you want to make. A chain of agent blocks (architect, designer, builder, tester) composes it into a runnable artifact. The artifact lives in the drawer. Launching it opens a real, working mini-app inside a sandbox.

This is the closest surface to the full Balnce Imagination Engineering Team (IET) vision, dramatically scaled down.

### 15.2 What it extends in core

**Artifact Registry (Section 7.4).** The student owns the compilation-to-launchable-artifact path end-to-end.

**Agent Runtime (Section 6).** The student introduces multi-agent composition... a single "agent" is really four agents in a chain.

### 15.3 What this surface uniquely owns

- Agent-role blocks: `Architect`, `Designer`, `Builder`, `Tester`.
- A `BuildSpec` input block where the user describes the app.
- A compilation target that produces a self-contained HTML+JS bundle (single file, inlined assets).
- A sandboxed iframe launcher that runs the built artifact with strict CSP.
- A "build log" panel that shows each agent's output as it works.

### 15.4 Six-week milestones

- Week 9: Artifact Registry stabilized in core. Simple "hello world" artifact compiles and launches.
- Week 10: `Architect` block ships. Given a prompt, produces a structured spec (file list, component tree, routes).
- Week 11: `Builder` block ships. Given an Architect spec, produces the actual code. Uses Gemini or Claude for code quality.
- Week 12: `Tester` block ships. Runs the built artifact in a headless sandbox, reports issues.
- Week 13: Full four-block chain works end-to-end on three demo prompts (a tic-tac-toe, a calculator, a todo list).
- Week 14: Integration demo. Surface D builds a simple mini-app that uses a Custom Agent created via Section 10.

### 15.5 Demo spec

Onstage, Student D:

1. New chat: "Build me a todo list that syncs between two browsers and has priorities."
2. Assistant generates a canvas with the four agent blocks. The `BuildSpec` block auto-populates from the user's prompt.
3. Student D hits "Run." Watches the build log stream. Architect produces a spec. Designer produces a layout. Builder generates code. Tester runs it and passes.
4. Creation appears in drawer.
5. Student D launches it. The todo app opens in a sandbox. Student D adds a task. Opens a second browser tab. Task appears.
6. Student D says "now watch this" and asks the assistant to add a dark-mode toggle. The canvas re-runs the relevant agents. The app reloads. Dark mode works.

Applause.

## 16. Surface E — Open Slot

**Owner:** Student E.
**Package:** `packages/surface-<name>` (once vision is chosen)

Zachary, the fifth student's vision was not named in the brief. The template below is parametric. Whatever the fifth student chose, map it through these questions:

1. **Which core substrate capability does this vision most naturally extend?** Options, in descending order of "good pedagogical fit":
   - Chat Shell + Session model → extends Sections 8 and 11.
   - Agent Runtime + MCP binding catalog → extends Section 6.
   - Custom Agent Flow → extends Section 10.
   - Canvas Runtime (if none of A-D fits) → extends Section 7.

2. **What unique blocks does this vision need?** Enumerate three to six block types.

3. **What unique view mode, if any?** (e.g., a knowledge-graph mode, a music-studio mode, a kanban mode.)

4. **What does its Creation look like on launch?**

### 16.1 Plausible Surface E candidates

Offered as inspiration; pick one the fifth student genuinely wants.

- **Surface E as "Atlas" (knowledge graph / Second Brain):** Extends Custom Agent Flow with context sources and retrieval. Blocks are notes, sources, questions. View mode is a knowledge graph. Creations are searchable brains.
- **Surface E as "Studio" (music):** Extends Block Protocol with audio-streaming primitives. Blocks are samplers, synths, effects, arrangers. View mode is a track-based DAW overlay.
- **Surface E as "Coach" (personal / wellness / habits):** Extends Agent Runtime with ambient-mode execution. Blocks are habit trackers, reflection prompts, check-ins, visualizations. Creations are personal companions.
- **Surface E as "CRM" (relationships):** Extends Session model with people-objects. Blocks are contact cards, conversation summarizers, followup agents. Creations are network views.

Once chosen, this section gets filled in to the same depth as Surfaces A through D.

---

# Part IV — The Development Collaboration System

Five students, each with two-to-three agent CLIs, working on one repo. Without structure, this is a recipe for silent devastation. With structure, it is a recipe for elite velocity.

## 17. Monorepo Layout and Ownership

### 17.1 Layout

Convert the repo to a **pnpm workspaces** monorepo:

```
InfiniteCanvasMaster/
├── apps/
│   ├── web/                 # Vite + React app (what's today in imagination-canvas)
│   └── server/              # Express backend
├── packages/
│   ├── core/                # Block Protocol, Agent Runtime, Canvas Runtime base
│   ├── ui/                  # Shared UI components (shadcn base)
│   ├── db/                  # Drizzle schema and migrations
│   ├── agents/              # MCP server and tool catalog
│   ├── surface-playable/    # Student A
│   ├── surface-conductor/   # Student B
│   ├── surface-reel/        # Student C
│   ├── surface-forge/       # Student D
│   └── surface-e/           # Student E (renamed once vision chosen)
├── docs/                    # Documentation repo (see Part V)
├── scripts/                 # Dev and ops scripts
├── .agent/                  # Agent primer and rules (expanded from existing)
├── .github/                 # CODEOWNERS, PR templates, workflows
├── AGENTS.md                # Top-level agent primer
├── CLAUDE.md                # Claude-specific primer (aliased to AGENTS.md)
├── package.json             # Workspace root
├── pnpm-workspace.yaml
├── turbo.json               # Turborepo pipeline
└── README.md
```

### 17.2 Ownership

`.github/CODEOWNERS`:

```
# Core substrate — reviewed by the mentor (and any surface owner can propose changes)
/packages/core/             @mentor
/packages/ui/               @mentor
/packages/db/               @mentor
/packages/agents/           @mentor

# Surfaces — student-owned
/packages/surface-playable/ @student-a
/packages/surface-conductor/ @student-b
/packages/surface-reel/     @student-c
/packages/surface-forge/    @student-d
/packages/surface-e/        @student-e

# Apps — mentor-owned, contributions encouraged
/apps/                      @mentor

# Docs — everyone touches, mentor is final arbiter
/docs/                      @mentor
```

**Ownership rule.** A student can propose changes to `core/`, `ui/`, `db/`, or `agents/`. They must open a PR with the mentor as reviewer. These changes are where the compounding magic happens... Student A extending presence in core is what gives Student B multiplayer workflows for free.

### 17.3 Turborepo pipeline

`turbo.json` defines a unified pipeline:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

`pnpm dev` at the root starts everything. `pnpm test` runs every package's tests in parallel.

## 18. Local Development Setup

### 18.1 One-command bootstrap

After clone:

```bash
pnpm install
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

This takes a student from "fresh clone" to "chat shell live in browser" in under three minutes. This is non-negotiable. Friction here is velocity loss compounded across five students.

### 18.2 Environment

One `.env.example` checked in. Each student copies to `.env.local`. Required keys:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iem
JWT_SECRET=<generated-by-script>
OLLAMA_BASE_URL=http://localhost:11434
GEMINI_API_KEY=<per-student>
REPLICATE_API_TOKEN=<per-student>
```

A `scripts/check-env.ts` runs on `pnpm dev` and fails loudly if anything critical is missing, with a link to the doc that explains how to obtain it.

### 18.3 Ollama setup

Document which Ollama models the project expects (e.g., `llama3.1:8b`, `qwen2.5:7b`). A `scripts/setup-ollama.sh` pulls them. This removes the "it works on my machine" variance.

### 18.4 Mock mode

Set `IEM_MOCK_MODELS=1` to run against mocked model providers. Tests use this by default. Students can run the whole stack without network. Essential for CI.

## 19. Branch, PR, and Conflict Resolution Workflow

### 19.1 Branch model

**`main`** — protected. No direct commits. PR-only. All checks must pass.

**Per-student branches** — each student works on `student-a/<feature>` or `student-a/surface-playable-<feature>`. Long-lived feature branches live on the student's namespace.

**Daily sync.** Every student rebases their active branches onto `main` every morning. A `scripts/daily-sync.sh` automates this with a safety prompt.

### 19.2 PR template

`.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What this PR does

One paragraph. Written for a human reader who is not you.

## Why this PR does it

Link to the backlog item, or the surface milestone it advances, or the bug it fixes.

## What surface(s) it touches

Check all that apply:

- [ ] core
- [ ] ui
- [ ] db
- [ ] agents
- [ ] surface-playable
- [ ] surface-conductor
- [ ] surface-reel
- [ ] surface-forge
- [ ] surface-e

## Tests

- [ ] Red-green-refactor honored
- [ ] Adversarial test included
- [ ] All CI checks passing

## Screenshots / Demo clips

If UI-visible.

## Risk

One sentence: what might break.

## For the reviewer

What should they look at first?
```

### 19.3 Conflict resolution playbook

When two students modify the same file (most likely in `packages/core/`), the first to merge wins the base, the second must rebase and adapt.

For structural conflicts (both students extended the same Canvas method differently), the mentor mediates synchronously in a 20-minute pair-session. No issue left festering past 24 hours.

An agent-assisted pre-rebase check (part of the `scripts/daily-sync.sh` flow) runs the student's agent CLI against the incoming changes with a prompt like: "Here is the diff from main that is about to land in my branch. Summarize what changed and whether my active files in `packages/surface-playable/` need to adapt."

This gives the student a 30-second briefing before they rebase, instead of a bewildering pile of conflict markers.

### 19.4 Merge gates

A PR to `main` cannot merge unless:

- All CI checks green (test, lint, typecheck, build).
- At least one reviewer approval.
- If it touches `core/`, `ui/`, `db/`, `agents/`: mentor approval required.
- No `TODO(critical)` comments left in added code.

### 19.5 Release cadence

Every Friday, a "demo tag" is cut from `main`. `v0.week-9`, `v0.week-10`, etc. This creates a known-good state to roll back to if a week goes sideways, and a ladder of artifacts the team can walk the professor through on demo day.

## 20. Agent-Assisted Bug Triage

Zachary's directive: the agent should be able to identify issues outside its own scope, record them in a common backlog document, and bring them up when necessary. This is not a feature. It is a cultural practice supported by tooling.

### 20.1 The backlog file

`docs/backlog/TRIAGE.md` is a living markdown file with this structure:

```markdown
# Imagination Engine Triage Backlog

> This file is an append-only log maintained by humans and agents alike.
> When an agent (or human) notices an issue that is outside their current
> work, they append an entry here. Once a week the mentor reviews and
> promotes items to GitHub issues.

---

## Open

### [2026-04-20] Cursor flicker on React Flow zoom

- Source: agent (Claude Code, session a3f9)
- Surface: core (canvas runtime)
- Severity: low
- Description: When zoom changes rapidly, the cursor presence layer flickers
  for ~200ms. Reproducible on Chrome 134+ on macOS. Suspect throttle not
  coalescing frames.
- Suggested fix: increase throttle from 16ms to 50ms or switch to
  requestAnimationFrame coalescing.

### [2026-04-21] Refiner block tests flaky under load

- Source: CI run #847
- ...

---

## Promoted

<!-- items moved to GitHub issues go here as links -->
```

### 20.2 The agent primer

`.agent/rules/triage.md` contains this instruction for any agent CLI working in the repo:

> **Triage Rule.** If during your work you notice a bug, dead code, a broken test, a performance regression, a security issue, or any other concern that is **outside the scope of your current task**, append an entry to `docs/backlog/TRIAGE.md` in the Open section. Follow the format. Do not derail your current task to fix it. Your entry should take under 30 seconds to write. Date entries with the current date.

This makes the agents _curators of quality_, not just producers of code. Over six weeks, this backlog becomes a rich signal of system-wide health.

### 20.3 The weekly promotion script

`scripts/triage-promote.ts` is a mentor utility. It reads `TRIAGE.md`, opens a CLI prompt for each Open item, and for each: `skip`, `promote to issue`, `close with reason`, or `merge with existing`. Promoted items become GitHub issues with labels (`triage-promoted`, surface label, severity label) and the `TRIAGE.md` entry moves to `Promoted`.

### 20.4 The slot for stability work

Each student reserves **20% of their weekly time** for "stability tickets"... items from the promoted backlog that are outside their surface but inside their capability. This is the force that keeps the whole project ready for demo, not just five surfaces ready for their own demos.

## 21. TDD Harness — Red, Green, Refactor, Adversarial

Zachary directed strict TDD. This is the spec.

### 21.1 The rhythm

Every new feature, every new block, every new MCP tool follows this cycle:

1. **Red.** Write the failing test first. The test describes the desired behavior. No implementation code yet. Run the test. Watch it fail.
2. **Green.** Write the simplest implementation that makes the test pass. Not elegant. Not optimal. Simple.
3. **Refactor.** Clean up. Extract functions. Rename. Re-run tests. Still green.
4. **Adversarial.** Add one test that tries to break what you just wrote. Edge case, malformed input, race condition, security. If it fails, you have work. If it passes, commit.

No PR merges unless its commits visibly walk this cycle. The PR template asks explicitly.

### 21.2 Tooling

- **Vitest** — unit and integration testing. Fast, ESM-native, works with TypeScript out of the box.
- **Playwright** — end-to-end. One test per surface per week.
- **MSW (Mock Service Worker)** — mocks model providers and external MCP servers at the network layer.
- **Faker** — fixture generation.
- **Zod** — already in use for block schemas, double-duty as test validators.

### 21.3 Mandatory test surfaces

Per the Block Protocol contract (Section 5.5), every block ships five tests. Similarly, every MCP tool ships:

- A request-schema validation test.
- A response-schema validation test.
- A happy-path test.
- An error-path test.
- A timeout/retry test.

Every Canvas Runtime change ships:

- A scheduler invariants test (topo-sort correctness, cycle detection).
- An integration test running a real three-block canvas end-to-end.

### 21.4 Coverage target

Coverage is a secondary signal. We target 80% on `packages/core/`, 70% on surface packages, not because the numbers matter on their own but because they correlate with the TDD rhythm being honored. A PR with 40% coverage on new code is a signal the rhythm was skipped.

### 21.5 CI

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    env:
      IEM_MOCK_MODELS: "1"
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
      - run: pnpm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps chromium
      - run: pnpm e2e
```

Pre-commit: Husky runs `pnpm lint-staged` which runs Prettier and ESLint on staged files. Prevents broken formatting from entering review.

## 22. Code Review and Hardening Gates

Review is the final mentorship surface. Every PR is a teaching moment.

### 22.1 The review rubric

Four lenses, every PR, every time.

**Correctness.** Does it do what it claims? Tests back this up? Edge cases considered?

**Coherence.** Does it fit the architecture? Does it respect the four Invariants (Section 3.3)? Does it extend the right substrate? Does it introduce new concepts that need to be earned?

**Clarity.** Can a student who has never seen this code understand it in five minutes? Are names honest? Is the module boundary right?

**Craft.** Is the test rhythm visible in the commits? Are there TODOs left? Are any dependencies added justified? Is there dead code?

The reviewer leaves comments on every dimension that applies. A PR with zero comments is a sign the reviewer skimmed, not read.

### 22.2 The adversarial pass

Once a week, on a rotation, one student is the **Adversary**. For the week, their job is to look at every PR and try to find:

- A security hole (prompt injection, secret leak, SQL injection, XSS).
- A performance cliff (an O(n²) in a hot path, an N+1 query).
- A correctness subtlety (an off-by-one, a race, a silent failure).
- A user experience failure mode (what happens when the model is slow? when input is empty? when the user clicks twice?).

The Adversary files one adversarial comment per PR they review. The author responds either with a fix or with a reasoned "we accept this for now" that goes into a `docs/known-limitations.md`. Nothing hides.

This rotation teaches each student to think adversarially about their own work... which is the single most important engineering skill the capstone can leave them with.

### 22.3 The mentor's standing review

The mentor reviews every core-package PR and spot-reviews surface PRs. The mentor's comments tend toward: "have you considered...", "what happens when...", "is this abstraction earning its keep?", "read [link to relevant Balnce/architecture doc]."

Mentor comments are questions first, directives rarely.

---

# Part V — The Documentation Repo

Zachary's directive: **sources of knowledge and README at every key juncture point for disseminated knowledge throughout the project ensuring adherence to standards.** This Part specifies what that looks like.

## 23. README-at-Every-Juncture

Every directory that contains code or documentation gets a `README.md`. The rule is strict.

### 23.1 The template

Every such README follows this shape:

```markdown
# <Name>

<One paragraph: what lives here and why.>

## How to use this

<How a student or agent interacts with this directory.>

## Structure

<Brief map of the files/subdirectories.>

## Standards

<What patterns are enforced here. Link to the relevant spec in docs/.>

## Changelog

<Append-only. Date and one-line summary of each non-trivial change.>

## See also

<Links to related specs, adjacent packages, or upstream docs.>
```

### 23.2 The locations

Every one of these gets a README following the template:

- Root.
- `apps/web/`, `apps/server/`.
- Every `packages/*`.
- `packages/core/src/block/`, `.../agent/`, `.../canvas/`.
- Every surface package.
- `docs/`, `docs/specs/`, `docs/guides/`, `docs/adr/`, `docs/backlog/`.
- `.agent/`, `.agent/rules/`, `.agent/primers/`.
- `scripts/`.

The cost is front-loaded. The payoff is that every student, every agent, every faculty member who wanders into a directory lands on a page that tells them where they are and what's expected.

## 24. The Agent Primer System

This is the heart of Zachary's "the repo itself will re-orient and PRIME their agent." Every agent CLI, on first run in this repo, reads a handful of files and emerges oriented.

### 24.1 The top-level primer

`AGENTS.md` at the repo root is the single source of truth for agent orientation. `CLAUDE.md` is a symlink to it. (Cursor reads `.cursor/rules/`, so a small parallel file there also points to `AGENTS.md`.)

`AGENTS.md` structure:

```markdown
# Agent Primer — Imagination Engine

If you are an AI agent operating in this repository, read this file first.
Then read IEM-MASTER-00 in `docs/specs/IEM-MASTER-00-Capstone-Master-Plan.md`.
Then the rules in `.agent/rules/`.

## Your role

You are pairing with a UC Irvine capstone student on the Imagination Engine.
The student may be working on one of five surfaces. Orient yourself by asking
the student, or by reading their recent commits, which surface is theirs.

## The Four Invariants

[Copy the four invariants from Section 3.3 of IEM-MASTER-00.]

## The Block Protocol

[Copy the TypeScript interface from Section 5.2, with the sentence "every new
block must conform to this interface."]

## The triage rule

[Copy Section 20.2.]

## The TDD rhythm

[Copy Section 21.1.]

## The review rubric

[Copy Section 22.1.]

## What not to do

- Do not bypass the Block Protocol with a hardcoded node function.
- Do not call model providers directly from UI code; go through the Agent Runtime.
- Do not commit to `main` directly.
- Do not add a dependency without justifying it in the PR description.
- Do not leave TODO(critical) markers in merged code.
- Do not write code without writing the failing test first.

## When uncertain

If unsure about an architectural choice, check `docs/adr/` (Architecture
Decision Records) for prior decisions. If still unsure, leave a comment
`@mentor` in the relevant code, file a TRIAGE entry, and move on. Do not
guess your way into the core substrate.
```

### 24.2 The rule files

`.agent/rules/` contains focused directive files, one per cross-cutting concern:

- `triage.md` — the triage rule (Section 20.2).
- `tdd.md` — the TDD rhythm (Section 21.1).
- `review.md` — the review rubric (Section 22.1).
- `dependencies.md` — how to add a dependency (justify in PR, prefer existing, check bundle size).
- `security.md` — secrets, input validation, XSS/injection, CSP.
- `style.md` — code style (covered mostly by Prettier, but naming conventions, file organization).
- `block-protocol.md` — block creation checklist (Section 5.5's five tests).
- `mcp.md` — how to add an MCP tool binding.
- `surface-boundaries.md` — what belongs in core vs. a surface vs. an app.

Each rule file is short (under 500 lines, ideally under 200). Agents read them all at session start.

### 24.3 Per-surface primers

Each surface package has its own `AGENTS.md`:

```
packages/surface-playable/AGENTS.md
packages/surface-conductor/AGENTS.md
packages/surface-reel/AGENTS.md
packages/surface-forge/AGENTS.md
packages/surface-e/AGENTS.md
```

Each contains: the vision paragraph, what the surface extends, what it uniquely owns, the current milestone, the active tasks, the known blockers. An agent working in a surface reads this file first and knows exactly where the work is.

### 24.4 The Architecture Decision Record stream

`docs/adr/` captures architectural decisions as they happen. One file per decision. Format:

```markdown
# ADR 0001 — Keep React Flow, do not migrate to tldraw

Date: 2026-04-20
Status: Accepted
Deciders: mentor
Context: [why this question arose]
Decision: [what was decided]
Consequences: [what this implies, positive and negative]
```

ADRs are written in chronological order, never edited after accepted (supersede with a new ADR if needed). By end of capstone, there will be 15-30 ADRs. This is the forensic log faculty members will open first.

Starter ADRs the agentic engineering team should write on day one:

1. ADR 0001 — Keep React Flow.
2. ADR 0002 — PostgreSQL with Drizzle, not SurrealDB.
3. ADR 0003 — MCP-first agent layer, deprecate Autogen exploration.
4. ADR 0004 — pnpm workspaces monorepo.
5. ADR 0005 — TDD mandatory on all new code.
6. ADR 0006 — Vercel AI SDK for chat primitives.
7. ADR 0007 — Yjs for presence (not Liveblocks).
8. ADR 0008 — Per-surface packages owned by individual students.
9. ADR 0009 — TRIAGE.md as append-only backlog.
10. ADR 0010 — Custom Agent as Block (not as separate entity).

## 25. Semantic Document Map

The full doc tree, populated:

```
docs/
├── README.md                       # "Start here"
├── specs/
│   ├── IEM-MASTER-00-Capstone-Master-Plan.md  # this document
│   ├── IEM-ARCH-01-Architecture-Overview.md
│   ├── IEM-BLOCK-02-Block-Protocol.md
│   ├── IEM-AGENT-03-Agent-Runtime.md
│   ├── IEM-CANVAS-04-Canvas-Runtime.md
│   ├── IEM-CHAT-05-Chat-Shell.md
│   ├── IEM-DRAWER-06-Creations-Drawer.md
│   ├── IEM-CUSTOM-07-Custom-Agent-Flow.md
│   ├── IEM-DATA-08-Data-Model.md
│   ├── IEM-SURFACE-A-Playable.md
│   ├── IEM-SURFACE-B-Conductor.md
│   ├── IEM-SURFACE-C-Reel.md
│   ├── IEM-SURFACE-D-Forge.md
│   └── IEM-SURFACE-E-Open.md
├── guides/
│   ├── 01-getting-started.md
│   ├── 02-your-first-block.md
│   ├── 03-your-first-mcp-tool.md
│   ├── 04-tdd-walkthrough.md
│   ├── 05-opening-a-pr.md
│   ├── 06-resolving-a-rebase.md
│   ├── 07-using-your-agent-cli.md
│   ├── 08-debugging-the-scheduler.md
│   └── 09-writing-an-adr.md
├── adr/
│   ├── 0001-keep-react-flow.md
│   ├── 0002-postgres-with-drizzle.md
│   └── ...
├── backlog/
│   ├── TRIAGE.md               # the live triage doc
│   └── promoted/               # archived entries by week
└── demo/
    ├── DEMO-PLAN.md            # the master demo script
    ├── surface-a-demo.md
    ├── surface-b-demo.md
    ├── surface-c-demo.md
    ├── surface-d-demo.md
    ├── surface-e-demo.md
    └── faculty-brief.md        # see Section 28
```

The agentic engineering team's first deliverable after this master plan is the spec set in `docs/specs/`. The guides are progressive and written once features are in place. ADRs accrue with every decision. The demo plan finalizes in week 13.

---

# Part VI — The Demo

## 26. The Target Demo Experience

The user, faculty, or investor lands on the deployed web app. Within two minutes of arriving, they should have seen:

1. A beautiful, brand-sharp landing page with a clear "Sign Up" and "Try Demo" CTA.
2. A signup flow that is unremarkable in its smoothness.
3. An onboarding carousel that takes 20 seconds and feels like a cool intro trailer.
4. A Chat Shell where typing "I want to make a game where my friends and I collect stars" generates a canvas with real blocks.
5. A toggle to Canvas view that shows the blocks arranged sensibly.
6. A launch button that takes a Creation from the drawer to a full-edge experience.
7. The words "and this is the same engine for games, workflows, anime, apps, and more" on screen somewhere at the right moment.

The emotional arc: curiosity → delight → "wait, what?" → "oh, this is bigger than I thought."

## 27. Per-Student Demo Scripts

Demo day is 25 minutes. Five students, each gets four minutes onstage. Five minutes for mentor framing and Q&A.

Each student's script is authored per Sections 12.5, 13.5, 14.5, 15.5, and 16 (once E is defined). The full scripts live in `docs/demo/surface-*-demo.md`. A script is specific down to the words spoken, the prompt typed, and the buttons clicked.

Every script is rehearsed three times before demo day. The third rehearsal is timed and filmed. The film is reviewed by the mentor, who notes where the demo is dragging or where a magical moment is being underplayed.

## 28. Faculty Presentation Framing

The mentor opens the demo with two minutes of framing. The framing sets up the surprise the students will deliver.

Suggested opening beats:

**Beat 1 — The conventional expectation.** "This is a capstone. We expected five students to build one thing together. A chat app maybe, or a small tool. That is not what they did."

**Beat 2 — The reframe.** "They built one engine. With five expressions. A game studio. A workflow conductor. An anime studio. A software forge. And a [Student E's surface]. Different products. Same substrate."

**Beat 3 — The stakes.** "What you are about to see would normally take a six-person team sixteen months. They did it in six weeks. Not because they are superhuman. Because of how we organized the work."

**Beat 4 — The setup for the first demo.** "Student A is going to show you a game built on a canvas. Watch for the moment when a second browser joins live. That moment is presence. Presence was built into the core substrate, which means every other student's surface inherits it for free. You will see that inheritance in action across the next four demos."

The mentor does not have to pitch Balnce here. The engine pitches itself. The _architectural restraint_ is what impresses faculty... they have seen flashy demos. They have not seen undergraduate teams with this level of architectural coherence.

`docs/demo/faculty-brief.md` is a one-pager distributed to faculty before demo day with:

- A paragraph on the project.
- The four invariants written in plain English.
- A diagram of the five surfaces extending core.
- The team roster with each student's surface and contribution.
- Links to the live deployment and the repo.

## 29. Beyond the Capstone

Two tracks for after demo day:

**Track one — the students.** Each of the five students graduates with a project they can show in interviews that will materially move their careers. The surface they own is theirs intellectually forever. The letter of reference from the mentor is specific about what they built and how.

**Track two — the engine.** If even one or two students want to continue, the engine can become a real open-source project. The architecture is sound. The documentation is strong. The community affordance (AGENTS.md, ADRs, clean monorepo) means outside contributors could contribute meaningfully within an hour. Anthropic, fal.ai, Replicate, Ollama, Vercel all have interest in projects like this... credits, speaking slots, amplification.

The mentor retains a separate conversation with the students who opt into track two, and that conversation is its own artifact.

The architecture mirrors Balnce enough that the best students might, with care and consent, have a path to contribute to the sovereign project proper. This is not promised, not dangled, not hinted. It is quietly true, and the few students who earn it will discover it organically.

---

# Appendices

## Appendix A — Dependency Inventory and Upgrade List

### A.1 Dependencies to keep

| Current           | Use               | Verdict                                    |
| ----------------- | ----------------- | ------------------------------------------ |
| React 18+         | UI                | Keep                                       |
| Vite              | Dev server, build | Keep                                       |
| TypeScript 5+     | Language          | Keep                                       |
| Tailwind CSS      | Styling           | Keep                                       |
| React Flow        | Canvas            | Keep                                       |
| React Router      | Routing           | Keep, may migrate to TanStack Router later |
| Express           | Backend           | Keep                                       |
| PostgreSQL        | DB                | Keep                                       |
| bcrypt            | Passwords         | Keep                                       |
| jsonwebtoken      | JWT auth          | Keep                                       |
| Ollama (service)  | Local LLM         | Keep                                       |
| Google Gemini SDK | Cloud LLM         | Keep                                       |

### A.2 Dependencies to add

| Package                         | Use                    | Why                          |
| ------------------------------- | ---------------------- | ---------------------------- |
| `pnpm`                          | Package manager        | Monorepo-friendly, fast      |
| `turbo`                         | Build pipeline         | Caching, parallel builds     |
| `drizzle-orm` + `drizzle-kit`   | ORM                    | Type-safe, TypeScript-native |
| `@modelcontextprotocol/sdk`     | MCP client/server      | The substrate                |
| `zod`                           | Schema validation      | Block Protocol depends on it |
| `ai` (Vercel AI SDK)            | Chat streaming         | Chat Shell                   |
| `shadcn/ui` components (copied) | UI kit                 | Clean, owned, themeable      |
| `yjs` + `y-websocket`           | Presence (CRDT)        | Surface A foundation         |
| `pgvector`                      | Vector search          | Custom Agent context         |
| `vitest`                        | Unit/integration tests | Modern, fast                 |
| `@playwright/test`              | E2E tests              | Demo-day confidence          |
| `msw`                           | Network mocking        | CI hermeticity               |
| `husky` + `lint-staged`         | Pre-commit hooks       | Prevents bad commits         |
| `prettier` + `eslint`           | Formatting/linting     | Team consistency             |
| `@faker-js/faker`               | Test fixtures          | TDD support                  |
| `react-markdown` + `remark-gfm` | Chat rendering         | Markdown in chat             |
| `embla-carousel-react`          | Onboarding             | Lightweight, accessible      |

### A.3 Dependencies to consider removing or archiving

| Package                    | Current use       | Action                                                                                      |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| Microsoft Autogen (Python) | Agent exploration | Archive in `autogen_exploration/` with a README explaining what was learned. Do not extend. |

### A.4 Stretch: Electrobun bundle

Electrobun as a secondary build target is a stretch goal for week 14 if all five surfaces are green. The Electrobun wrapper would:

- Bundle the web frontend.
- Embed a local Node.js backend.
- Bundle Postgres via a minimal embedded driver (or require a running Postgres, documented).
- Ship as a signed macOS .app and a signed Windows .exe.

The work is meaningful but contained. If week 14 does not have the capacity, ship deployed (Vercel + Railway) only; Electrobun can be a post-demo deliverable.

## Appendix B — MCP Primer for the Team

Zachary noted that the team found the block-as-MCP-agent concept difficult. This appendix is a from-zero explanation. It may be used as-is as `docs/guides/03-your-first-mcp-tool.md`.

### B.1 The mental model

Think of MCP as USB-C for agents. Before USB-C, every device had its own cable. Every charger had its own plug. You needed adapters. With USB-C, a phone can charge from a laptop, a laptop can charge from a battery, a battery can charge from a monitor. One cable. Many roles.

MCP is that, for tools and models. Before MCP, every AI framework had its own way of calling tools. LangChain tools. OpenAI function calling. Gemini function calling. Autogen tools. To make a tool work in three frameworks, you wrote it three times. With MCP, you write the tool once as an MCP "server." Any MCP "client" (Claude Desktop, Cursor, your app, another agent) can use it. One format. Many callers.

### B.2 What an MCP server looks like

An MCP server declares tools. Each tool has a name, a description, an input schema (JSON Schema / Zod), and a handler function. That's it.

A block in our Imagination Engine is the UI embodiment of one MCP tool. The block renders on the canvas. When the user hits "Run" (or the scheduler runs it), the block invokes its underlying MCP tool. The tool does the work. The result flows back up.

### B.3 What "the canvas is an MCP server" means

The Canvas itself is also an MCP server. Its tools are `addBlock`, `connect`, `run`, `describe`, etc. An external agent can _talk to the canvas_ through MCP. It can look at the canvas, understand its graph, add blocks, wire them up, run them.

This means: the Chat Shell's assistant, when it "generates a canvas," is actually just calling MCP tools on the Canvas. The canvas isn't special; it's an MCP client and server, exchanging tool calls with the chat's agent.

This also means: another Imagination Engine instance (on another user's machine) could talk to your canvas through MCP. Collaboration, federation, and multi-canvas workflows all fall out for free.

### B.4 The beautiful recursion

- A block is an MCP tool.
- A canvas is an MCP server that exposes block-tools and canvas-tools.
- A canvas can be inside a block (via the holonic invariant).
- Therefore, a canvas inside a block is an MCP server inside an MCP tool... which is itself an MCP tool from the outer canvas's point of view.

This is what Zachary means when he says the concept is "difficult." It is difficult. It is also the most beautiful idea in the engine, and the thing that makes the five surfaces compose.

Read this appendix three times before writing your first block.

## Appendix C — The Block-Agent-Canvas Recursion, Explained Three Ways

For students who learn by different routes.

### C.1 Told as a story

There was a canvas. On the canvas sat a block. The block was not a lump of code, it was a little agent with a purpose. "Summarize text," it said. An arrow ran from it to another block. "Translate to French," that one said.

A user typed in the chat: "Summarize this article and give me the French version."

The chat's assistant, which was itself an agent, looked at the canvas. It saw the two blocks already there. It said, "These will do. I'll pipe the article through both." It wired them up. It ran them.

But also: a second user, on another machine, could look at the same canvas through MCP and see the same two blocks. They could add a third. They could run it differently.

And: the summarize block itself? If you looked inside it, it wasn't one thing. It was a tiny canvas of its own. A read-input block, an LLM-call block, a format-output block. All working together inside the summarize agent.

Everything, everywhere, was a canvas. Everything on a canvas was an agent. Every agent could be cracked open and found to be another canvas. It was canvases all the way down.

### C.2 Told as math

Let $\mathcal{C}$ be the set of canvases. Let $\mathcal{B}$ be the set of blocks. Let $\mathcal{A}$ be the set of agents exposed via MCP.

Claim: $\mathcal{C} \cong \mathcal{B} \cong \mathcal{A}$ under an appropriate morphism.

- Every $b \in \mathcal{B}$ has an injection into $\mathcal{A}$ (the block's agent binding).
- Every $c \in \mathcal{C}$ has an injection into $\mathcal{A}$ (the canvas's own MCP server).
- Every $a \in \mathcal{A}$ has an injection back into $\mathcal{B}$ (wrap as a block) or into $\mathcal{C}$ (open as a canvas).

The isomorphism is not strict (some MCP tools are leaves, not canvases) but the recursion is real. A block can be a canvas. A canvas can be a block. The composition relation is closed under both.

This closure is the structural reason the five surfaces compose without friction.

### C.3 Told as code

```typescript
// A block is an MCP tool:
const refinerBlock: BlockDefinition = {
  id: 'iem.core.refiner',
  agent: { kind: 'local', toolName: 'refine_text', invoke: refineText },
  // ...
}

// A canvas is an MCP server that exposes its blocks AND its own tools:
class CanvasMCPServer {
  tools() {
    return [
      ...blockRegistry.list().map((b) => toMCPToolDescriptor(b)),
      { name: 'canvas.addBlock', ... },
      { name: 'canvas.connect', ... },
      { name: 'canvas.run', ... },
    ]
  }
}

// A canvas can be wrapped as a block in a larger canvas:
const mySubCanvasBlock: BlockDefinition = {
  id: 'iem.user.my-summarizer-workflow',
  agent: {
    kind: 'remote',
    serverUrl: 'http://localhost:3001/canvas/abc123/mcp',
    toolName: 'canvas.run',
  },
  // ...
}
```

All three tellings describe the same thing. Pick the one that lands.

## Appendix D — The Five-Step Discovery Method, Applied

When any agent or student faces a technical ambiguity in this project, they apply this method before writing code.

1. **Identify the purpose.** What is the user trying to accomplish? State it in one sentence without jargon.
2. **Search by behavioral signature.** Grep the repo for similar behavior that already exists. `git grep -i "scheduler"`. `git grep "MCPToolBinding"`. Do not write new code for a job the repo already does.
3. **Verify against the Grounding Truth.** The Grounding Truth is Sections 3 and 5 of this document: the Four Invariants and the Block Protocol. Does the proposed change respect them?
4. **Trace the dependency chain.** What packages are affected? What tests? What docs? If an ADR needs to change, note it.
5. **Debate the first instinct.** Ask three forcing questions:
   - Is there a simpler approach?
   - What am I assuming that might not be true?
   - Who else on the team is affected, and have I told them?

If the first instinct survives all three questions, proceed. If not, iterate before committing code.

## Appendix E — Glossary

- **Block.** A unit of capability on the canvas. Implements `BlockDefinition`. Wraps an MCP tool.
- **Canvas.** A holonic surface hosting blocks. Exposes its own MCP server. Has a Chat counterpart.
- **Chat Shell.** The conversation-first entry view of the app.
- **Creation.** A committed Session that appears in the drawer as a launchable artifact.
- **Custom Agent.** A user-authored block template with story, persona, skills, context, capabilities, purpose.
- **IEM.** Imagination Engine Master. The identifier prefix for documents in this series.
- **MCP.** Model Context Protocol. The tool-call interoperability standard.
- **Session.** The continuity object binding a chat conversation and a canvas as two views of one thing.
- **Surface.** A per-student package that extends one or more core substrate capabilities (playable, conductor, reel, forge, and the open slot).
- **Substrate.** The shared core (`packages/core`) every surface builds on.
- **Triage.** The append-only backlog at `docs/backlog/TRIAGE.md`.

---

## Closing

Five students. Six weeks. One engine that will feel, when it is finished, like it had no right to exist on a capstone budget.

The architecture is small. The documentation is strict. The agent tooling is teaching itself. The students are building one thing by building five different things.

When they demo, the engine will demo itself. The question is not whether faculty will understand. The question is how long the silence lasts before the first clap.

Own your imagination.

— IEM-MASTER-00. Canonical.
