# AGENTS — OpenClaw + Mastra + Imagination Canvas

When working on the OpenClaw + Mastra + Imagination Canvas integration, always begin by reading:

```txt
/docs/openclaw-mastra-canvas-integration/README.md
/docs/openclaw-mastra-canvas-integration/00-master-kickoff.md
/docs/openclaw-mastra-canvas-integration/01-product-vision.md
/docs/openclaw-mastra-canvas-integration/02-system-architecture.md
/docs/openclaw-mastra-canvas-integration/03-openclaw-block-runtime-spec.md
/docs/openclaw-mastra-canvas-integration/04-mastra-orchestration-spec.md
/docs/openclaw-mastra-canvas-integration/05-runtime-adapter-contract.md
/docs/openclaw-mastra-canvas-integration/07-security-permissions-and-sandboxing.md
/docs/openclaw-mastra-canvas-integration/12-implementation-slices.md
/docs/openclaw-mastra-canvas-integration/15-agent-kickoff-master-prompt.md
```

Also read the existing Imagination Canvas docs:

```txt
/docs/imagination-canvas-extraction/
```

## Rules

1. Do not implement from memory.
2. Do not build a generic whiteboard.
3. Do not represent OpenClaw as a generic card.
4. Do not bypass the adapter.
5. Do not bypass security policy.
6. Do not allow broad host access by default.
7. Do not fake Mastra orchestration.
8. Do not fake OpenClaw runtime behavior.
9. Do not hide gaps.
10. Do not leave final mocks, stubs, placeholders, or TODO-real-implementation code.

## Required First Files

Before coding, create/update:

```txt
/docs/openclaw-mastra-canvas-integration/IMPLEMENTATION_READING_SUMMARY.md
/docs/openclaw-mastra-canvas-integration/REPO_INTEGRATION_MAP.md
/docs/openclaw-mastra-canvas-integration/INTEGRATION_TASK_LIST.md
/docs/openclaw-mastra-canvas-integration/ARCHITECTURE_DECISIONS.md
/docs/openclaw-mastra-canvas-integration/UPDATED_GAP_LIST.md
```

## Implementation Order

Follow the slices in:

```txt
/docs/openclaw-mastra-canvas-integration/12-implementation-slices.md
```

Every slice must be testable, reviewable, and documented.
