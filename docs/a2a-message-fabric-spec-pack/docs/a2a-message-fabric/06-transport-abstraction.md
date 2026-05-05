# 06 — Transport Abstraction

`EventEmitter` is one local transport, not the fabric.

```ts
interface A2AMessageTransport {
  publish<T>(topic: string, envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    topic: string,
    handler: (envelope: BalnceEnvelope<T>) => void | Promise<void>,
    options?: A2ASubscriptionOptions,
  ): { unsubscribe: () => void };
  close?(): Promise<void>;
}
```

Initial: `EventEmitterTransport`. Future: DurableLocalLogTransport, BrowserBroadcastTransport, WebSocketTransport, EdgeTwinTransport, DeviceMeshTransport, NatsTransport, RedisStreamsTransport, CloudflareDurableObjectTransport.

Compiler should accept `messageFabric` as an option, with a transitional default if needed.
