# 15 — Migration Plan from Current Bus

## Guiding principle

Do not break current working behavior. Wrap it, test it, then promote it.

## Step 1 — Snapshot current behavior

Add tests for:

- envelope creation
- current publish/subscribe behavior
- Mastra DAG output interception
- downstream input merge behavior
- package exports

## Step 2 — Introduce fabric namespace

Create:

```txt
packages/core/src/fabric/
```

Do not remove existing bus exports yet.

## Step 3 — Move or wrap EventEmitter bus

Create:

```txt
transports/InProcessTransport.ts
```

Then keep compatibility:

```ts
export const messageBus = createLegacyMessageBusWrapper(fabric);
```

## Step 4 — Introduce BalnceEnvelope v2

Add lane, delivery, policy, provenance fields.

Provide compatibility converter:

```ts
upgradeLegacyEnvelope(legacyEnvelope): BalnceEnvelope
```

## Step 5 — Add FabricRouter

Initially route most lanes to InProcessTransport, but enforce lane validation.

## Step 6 — Add SSEProjectionTransport

Projection only. No command/control.

## Step 7 — Add node input adapters

Replace universal input mutation. Keep temporary compatibility adapter only if required.

## Step 8 — Add tests per lane

Prove lane boundaries.

## Step 9 — Add canvas integration adapters

Yjs/tldraw sync adapter can be interface-only at first, but document_state must not be confused with agent_stream.

## Step 10 — Remove or quarantine legacy patterns

Legacy topic names and arbitrary input injection should either be removed or isolated behind explicit migration shims.
