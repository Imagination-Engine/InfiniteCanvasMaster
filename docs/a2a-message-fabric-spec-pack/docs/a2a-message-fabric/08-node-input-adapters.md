# 08 — Node Input Adapters

Node Input Adapters convert upstream envelopes into schema-valid downstream inputs.

Do not use this as final universal architecture:

```ts
(mergedInput as any)._instructions = incomingInstructions.join("\n");
(mergedInput as any).additionalInstructions = incomingInstructions.join("\n");
(mergedInput as any)._context = mergedContext;
(mergedInput as any).context = JSON.stringify(mergedContext);
```

Use:

```ts
interface NodeInputAdapter<TInput = unknown> {
  nodeType?: string;
  toolName?: string;
  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: TInput;
    nodeSpec: unknown;
    runContext: unknown;
  }): Promise<TInput> | TInput;
}
```

Required: `DefaultStrictInputAdapter`, transitional `LegacyAdditionalInstructionsAdapter`, Summarizer/Creative/Artifact/Canvas/Commerce/Wallet/OpenClaw adapters. Untrusted instructions must be blocked or downgraded.
