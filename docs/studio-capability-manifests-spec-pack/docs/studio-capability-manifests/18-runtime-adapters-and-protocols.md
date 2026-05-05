# 18 — Runtime Adapters and Protocols

```ts
export interface StudioRuntimeAdapter<TInput = unknown, TOutput = unknown> {
  id: string;
  studioId: string;
  toolMountIds: string[];
  getReadiness(): Promise<RuntimeReadiness>;
  start(
    input: TInput,
    context: StudioRuntimeContext,
  ): AsyncIterable<StudioRuntimeEvent<TOutput>>;
  command(command: StudioRuntimeCommand): Promise<StudioRuntimeCommandResult>;
  cancel(runId: string): Promise<void>;
}
```

Use:

- Message Fabric for events.
- MCP for standardized tools/resources/prompts.
- Web Workers for ffmpeg.wasm/media transforms.
- Browser runtime for Sandpack/WebContainers/Phaser/Pixi/Babylon/WaveSurfer/Tone.
- Sandbox runtime for ImagiClaw/E2B/Daytona/untrusted code.
- Server worker for native FFmpeg/render queues/heavy exports.
