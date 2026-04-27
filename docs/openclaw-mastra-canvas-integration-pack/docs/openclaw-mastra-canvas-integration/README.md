# OpenClaw + Mastra + Imagination Canvas Integration Spec

This folder is the durable source-of-truth package for integrating **OpenClaw as a first-class Balnce Imagination Canvas block runtime**, with **Mastra as the general agent substrate, workflow layer, supervisor, and orchestration engine**.

This is not a single prompt. This is a specification set.

The implementation agent must read this entire folder before writing code, then create and maintain:

- `IMPLEMENTATION_READING_SUMMARY.md`
- `REPO_INTEGRATION_MAP.md`
- `INTEGRATION_TASK_LIST.md`
- `ARCHITECTURE_DECISIONS.md`
- `UPDATED_GAP_LIST.md`

## Core Thesis

The Balnce Imagination Canvas should be able to host one or many OpenClaw runtime blocks. Each OpenClaw block is a managed, permissioned, inspectable, stoppable, provenance-aware agent runtime cell. Mastra acts as the control plane that can invoke one block, supervise many blocks, coordinate workflows, route tasks, enforce human checkpoints, and choose model/compute routes across on-device, device mesh, Edge Twin, and cloud models.

## Required Reading Order

1. `00-master-kickoff.md`
2. `01-product-vision.md`
3. `02-system-architecture.md`
4. `03-openclaw-block-runtime-spec.md`
5. `04-mastra-orchestration-spec.md`
6. `05-runtime-adapter-contract.md`
7. `06-model-routing-and-compute-policy.md`
8. `07-security-permissions-and-sandboxing.md`
9. `08-event-and-state-model.md`
10. `09-canvas-ui-and-block-states.md`
11. `10-group-orchestration.md`
12. `11-testing-and-acceptance-criteria.md`
13. `12-implementation-slices.md`
14. `15-agent-kickoff-master-prompt.md`

## Relationship to Existing Canvas Specs

This folder depends on the existing Imagination Canvas extraction docs:

- `/docs/imagination-canvas-extraction/`

The existing canvas spec defines the infinite canvas, object model, Balnce block system, interaction grammar, and implementation kit. This folder extends that system with a dedicated `OpenClawBlock` runtime type and Mastra orchestration layer.

## Source Alignment Notes

This specification assumes the implementation agent will verify current APIs directly inside the target repo, installed package versions, generated types, and local code before coding.

Public references used to shape this package:

- OpenClaw repository: https://github.com/openclaw/openclaw
- OpenClaw docs: https://docs.openclaw.ai/
- Mastra docs: https://mastra.ai/docs
- Mastra repository: https://github.com/mastra-ai/mastra
