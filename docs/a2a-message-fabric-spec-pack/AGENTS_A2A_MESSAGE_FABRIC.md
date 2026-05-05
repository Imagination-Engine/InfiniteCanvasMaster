# Agent Instructions — Balnce A2A Message Fabric

Before working on the message bus/fabric, read `/docs/a2a-message-fabric/README.md`, `00-master-kickoff.md`, `04-balnce-envelope-protocol.md`, `06-transport-abstraction.md`, `08-node-input-adapters.md`, `09-trust-instruction-and-policy-model.md`, `10-mastra-dag-compiler-integration.md`, `15-implementation-slices.md`, and `19-master-implementation-prompt.md`.

Do not treat the current EventEmitter implementation as the full fabric. Do not build a second DAG engine. Do not publish only raw NDJSON internally. Do not mutate arbitrary node input with universal `_instructions` or `_context` fields as final architecture.

Before coding, create or update `IMPLEMENTATION_READING_SUMMARY.md`, `A2A_TASK_LIST.md`, `REPO_INTEGRATION_MAP.md`, `ARCHITECTURE_DECISIONS.md`, and `GAP_LIST.md`.
