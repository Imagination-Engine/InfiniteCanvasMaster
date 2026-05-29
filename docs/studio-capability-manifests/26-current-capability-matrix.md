# Current Capability Matrix

> Generated: 2026-05-18 | Track: `studio_capability_discovery_20260504`

## Summary

| Source                                                         | Block Count |
| -------------------------------------------------------------- | ----------- |
| `packages/core/src/block/registry.ts` (inline `createBlock`)   | 87          |
| `packages/surface-reel/src/blocks/mediaBlocks.ts`              | 12          |
| `packages/surface-conductor/src/blocks/orchestrationBlocks.ts` | 14          |
| `packages/surface-atlas/src/blocks/knowledgeBlocks.ts`         | 12          |
| `packages/surface-playable/src/blocks/gameBlocks.ts`           | 15          |
| `packages/surface-scribe/src/blocks/` (7 typed blocks)         | 7           |
| `packages/surface-forge/src/blocks/roleBlocks.ts`              | 4           |
| `packages/core/src/blocks/creative/` (9 blocks)                | 9           |
| **Total unique block definitions**                             | **~160**    |

> **Note:** Many surface-specific blocks duplicate IDs registered in the core registry (e.g. `iem.reel.camera` exists in both `registry.ts` and `mediaBlocks.ts`). The core registry holds 87 `createBlock` calls; surface packages add ~73 more, though ~20 are duplicate registrations. **Effective unique blocks: ~140.**

---

## Core Registry Blocks (`registry.ts` — 87 blocks)

### Intent & Planning (10 blocks)

| Block ID                 | Name                   | Studio | Runtime  | Accepts | Produces | Agentic | demoMode | Risk |
| ------------------------ | ---------------------- | ------ | -------- | ------- | -------- | ------- | -------- | ---- |
| `iem.intent.intent`      | Intent Block           | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.goal`        | Goal Block             | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.task`        | Task Block             | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.milestone`   | Milestone Block        | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.requirement` | Requirement Block      | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.decision`    | Decision Block         | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.constraint`  | Constraint Block       | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.checkpoint`  | Human Checkpoint Block | —      | sandbox  | []      | []       | ✗       | ✗        | Med  |
| `iem.intent.timeline`    | Timeline Block         | —      | document | []      | []       | ✗       | ✗        | Low  |
| `iem.intent.plan`        | Plan / DAG Block       | —      | document | []      | []       | ✗       | ✗        | Low  |

### Agents & Swarms (15 blocks)

| Block ID                      | Name                   | Studio              | Runtime | Agentic | Risk |
| ----------------------------- | ---------------------- | ------------------- | ------- | ------- | ---- |
| `iem.agent.agent`             | Agent Block            | Agent Studio        | agent   | ✓       | Med  |
| `iem.agent.blank`             | Blank Agent Template   | Agent Studio        | agent   | ✓       | Low  |
| `iem.agent.mastra`            | Mastra Workflow Block  | Automation Studio   | sandbox | ✓       | High |
| `iem.agent.supervisor`        | Supervisor Agent Block | Agent Studio        | agent   | ✓       | Med  |
| `iem.agent.swarm`             | Agent Swarm Block      | Agent Studio        | sandbox | ✓       | High |
| `iem.agent.imagiclaw`         | ImagiClaw Agent        | Agent Studio        | agent   | ✓       | High |
| `iem.agent.imagiclaw-sandbox` | ImagiClaw Sandbox      | Automation Studio   | sandbox | ✓       | High |
| `iem.agent.imagiclaw-swarm`   | ImagiClaw Swarm        | Agent Studio        | sandbox | ✓       | High |
| `iem.agent.tool-runner`       | Tool Runner Block      | —                   | sandbox | ✓       | Med  |
| `iem.agent.mcp`               | MCP Tool Block         | —                   | app     | ✗       | Med  |
| `iem.agent.router`            | Model Router Block     | —                   | sandbox | ✗       | Med  |
| `iem.agent.researcher`        | Research Agent Block   | Research Studio     | agent   | ✓       | Med  |
| `iem.agent.builder`           | Builder Agent Block    | Agent Studio        | agent   | ✓       | Med  |
| `iem.agent.code`              | Code Agent Block       | App Creation Studio | agent   | ✓       | Med  |
| `iem.agent.operator`          | Operator Agent Block   | Automation Studio   | agent   | ✓       | High |

### Chat & Communication (10 blocks)

| Block ID                | Name                     | Studio | Runtime  | Agentic | Risk |
| ----------------------- | ------------------------ | ------ | -------- | ------- | ---- |
| `iem.chat.chat`         | Block Chat               | —      | app      | ✗       | Low  |
| `iem.chat.multi`        | Multi-Agent Room         | —      | app      | ✗       | Med  |
| `iem.chat.interview`    | User Interview Block     | —      | agent    | ✓       | Low  |
| `iem.chat.approval`     | Approval Queue Block     | —      | app      | ✗       | Low  |
| `iem.chat.inbox`        | Inbox Block              | —      | app      | ✗       | Low  |
| `iem.chat.comment`      | Comment Thread Block     | —      | document | ✗       | Low  |
| `iem.chat.voice`        | Voice Note Block         | —      | media    | ✗       | Low  |
| `iem.chat.notification` | Notification Block       | —      | app      | ✗       | Low  |
| `iem.chat.feed`         | Agent Status Feed        | —      | app      | ✗       | Low  |
| `iem.chat.orchestrator` | Canvas Orchestrator Chat | —      | app      | ✓       | Med  |

### Text & Knowledge (11 blocks)

| Block ID              | Name                    | Studio           | Runtime  | Risk |
| --------------------- | ----------------------- | ---------------- | -------- | ---- |
| `iem.text.note`       | Note Block              | —                | document | Low  |
| `iem.text.rich`       | Rich Document Block     | —                | document | Low  |
| `iem.text.markdown`   | Markdown Block          | —                | document | Low  |
| `iem.text.table`      | Table Block             | —                | document | Low  |
| `iem.text.checklist`  | Checklist Block         | —                | document | Low  |
| `iem.text.code`       | Code Block              | —                | document | Low  |
| `iem.text.prompt`     | Prompt Block            | —                | document | Low  |
| `iem.text.citation`   | Source / Citation Block | —                | document | Low  |
| `iem.text.knowledge`  | Knowledge Card Block    | Knowledge Studio | document | Low  |
| `iem.text.transcript` | Transcript Block        | —                | document | Low  |
| `iem.text.brief`      | Research Brief Block    | Research Studio  | document | Low  |

### Generative Media (11 blocks)

| Block ID               | Name                  | Studio       | Runtime   | Agentic | Risk |
| ---------------------- | --------------------- | ------------ | --------- | ------- | ---- |
| `iem.media.image-gen`  | Image Generator Block | Media Studio | generator | ✓       | Med  |
| `iem.media.image-edit` | Image Editor Block    | Media Studio | app       | ✗       | Med  |
| `iem.media.video-gen`  | Video Generator Block | Video Studio | generator | ✓       | Med  |
| `iem.media.video-edit` | Video Editor Block    | Video Studio | app       | ✗       | Med  |
| `iem.media.audio-gen`  | Audio Generator Block | Media Studio | generator | ✓       | Med  |
| `iem.media.voice`      | Voice / TTS Block     | Media Studio | generator | ✓       | Med  |
| `iem.media.music`      | Music Block           | Media Studio | generator | ✓       | Med  |
| `iem.media.3d`         | 3D Asset Block        | Game Studio  | media     | ✗       | High |
| `iem.media.storyboard` | Storyboard Block      | Video Studio | document  | ✗       | Low  |
| `iem.media.creative`   | Brand Creative Block  | Brand Studio | document  | ✗       | Low  |
| `iem.media.board`      | Media Asset Board     | Media Studio | document  | ✗       | Low  |

### Studios (12 blocks)

| Block ID                | Name                 | Studio              | Runtime | Risk |
| ----------------------- | -------------------- | ------------------- | ------- | ---- |
| `iem.studio.video`      | Video Studio         | Video Studio        | studio  | Med  |
| `iem.studio.game`       | Game Studio          | Game Studio         | studio  | Med  |
| `iem.studio.app`        | App Creation Studio  | App Creation Studio | studio  | Med  |
| `iem.studio.writer`     | Writer's Studio      | Writer's Studio     | studio  | Med  |
| `iem.studio.launch`     | Launch Studio        | Launch Studio       | studio  | Med  |
| `iem.studio.research`   | Research Studio      | Research Studio     | studio  | Med  |
| `iem.studio.commerce`   | Commerce Studio      | Commerce Studio     | studio  | Med  |
| `iem.studio.knowledge`  | Knowledge Studio     | Knowledge Studio    | studio  | Med  |
| `iem.studio.automation` | Automation Studio    | Automation Studio   | studio  | Med  |
| `iem.studio.brand`      | Brand Studio         | Brand Studio        | studio  | Med  |
| `iem.studio.saas`       | SaaS Builder Studio  | App Creation Studio | studio  | Med  |
| `iem.studio.world`      | World Builder Studio | Game Studio         | studio  | Med  |

### Runtime & Apps (12 blocks)

| Block ID                 | Name                 | Studio              | Runtime | Risk |
| ------------------------ | -------------------- | ------------------- | ------- | ---- |
| `iem.app.iframe`         | Iframe Block         | —                   | app     | Low  |
| `iem.app.web`            | Web App Block        | —                   | app     | Low  |
| `iem.app.game`           | Game Runtime Block   | Game Studio         | app     | Med  |
| `iem.app.simulation`     | Simulation Block     | —                   | app     | Med  |
| `iem.app.terminal`       | Terminal Block       | —                   | app     | Med  |
| `iem.app.browser`        | Browser Block        | —                   | app     | Med  |
| `iem.app.api`            | API Tester Block     | —                   | app     | Low  |
| `iem.app.db`             | Database View Block  | —                   | app     | Low  |
| `iem.app.dashboard`      | Dashboard Block      | —                   | app     | Low  |
| `iem.app.files`          | File Workspace Block | —                   | app     | Low  |
| `iem.app.code-workspace` | Code Workspace Block | App Creation Studio | app     | Med  |
| `iem.app.preview`        | Live Preview Block   | —                   | app     | Low  |

### Commerce & Intentcasting (11 blocks)

| Block ID                      | Name                     | Studio          | Runtime  | demoMode | Risk |
| ----------------------------- | ------------------------ | --------------- | -------- | -------- | ---- |
| `iem.commerce.wallet`         | Wallet Block             | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.checkout`       | Checkout Block           | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.payment`        | Payment Flow Block       | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.offer`          | Offer Block              | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.intentcast`     | Intentcasting Block      | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.brand-response` | Brand Response Block     | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.negotiation`    | Negotiation Block        | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.storefront`     | Storefront Block         | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.product`        | Product Block            | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.digital-asset`  | Digital Asset Sale Block | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.creator`        | Creator Commerce Block   | Commerce Studio | commerce | ✓        | Low  |
| `iem.commerce.cart`           | Sovereign Cart Block     | Commerce Studio | commerce | ✓        | Low  |

### Files & Data (10 blocks)

| Block ID              | Name                            | Studio           | Runtime  | Risk |
| --------------------- | ------------------------------- | ---------------- | -------- | ---- |
| `iem.data.file`       | File Block                      | —                | document | Low  |
| `iem.data.dropzone`   | Upload Dropzone Block           | —                | app      | Low  |
| `iem.data.dataset`    | Dataset Block                   | —                | document | Low  |
| `iem.data.csv`        | CSV/Table Import Block          | —                | app      | Low  |
| `iem.data.pod`        | Knowledge Pod Block             | Knowledge Studio | app      | Med  |
| `iem.data.stream`     | Research Stream Block           | Research Studio  | app      | Med  |
| `iem.data.cluster`    | Memory Cluster Block            | Knowledge Studio | document | Low  |
| `iem.data.artifact`   | Artifact Block                  | —                | document | Low  |
| `iem.data.provenance` | Provenance / Origin Trail Block | —                | document | Low  |
| `iem.data.view`       | Data View Block                 | —                | app      | Low  |

### System & Utility (10 blocks)

| Block ID               | Name                  | Studio | Runtime | Risk |
| ---------------------- | --------------------- | ------ | ------- | ---- |
| `iem.sys.timer`        | Timer Block           | —      | app     | Low  |
| `iem.sys.monitor`      | Status Monitor Block  | —      | app     | Low  |
| `iem.sys.settings`     | Settings Block        | —      | app     | Low  |
| `iem.sys.env`          | Environment Block     | —      | app     | Low  |
| `iem.sys.trace`        | Debug Trace Block     | —      | app     | Low  |
| `iem.sys.log`          | Workflow Log Block    | —      | app     | Low  |
| `iem.sys.event-stream` | Event Stream Block    | —      | app     | Low  |
| `iem.sys.compiler`     | Output Compiler Block | —      | sandbox | Med  |
| `iem.sys.runner`       | Canvas Runner Block   | —      | sandbox | Med  |
| `iem.sys.export`       | Export Block          | —      | app     | Low  |

---

## Surface-Specific Blocks (outside core registry)

### Surface Reel — `mediaBlocks.ts` (12 blocks)

| Block ID                | Name           | Has Typed I/O | Has Real Agent Logic    | Risk |
| ----------------------- | -------------- | ------------- | ----------------------- | ---- |
| `iem.reel.timeline`     | Timeline       | ✓             | Mock                    | Low  |
| `iem.reel.export`       | Export         | ✓             | Mock                    | Low  |
| `iem.reel.scene`        | Scene          | ✓             | Semi-real               | Med  |
| `iem.reel.character`    | Character      | ✓             | Real (NanoBanana API)   | Med  |
| `iem.reel.dialogue`     | Dialogue       | ✓             | Mock                    | Low  |
| `iem.reel.camera`       | Camera         | ✓             | Mock                    | Low  |
| `iem.reel.lighting`     | Lighting       | ✓             | Mock                    | Low  |
| `iem.reel.transition`   | Transition     | ✓             | Mock                    | Low  |
| `iem.reel.vfx`          | VFX            | ✓             | Mock                    | Low  |
| `iem.reel.audioTrack`   | Audio Track    | ✓             | Mock                    | Low  |
| `iem.reel.textToImage`  | Text to Image  | ✓             | Real (Gemini image API) | Med  |
| `iem.reel.textToSpeech` | Text to Speech | ✓             | Real (ElevenLabs API)   | Med  |

### Studios — video forge

| Block ID           | Name         | Has Typed I/O | Implementation                                                          | Risk |
| ------------------ | ------------ | ------------- | ----------------------------------------------------------------------- | ---- |
| `iem.studio.video` | Video Studio | ✓             | Real (Veo 3.1 via `/api/reel/generate-video`, up to 3 reference images) | Med  |

### Surface Conductor — `orchestrationBlocks.ts` (14 blocks)

| Block ID                      | Name               | Has Typed I/O | Risk |
| ----------------------------- | ------------------ | ------------- | ---- |
| `iem.conductor.if`            | If                 | ✓             | Low  |
| `iem.conductor.foreach`       | For Each           | ✓             | Low  |
| `iem.conductor.webhook`       | Webhook Trigger    | ✓             | Med  |
| `iem.conductor.schedule`      | Schedule Trigger   | ✓             | Med  |
| `iem.conductor.saas`          | SaaS Integration   | ✓             | Med  |
| `iem.conductor.agent`         | Sub-Agent          | ✓             | Med  |
| `iem.conductor.router`        | Router             | ✓             | Low  |
| `iem.conductor.delay`         | Delay              | ✓             | Low  |
| `iem.conductor.state`         | State              | ✓             | Low  |
| `iem.conductor.errorBoundary` | Error Boundary     | ✓             | Med  |
| `iem.conductor.subGraph`      | Sub-Graph          | ✓             | Med  |
| `iem.conductor.webFetch`      | Web Fetch          | ✓             | Low  |
| `iem.conductor.slackPost`     | Slack Post         | ✓             | Med  |
| `iem.conductor.notionCreate`  | Notion Create Card | ✓             | Med  |

### Surface Atlas — `knowledgeBlocks.ts` (12 blocks)

| Block ID                   | Name            | Has Real Logic        | Risk |
| -------------------------- | --------------- | --------------------- | ---- |
| `iem.atlas.ingestion`      | Ingestion       | Partial (fetch stubs) | Med  |
| `iem.atlas.retrieval`      | Retrieval       | Partial (fetch stubs) | Med  |
| `iem.atlas.synthesis`      | Synthesis       | Real (agentRuntime)   | Med  |
| `iem.atlas.documentLoader` | Document Loader | Mock                  | Low  |
| `iem.atlas.chunker`        | Chunker         | Real (local algo)     | Low  |
| `iem.atlas.vectorSearch`   | Vector Search   | Mock                  | Low  |
| `iem.atlas.graphKnowledge` | Graph Knowledge | Mock                  | Med  |
| `iem.atlas.indexer`        | Indexer         | Mock                  | Low  |
| `iem.atlas.query`          | Query           | Mock                  | Low  |
| `iem.atlas.embed`          | Embed           | Mock                  | Low  |
| `iem.atlas.upsert`         | Upsert          | Mock                  | Low  |
| `iem.atlas.semanticRouter` | Semantic Router | Mock                  | Low  |

### Surface Playable — `gameBlocks.ts` (15 blocks)

| Block ID                 | Name           | Risk |
| ------------------------ | -------------- | ---- |
| `iem.game.joystick`      | Joystick       | Low  |
| `iem.game.collider`      | Collider       | Low  |
| `iem.game.score`         | Score          | Low  |
| `iem.game.spawner`       | Spawner        | Low  |
| `iem.game.timer`         | Timer          | Low  |
| `iem.game.camera`        | Camera         | Low  |
| `iem.game.lighting`      | Lighting       | Low  |
| `iem.game.audio`         | Audio          | Low  |
| `iem.game.particle`      | Particle       | Low  |
| `iem.game.sprite`        | Sprite         | Low  |
| `iem.game.physicsEntity` | Physics Entity | Low  |
| `iem.game.input`         | Input          | Low  |
| `iem.game.rule`          | Rule           | Low  |
| `iem.game.scene`         | Scene          | Low  |
| `iem.game.character`     | Character      | Low  |

### Surface Scribe (7 typed blocks)

| Block ID                      | Name              | Risk |
| ----------------------------- | ----------------- | ---- |
| `iem.scribe.prose`            | Prose             | Low  |
| `iem.scribe.chapter`          | Chapter           | Low  |
| `iem.scribe.characterProfile` | Character Profile | Low  |
| `iem.scribe.worldLore`        | World Lore        | Low  |
| `iem.scribe.dialogueTree`     | Dialogue Tree     | Low  |
| `iem.scribe.proofreader`      | Proofreader       | Low  |
| `iem.scribe.editor`           | Editor            | Low  |

### Surface Forge — `roleBlocks.ts` (4 blocks)

| Block ID              | Name      | Risk |
| --------------------- | --------- | ---- |
| `iem.forge.architect` | Architect | Low  |
| `iem.forge.designer`  | Designer  | Low  |
| `iem.forge.builder`   | Builder   | Low  |
| `iem.forge.tester`    | Tester    | Low  |

### Core Creative Blocks (9 blocks)

| File              | Block         |
| ----------------- | ------------- |
| `refiner.ts`      | Refiner       |
| `summarizer.ts`   | Summarizer    |
| `translator.ts`   | Translator    |
| `colorSwapper.ts` | Color Swapper |
| `filter.ts`       | Filter        |
| `webScraper.ts`   | Web Scraper   |
| `formatter.ts`    | Formatter     |
| `programmer.ts`   | Programmer    |
| `fileUpload.ts`   | File Upload   |

---

## Key Observations

1. **No `accepts`/`produces` data on core registry blocks.** All 87 inline blocks default to `[]`. This is the primary gap.
2. **No `studioAffinity` field exists.** The current `studio?: string` field is loosely typed — no formal binding.
3. **No `toolMountIds` field exists.** Blocks have an `agent: MCPToolBinding` but no formal mount registry.
4. **No `fabricLanes` field exists.** Message bus lanes are not declared per-block.
5. **No `securityClass` field exists.** Sandbox isolation is implicit, not declared.
6. **Surface blocks use ad-hoc categories** (e.g. `"media"`, `"control"`, `"knowledge"`) that don't match the core registry's formal category union.
7. **Duplicate block IDs** across core registry and surface packages — no dedup mechanism.
8. **`@ts-nocheck` on core files** — disables all TypeScript safety on `protocol.ts` and `registry.ts`.
