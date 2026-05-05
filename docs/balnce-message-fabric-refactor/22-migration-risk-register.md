# Balnce Message Fabric: Migration Risk Register

| Risk ID | Description                      | Impact                             | Mitigation                                                                                  | Status |
| ------- | -------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| R01     | **Breaking current A2A flow**    | Workflow execution fails           | Slice 0 baseline testing; backward compatible exports in `MessageBus.ts`.                   | Open   |
| R02     | **SSE Lane Pollution**           | SSE used for more than projection  | `SSEProjectionTransport` explicitly throws on forbidden lanes.                              | Open   |
| R03     | **Unsafe Instruction Promotion** | Untrusted content as instruction   | Node Input Adapters enforce trust check before merging into DAG inputs.                     | Open   |
| R04     | **Conflated State**              | Stream deltas in document state    | Rigid lane definition in `createEnvelope`; different adapters for stream vs state.          | Open   |
| R05     | **Durable Persistence Failure**  | Facts are lost on restart          | `approval_required` delivery class requires acknowledgment and persistence; TDD for DB log. | Open   |
| R06     | **EventEmitter Memory Leak**     | Global bus grows indefinitely      | Standardized `unsubscribe` pattern in `FabricTransport` and `FabricRouter`.                 | Open   |
| R07     | **Topic String Drift**           | Incorrect topics break subscribers | Unified `FabricTopics` helper used in all adapters and server routes.                       | Open   |
| R08     | **Mastra Wrapper Complexity**    | Compiler becomes unmaintainable    | Extract fabric logic into `MastraDagFabricAdapter`; inject fabric dependency.               | Open   |
| R09     | **Canvas UI Lag**                | Too many SSE events throttle UI    | Multiplexing in single SSE stream; lane-based filtering in `useA2A` hook.                   | Open   |
| R10     | **Yjs/tldraw Out of Sync**       | Collaborative state diverges       | Strict `document_state` lane for final accepted outputs only.                               | Open   |
| R11     | **Test Suite Instability**       | Test failures mask real issues     | The `cliBinding.test.ts` failure needs to be fixed to ensure the CI pipeline is stable.     | Open   |
