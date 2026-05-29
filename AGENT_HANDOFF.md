# 🤖 AGENT HANDOFF — Imagination Canvas Beta Test & Surface Conductor Bug Fixing

> **READ THIS ENTIRE DOCUMENT BEFORE TAKING ANY ACTION.**
> You are continuing work from a previous agent session. This document is your complete briefing. Follow it top to bottom.

---

## 1. WHO YOU ARE & YOUR MISSION

You are a **Senior Lead Systems Architect and QA Engineer** working on the **Balnce AI Imagination Canvas** — a React/Vite infinite canvas app with a Surface Conductor workflow module. Your mission is to:

1. **Fix the currently failing unit test** (immediate blocker — fix this first)
2. **Continue comprehensive QA** of the Surface Conductor canvas module
3. **Verify UI/UX integrity** — node creation, wiring, deletion, configuration panels
4. **Write and run Playwright E2E tests** for the conductor canvas flow
5. **Write a final `walkthrough.md` report** summarizing all bugs found and fixed

You operate on a **TDD Red/Green/Refactor/Adversarial** workflow. You MUST NOT skip tests. Fix the code to match test expectations or fix test expectations to match intentional schema changes (document your reasoning either way).

---

## 2. PROJECT OVERVIEW

### Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Zustand, React Flow (`apps/web`)
- **Backend:** Hono + Node.js on port `3001` (`apps/server`)
- **Package Manager:** `pnpm` with Turborepo (`pnpm -r` or `pnpm --filter <package>`)
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **ORM:** Drizzle ORM + SQLite (`packages/db`)
- **Canvas:** Custom InfiniteViewport engine + React Flow nodes

### Monorepo Package Map

```
InfiniteCanvasMaster/
├── apps/
│   ├── web/                          ← React/Vite frontend (port 5173, bound to 127.0.0.1)
│   └── server/                       ← Hono backend (port 3001)
├── packages/
│   ├── core/                         ← Block Protocol, primitives, Scheduler
│   ├── db/                           ← Drizzle ORM schema
│   ├── ui/                           ← Shared UI components
│   ├── surface-conductor/            ← ⭐ PRIMARY FOCUS — Workflow orchestration
│   ├── surface-playable/             ← Multiplayer game studio
│   ├── surface-reel/                 ← Generative media studio
│   ├── surface-forge/                ← App builder
│   └── surface-atlas/                ← Knowledge graph / RAG
└── tests/e2e/                        ← Playwright E2E tests (to be created)
```

### Key Files You Will Touch

| File                                                                | Purpose                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/surface-conductor/src/blocks/orchestrationBlocks.ts`      | All 20+ Conductor block definitions (logic + Zod schemas)  |
| `packages/surface-conductor/src/blocks/orchestrationBlocks.test.ts` | Unit tests — currently has a FAILING test (fix this FIRST) |
| `packages/surface-conductor/src/runtime/subgraphRegistry.ts`        | SubGraph scope security registry                           |
| `packages/surface-conductor/src/runtime/functionRegistry.ts`        | Function scope security registry                           |
| `apps/web/src/nodes/ConductorNode.tsx`                              | React Flow node UI component                               |
| `apps/web/vite.config.ts`                                           | Vite config — already bound to `127.0.0.1:5173`            |
| `tests/e2e/conductor.spec.ts`                                       | ← CREATE THIS FILE with Playwright E2E tests               |

---

## 3. ENVIRONMENT SETUP — DO THIS BEFORE ANYTHING ELSE

### 3.1 Verify You Are On The Right Branch

```bash
cd "c:\Users\Nathan\Documents\Programming Projects\CS 180\InfiniteCanvasMaster"
git status
git branch
```

You should be on `surface-conductor`. If not, check out that branch:

```bash
git checkout surface-conductor
```

### 3.2 Install Dependencies (If Needed)

```bash
pnpm install
```

### 3.3 Check For A Running Dev Server

The dev server (`pnpm dev`) may already be running as a background process on `http://127.0.0.1:5173`. Verify before starting a new one:

```powershell
netstat -ano | findstr :5173
```

If it is NOT running, start it:

```bash
pnpm dev
```

> ⚠️ **CRITICAL:** The Vite server MUST use `127.0.0.1`, NOT `localhost`. On Windows with Hyper-V, `localhost` is excluded from dynamic port ranges and will fail. The `apps/web/vite.config.ts` has already been configured to use `127.0.0.1`.

### 3.4 Check For A Running Backend

```powershell
netstat -ano | findstr :3001
```

If not running, start the backend separately:

```bash
pnpm --filter @iem/server dev
```

---

## 4. IMMEDIATE BLOCKER — FIX THE FAILING UNIT TEST FIRST

### The Problem

The test at `packages/surface-conductor/src/blocks/orchestrationBlocks.test.ts`, line ~305, is failing with an `AssertionError`. The test assertion checks:

```typescript
const validIn = { instructions: "Translate", input: { text: "hello" } };
expect(agentBlock.input.parse(validIn)).toEqual(validIn);
```

**Root cause:** The `agentBlock` Zod input schema was updated to include two new optional fields with `.default()` values:

- `provider: z.enum(["google", "local"]).optional().default("google")`
- `referenceFiles: z.array(z.any()).optional().default([])`

When Zod parses an object with `.default()` fields, it **injects those defaults into the output**. So the parsed result is actually:

```typescript
{
  instructions: "Translate",
  input: { text: "hello" },
  provider: "google",          // ← injected by .default()
  referenceFiles: []           // ← injected by .default()
}
```

But the test `toEqual`s the original input (without those fields), so it fails.

### The Fix

Open `packages/surface-conductor/src/blocks/orchestrationBlocks.test.ts` and find the "Sub-Agent Block" `has valid metadata and schema` test (around line 303–307). Update the assertion to include the injected defaults:

```typescript
// BEFORE (broken):
it("has valid metadata and schema", () => {
  expect(agentBlock.id).toBe("iem.conductor.agent");
  const validIn = { instructions: "Translate", input: { text: "hello" } };
  expect(agentBlock.input.parse(validIn)).toEqual(validIn);
});

// AFTER (fixed):
it("has valid metadata and schema", () => {
  expect(agentBlock.id).toBe("iem.conductor.agent");
  const validIn = { instructions: "Translate", input: { text: "hello" } };
  expect(agentBlock.input.parse(validIn)).toEqual({
    ...validIn,
    provider: "google", // Zod injects default
    referenceFiles: [], // Zod injects default
  });
});
```

### Run The Tests After Fixing

```bash
pnpm --filter @iem/surface-conductor test
```

**All tests MUST be green (passing) before you proceed.** If any other tests fail, investigate and fix them too.

---

## 5. COMPREHENSIVE QA TASKS (Execute In Order)

### Task 1: Surface Conductor Block Logic Audit

After the tests are green, run a full audit of ALL block definitions in `packages/surface-conductor/src/blocks/orchestrationBlocks.ts`. The file is ~829+ lines. Check every block for:

**Blocks That Exist:**

1. `ifBlock` — JEXL conditional evaluation
2. `loopBlock` — Collection iteration with break condition
3. `webhookTriggerBlock` — Ambient webhook trigger
4. `webhookCallBlock` — Outbound HTTP fetch
5. `functionBlock` — Function definition + FunctionRegistry
6. `functionCallBlock` — Function invocation with scope check
7. `codeBlock` — Node.js VM sandbox execution (JS + Python fallback)
8. `scheduleTriggerBlock` — Cron trigger
9. `saasBlock` — SaaS integration stub
10. `agentBlock` — Google Gemini / local Ollama AI sub-agent
11. `routerBlock` — Simple path router
12. `delayBlock` — Async sleep with negative ms guard
13. `stateBlock` — Key-value state variable
14. `errorBoundaryBlock` — Error catch wrapper
15. `subGraphBlock` — Sub-graph invocation with SubGraphRegistry scope
16. `switchBlock` — Multi-condition JEXL router
17. `transformBlock` — JEXL template data mapper
18. `regexExtractBlock` — Regex pattern extractor
19. `jsonParseBlock` — JSON parse/stringify
20. `classifyBlock` — AI text classification (Google Gemini)
21. `discordPostBlock` — Discord webhook integration
22. `forEachBlock` — Iterate and yield first item
23. `websocketTriggerBlock` — WebSocket ambient trigger
24. `websocketSendBlock` — WebSocket message sender (check lines 800+)

**For each block, verify:**

- [ ] Zod input schema has `.min()` or `.refine()` guards on numeric fields
- [ ] Zod output schema matches what `invoke()` actually returns
- [ ] Edge cases are handled: empty inputs, null values, missing API keys
- [ ] Error messages are descriptive and consistent
- [ ] No async `invoke()` function is missing `await` on promises

**Add missing unit tests** for any blocks that are NOT covered in `orchestrationBlocks.test.ts`. Currently missing test coverage for:

- `switchBlock` — test multi-condition routing, defaultPath, errorPath
- `transformBlock` — test template mapping, error on bad jexl expression
- `regexExtractBlock` — test valid pattern, invalid regex pattern, no-match case
- `stateBlock` — test basic set/get
- `errorBoundaryBlock` — test that it catches errors from wrapped nodes
- `discordPostBlock` — mock fetch and test success/failure cases
- `scheduleTriggerBlock` — test metadata/schema only
- `saasBlock` — test metadata/schema only
- `websocketTriggerBlock` — test metadata/schema only

### Task 2: UI/UX Integrity — Canvas Node Components

Inspect the following React components and verify their logic is correct:

#### 2a. `apps/web/src/nodes/ConductorNode.tsx`

- **Node Deletion:** There should be a trash icon that calls a delete action. Verify it:
  1. Removes the node from the React Flow state
  2. Removes all connected edges
  3. Persists the deletion to the backend (Drizzle/SQLite)
  4. Does NOT leave orphaned state in the Zustand store
- **Collapsed View Trash Can:** Small icon visible even when node is minimized
- **Expanded View Trash Can:** Larger delete button when node panel is open
- **Connection Handles:** Input and output circles should accept drag-to-wire connections. Test that:
  - Dragging from output handle creates a pending edge
  - Dropping on an input handle creates a valid edge
  - Invalid connections (output-to-output) are rejected
  - Edges are stored in state and persisted

#### 2b. `packages/imagination-canvas-kit/src/components/ObjectRenderer.tsx`

- Verify this component correctly renders all block types
- Check that it passes the right props to each node renderer
- Verify there are no TypeScript type errors or missing prop definitions

**Action:** Read both files carefully. Fix any bugs you find. Build the project to verify no TypeScript errors:

```bash
pnpm --filter @iem/web build
```

### Task 3: Write Playwright E2E Tests

Create the file `tests/e2e/conductor.spec.ts`. This file does NOT currently exist. Write comprehensive E2E tests that:

```typescript
// tests/e2e/conductor.spec.ts
import { test, expect } from "@playwright/test";

// Test Suite: Surface Conductor Canvas E2E
//
// IMPORTANT: The dev server must be running at http://127.0.0.1:5173
// before running these tests. Run: pnpm dev
//
// Tests should cover:
// 1. App loads successfully — canvas shell is visible
// 2. Can create a new canvas/project
// 3. Can add a Conductor block (e.g. Delay block) via the node palette
// 4. Can configure a block (e.g. change delay duration to 1000ms)
// 5. Can wire two blocks together (drag output handle to input handle)
// 6. Can delete a block via the trash can icon
// 7. Workflow state persists after page reload
// 8. AI Sub-Agent block renders configuration panel correctly
```

Use `page.locator()` with `data-testid` attributes for reliable element selection. If `data-testid` attributes don't exist on a component, **add them** to the React component before writing the test.

Run the E2E tests with:

```bash
pnpm run test:e2e
```

Or directly:

```bash
npx playwright test tests/e2e/conductor.spec.ts --reporter=list
```

### Task 4: Full Test Suite — Verify Everything Is Green

```bash
# Run all unit tests across the entire monorepo
pnpm test

# Run Surface Conductor tests specifically
pnpm --filter @iem/surface-conductor test

# Run E2E tests
pnpm run test:e2e
```

All tests MUST pass. Fix anything that is red.

### Task 5: TypeScript Build Verification

```bash
# Typecheck the entire monorepo
pnpm --filter @iem/web tsc --noEmit

# Or build everything
npx turbo run build
```

Fix any TypeScript errors found.

---

## 6. KNOWN BUGS & ISSUES TO INVESTIGATE

These were identified during the previous agent session:

### Bug 1 — Failing Unit Test (PRIORITY: CRITICAL)

- **File:** `packages/surface-conductor/src/blocks/orchestrationBlocks.test.ts` ~line 305
- **Issue:** `agentBlock.input.parse(validIn)` returns extra fields (`provider`, `referenceFiles`) due to Zod `.default()` injection
- **Fix:** Update test expectation to include injected defaults (see Task 4 above)

### Bug 2 — Missing Playwright E2E Test File

- **File:** `tests/e2e/conductor.spec.ts` — does NOT exist yet
- **Fix:** Create it (see Task 3 above)

### Bug 3 — `websocketSendBlock` Not Inspected

- **File:** `packages/surface-conductor/src/blocks/orchestrationBlocks.ts` lines 800+
- **Issue:** Not yet reviewed or tested
- **Fix:** Read lines 800–829, add it to the block inventory, write at least a schema validation test

### Bug 4 — `classifyBlock` Makes Live API Calls in Tests

- **File:** `orchestrationBlocks.test.ts` — classifyBlock tests only test schema, not invoke
- **Issue:** The `invoke()` function calls Google Gemini directly (`generateText`). Without mocking it, tests in CI will fail or require real API keys
- **Fix:** Add a mocked test that verifies the classify block uses `generateText`, similar to how `agentBlock` tests handle the mock

### Bug 5 — `codeBlock` Infinite Loop Test May Be Flaky

- **File:** `orchestrationBlocks.test.ts` line 282–289
- **Issue:** The VM timeout is set to 2000ms (`runInContext(sandbox, { timeout: 2000 })`). The test asserts error contains `"Script execution timed out"`. Verify the exact error message Node.js VM emits matches this string exactly.
- **Fix:** Run the test in isolation and verify it passes:
  ```bash
  pnpm --filter @iem/surface-conductor test -- --reporter=verbose -t "infinite loop"
  ```

---

## 7. COMMANDS REFERENCE

```bash
# Working directory (always work from this root)
cd "c:\Users\Nathan\Documents\Programming Projects\CS 180\InfiniteCanvasMaster"

# Start full dev environment (frontend + backend)
pnpm dev

# Start only the frontend
pnpm --filter @iem/web dev

# Start only the backend
pnpm --filter @iem/server dev

# Run all unit tests
pnpm test

# Run Surface Conductor tests only
pnpm --filter @iem/surface-conductor test

# Run Surface Conductor tests in watch mode
pnpm --filter @iem/surface-conductor test -- --watch

# Run a specific test by name
pnpm --filter @iem/surface-conductor test -- -t "Sub-Agent Block"

# Run E2E Playwright tests
pnpm run test:e2e

# TypeScript typecheck (no emit)
pnpm --filter @iem/web tsc --noEmit

# Full turbo build
npx turbo run build

# Check what is on port 5173 (verify dev server)
netstat -ano | findstr :5173

# Check what is on port 3001 (verify backend)
netstat -ano | findstr :3001

# Install Playwright browsers (if not already done)
npx playwright install
```

---

## 8. ARCHITECTURE CONTEXT — SURFACE CONDUCTOR RUNTIME

The Surface Conductor follows the **Block Protocol** defined in `packages/core`. Each block has:

- `id` — Unique block identifier (e.g. `iem.conductor.if`)
- `input` — Zod schema for validating inputs
- `output` — Zod schema for validating outputs
- `mode` — `"triggered"` (runs when upstream fires) or `"ambient"` (event listener)
- `agent.invoke(input)` — The actual execution logic

### Registry Classes

Two registry singletons exist for canvas-scoped security:

**`SubGraphRegistry`** (`packages/surface-conductor/src/runtime/subgraphRegistry.ts`)

- `SubGraphRegistry.register({ canvasId, name, globalAccess })` → returns `graphId`
- `SubGraphRegistry.get(graphId)` → returns graph metadata or `undefined`
- `SubGraphRegistry.clear()` → resets all registered subgraphs (used in test `beforeEach`)

**`FunctionRegistry`** (`packages/surface-conductor/src/runtime/functionRegistry.ts`)

- `FunctionRegistry.register({ canvasId, name, globalAccess, inputs })` → returns `functionId`
- `FunctionRegistry.get(functionId)` → returns function metadata or `undefined`

### Security Model

- Functions/SubGraphs registered with `globalAccess: false` can ONLY be called from the same `canvasId`
- Functions/SubGraphs registered with `globalAccess: true` can be called from ANY `canvasId`
- Violation throws: `"Access denied: [Type] [Name] is local to [canvasId]"`
- Missing ID throws: `"[Type] with ID [id] not found"`

---

## 9. UI COMPONENT ARCHITECTURE

The canvas UI works as follows:

1. **React Flow** renders a canvas with nodes and edges
2. **ConductorNode** (`apps/web/src/nodes/ConductorNode.tsx`) renders individual workflow blocks
3. **ObjectRenderer** (`packages/imagination-canvas-kit/src/components/ObjectRenderer.tsx`) decides which node component to use based on block type
4. **Zustand store** holds canvas state (nodes, edges, selection)
5. **Backend sync** — mutations go to the Hono server at `http://localhost:3001`, which persists to SQLite via Drizzle ORM

When a node is deleted:

1. The trash icon fires a Zustand action
2. React Flow `setNodes` removes it from the canvas
3. `setEdges` removes connected edges
4. An API call is made to `DELETE /api/blocks/:id` on the backend
5. The backend deletes the DB record

---

## 10. WHAT PREVIOUS AGENT HAS ALREADY DONE

Do NOT redo these — they are completed:

- ✅ Fixed `loopBlock` — added `.min(0)` guard on `maxIterations`
- ✅ Fixed `delayBlock` — added `.min(0)` guard and runtime negative check
- ✅ Created `SubGraphRegistry` class with `register()`, `get()`, `clear()` methods
- ✅ Created `FunctionRegistry` class with `register()`, `get()` methods and scope enforcement
- ✅ Updated `agentBlock` to support `provider` (google/local) and `referenceFiles` fields
- ✅ Added Ollama local LLM support to `agentBlock.invoke()`
- ✅ Bound Vite dev server to `127.0.0.1` (not `localhost`) in `apps/web/vite.config.ts`
- ✅ Added `test:e2e` and `playwright:install` scripts to root `package.json`
- ✅ Written 40+ unit tests in `orchestrationBlocks.test.ts` covering all major blocks
- ✅ Verified Playwright headless browsers are installed

---

## 11. FINAL DELIVERABLE — WRITE THE WALKTHROUGH

When ALL tasks are complete and all tests are green, create the file:
`C:\Users\Nathan\.gemini\antigravity\brain\7744d3a0-aaad-4b82-869f-040d309823c5\walkthrough.md`

The walkthrough should include:

1. **Summary of all bugs found and fixed** (with file paths and line numbers)
2. **Test results** — unit test count, pass/fail summary
3. **E2E test results** — Playwright test summary
4. **Build status** — TypeScript typecheck result
5. **Remaining known issues** (if any cannot be fixed in this session)
6. **Architecture observations** — anything you noticed that should be refactored later

---

## 12. IMPORTANT CONSTRAINTS

- **Do NOT modify** `pnpm-lock.yaml` unless absolutely necessary (dependency addition)
- **Do NOT break existing passing tests** — only add or fix
- **Do NOT use `localhost`** for the dev server — always use `127.0.0.1` on Windows
- **Do NOT commit** — this is a development/debug session, not a release
- **ALWAYS explain WHY** before making a change — add a comment if the fix is non-obvious
- The project uses **ESM modules** (`"type": "module"` in package.json) — use `.js` extensions on local imports within the `packages/` directory
- The TDD workflow is: **Red → Green → Refactor → Adversarial** — always write/verify tests before shipping code

---

## 13. SUCCESS CRITERIA

You have completed your mission when:

- [ ] `pnpm --filter @iem/surface-conductor test` → **ALL GREEN** (0 failures)
- [ ] `pnpm run test:e2e` → **ALL GREEN** (conductor.spec.ts passes)
- [ ] `pnpm --filter @iem/web tsc --noEmit` → **0 TypeScript errors**
- [ ] `walkthrough.md` has been written with full bug report
- [ ] All 20+ conductor blocks have at least one unit test

---

_Handoff generated from session `7744d3a0-aaad-4b82-869f-040d309823c5` on 2026-05-29._
