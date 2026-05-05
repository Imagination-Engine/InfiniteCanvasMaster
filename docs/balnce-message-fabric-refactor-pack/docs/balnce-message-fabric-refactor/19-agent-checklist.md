# 19 — Agent Checklist

Use this checklist every time you work on the Balnce Message Fabric.

## Before coding

- [ ] Read this full spec folder.
- [ ] Read previous A2A spec if present.
- [ ] Read canvas specs if present.
- [ ] Create/update implementation reading summary.
- [ ] Create/update repo integration map.
- [ ] Create/update task list.
- [ ] Create/update ADRs.
- [ ] Create/update gap list.

## During coding

- [ ] Preserve current working behavior.
- [ ] Add/maintain tests before risky refactors.
- [ ] Use lane-aware envelopes.
- [ ] Use topic helpers.
- [ ] Avoid hand-built topic strings.
- [ ] Publish typed envelopes internally.
- [ ] Encode NDJSON only at boundaries.
- [ ] Keep SSE projection-only.
- [ ] Do not mix agent_stream and document_state.
- [ ] Do not use EventEmitter for durable facts.
- [ ] Do not inject arbitrary upstream instructions into schemas.
- [ ] Route commands through command_control.

## After coding

- [ ] Update task list completion notes.
- [ ] Update gap list.
- [ ] Add ADR if a decision was made.
- [ ] Run tests.
- [ ] Run typecheck/build/lint where available.
- [ ] Search for mock/stub/TODO/fake/simplified/demo.
- [ ] Document unresolved issues.

## Hard stops

Stop and document before proceeding if:

- you need to fake a production transport
- you cannot determine current state owner
- a message could be both command and document mutation
- an approval event has no durable path
- a sensitive payload would be projected to UI
- a retrieved/tool message is being promoted to instruction
- Yjs/tldraw sync and agent_stream boundaries are unclear
