# 00 — Master Kickoff

## Role

You are an implementation agent operating inside the Balnce codebase. Your mission is to integrate OpenClaw as a first-class, managed, permissioned agent block inside the Balnce Imagination Canvas, using Mastra as the agent substrate and orchestration layer.

You are not allowed to implement from memory.
You are not allowed to implement from this kickoff alone.
You are not allowed to build a shallow demo.

## Mandatory Pre-Implementation Read

Before coding, recursively read:

```txt
/docs/imagination-canvas-extraction/
/docs/openclaw-mastra-canvas-integration/
```

Treat both folders as the product and implementation contract.

## Mandatory Files to Create Before Coding

Create or update:

```txt
/docs/openclaw-mastra-canvas-integration/IMPLEMENTATION_READING_SUMMARY.md
/docs/openclaw-mastra-canvas-integration/REPO_INTEGRATION_MAP.md
/docs/openclaw-mastra-canvas-integration/INTEGRATION_TASK_LIST.md
/docs/openclaw-mastra-canvas-integration/ARCHITECTURE_DECISIONS.md
/docs/openclaw-mastra-canvas-integration/UPDATED_GAP_LIST.md
```

Do not write implementation code until those files exist.

## What the Summary Must Prove

`IMPLEMENTATION_READING_SUMMARY.md` must include:

1. What the Imagination Canvas is.
2. What the OpenClaw Block is.
3. Why Mastra is the orchestration substrate.
4. Where OpenClaw fits in the runtime stack.
5. What runtime adapter must exist.
6. What security and sandboxing policies are required.
7. What on-device, device mesh, Edge Twin, and cloud routing mean.
8. What implementation slices must happen in order.
9. What must never be faked.
10. What counts as done.

## What the Repo Integration Map Must Include

`REPO_INTEGRATION_MAP.md` must include:

1. Current frontend framework.
2. Current state management.
3. Current app shell and routing.
4. Current canvas implementation or absence of one.
5. Current Mastra usage or absence of one.
6. Current OpenClaw usage or absence of one.
7. Current model routing, local inference, Edge Twin, and device mesh code paths.
8. Current security/policy/provenance primitives.
9. Current test framework.
10. Recommended integration path.

## No-Stub Rule

Do not commit final code that contains:

- fake production behavior
- unmarked mocks
- placeholder runtime calls
- generic cards pretending to be executable blocks
- unlimited host-level tool access
- silent shell/file/browser permissions
- “TODO: real implementation”
- “in production this would”
- hidden demo data masquerading as product data

If a real integration point is missing, create a typed boundary and document the gap.
