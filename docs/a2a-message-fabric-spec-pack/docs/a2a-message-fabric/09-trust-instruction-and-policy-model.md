# 09 — Trust, Instruction, and Policy Model

Instructions require origin and trust.

Defaults: system trusted; user trusted within session/policy; agent bounded unless delegated; tool bounded/untrusted by tool; retrieved/external content untrusted.

```ts
interface A2APolicyEngine {
  evaluatePublish(args: {
    topic: string;
    envelope: BalnceEnvelope;
  }): Promise<PolicyDecision>;
  evaluateDelivery(args: {
    topic: string;
    envelope: BalnceEnvelope;
    subscriber?: unknown;
  }): Promise<PolicyDecision>;
  evaluateInputAdaptation(args: {
    envelopes: BalnceEnvelope[];
    nodeSpec: unknown;
    toolName?: string;
  }): Promise<PolicyDecision>;
}
```

High-risk actions requiring approval: shell execution, filesystem mutation, external communication, commerce/wallet/identity actions, memory export, credential access, high-cost models, Edge Twin escalation, public publishing.
