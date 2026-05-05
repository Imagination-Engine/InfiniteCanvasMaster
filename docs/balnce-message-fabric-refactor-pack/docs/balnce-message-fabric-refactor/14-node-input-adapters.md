# 14 — Node Input Adapters

## Problem

Current downstream merging injects upstream messages into arbitrary tool inputs using fields like:

- `_instructions`
- `additionalInstructions`
- `_context`
- `context`

This is useful for compatibility but unsafe as a universal architecture.

## Solution

Each node/tool type should own how envelopes become input.

## Interface

```ts
export interface NodeInputAdapter<TInput = unknown> {
  readonly id: string;
  readonly supports: string[];
  adapt(args: {
    baseInput: TInput;
    envelopes: BalnceEnvelope[];
    nodeSpec: unknown;
    traceId: string;
  }): Promise<TInput> | TInput;
}
```

## Adapter examples

### Summarizer adapter

- maps trusted upstream instructions to `additionalInstructions`
- maps context summary to `context`
- excludes untrusted retrieved instructions unless explicitly allowed

### Creative block adapter

- maps upstream intent to prompt fields
- maps artifacts to references
- does not inject raw JSON context blindly

### Wallet/identity adapter

- rejects agent/tool instructions by default
- requires user/system command_control authorization
- accepts only structured, policy-validated inputs

### Game/runtime adapter

- maps commands to runtime events
- ignores document-level context unless explicitly referenced

## Trust promotion rule

Adapters may promote upstream messages only when:

1. message trust permits it
2. lane permits it
3. node policy permits it
4. schema validation passes
5. sensitive capability requirements are satisfied

## Acceptance criteria

- no universal arbitrary input mutation remains in core fabric path
- node-specific adapters exist for current tools
- unsafe promotion is blocked
- tests cover at least trusted, agent-advisory, and untrusted upstream input
