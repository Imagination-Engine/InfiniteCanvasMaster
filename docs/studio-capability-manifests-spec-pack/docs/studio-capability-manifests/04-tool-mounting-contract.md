# 04 — Tool Mounting Contract

## Purpose

Every external framework, SDK, binary, service, or open-source repo must be mounted through a contract.

## Tool Mount Type

```ts
export type ToolMountKind =
  | "binary"
  | "wasm"
  | "node_package"
  | "python_package"
  | "mcp_server"
  | "api"
  | "repo_adapter"
  | "iframe_app"
  | "web_worker"
  | "sandbox_runtime"
  | "browser_runtime"
  | "recipe_source";

export type ToolMountStatus =
  | "approved"
  | "candidate"
  | "demo_only"
  | "adapter_ready"
  | "research_required"
  | "rejected";
```

## Required Interface

```ts
export interface ToolMount {
  id: string;
  name: string;
  kind: ToolMountKind;
  status: ToolMountStatus;
  studioIds: string[];
  capabilities: string[];
  purpose: string;
  source: { package?: string; repo?: string; docs?: string; license?: string };
  runtime: {
    client: boolean;
    server: boolean;
    worker: boolean;
    sandboxRequired: boolean;
    supportsStreaming?: boolean;
    supportsProgress?: boolean;
  };
  inputs: string[];
  outputs: string[];
  permissions: {
    filesystem: "none" | "workspace" | "project" | "sandbox";
    network: "none" | "allowlisted" | "full";
    shell: "none" | "sandboxed" | "host";
    secrets: string[];
    requiresHumanApprovalFor: string[];
  };
  adapter: { interfaceName: string; methods: string[]; events: string[] };
  notes?: string[];
}
```

## Mounting Modes

- Direct dependency: compatible license, maintained, acceptable bundle size, no unsafe host permissions.
- Browser runtime: Sandpack, WebContainers, Phaser, PixiJS, Babylon.js, WaveSurfer, Tone.
- Web worker: ffmpeg.wasm, media transforms, parsing.
- Server worker: native FFmpeg, render queues, heavy exports.
- Sandbox runtime: ImagiClaw, E2B, Daytona, untrusted code.
- MCP server: allowlisted tools/resources/prompts.
- Recipe source: useful ideas/pipelines without direct embed, e.g. OpenMontage first pass.

## Required Adapter Shape

```ts
interface StudioToolAdapter<TInput, TOutput> {
  id: string;
  mount: ToolMount;
  validate(input: TInput): Promise<void>;
  run(
    input: TInput,
    context: StudioRunContext,
  ): AsyncIterable<StudioToolEvent<TOutput>>;
  cancel(runId: string): Promise<void>;
  getReadiness(): Promise<ToolReadiness>;
}
```
