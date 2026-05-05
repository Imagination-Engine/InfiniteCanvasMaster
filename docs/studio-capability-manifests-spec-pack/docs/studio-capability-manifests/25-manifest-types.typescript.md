# 25 — Manifest Types TypeScript Appendix

```ts
export type StudioId =
  | "writers"
  | "video"
  | "game_world"
  | "app_creation"
  | "commerce_intentcasting"
  | "agent_automation"
  | "research_knowledge";
export type ModelAlias =
  | "fast_tool_use"
  | "deep_planning"
  | "deep_coding"
  | "long_context_synthesis"
  | "image_generation"
  | "image_editing"
  | "video_generation"
  | "video_understanding"
  | "audio_transcription"
  | "audio_dialogue"
  | "tts"
  | "embeddings"
  | "local_lightweight"
  | "safety_judge";
export type FabricLane =
  | "document_state"
  | "presence"
  | "agent_stream"
  | "command_control"
  | "workflow_trace"
  | "runtime_simulation"
  | "durable_event"
  | "provenance"
  | "ui_projection";
export type RuntimeKind =
  | "none"
  | "ui_only"
  | "browser_runtime"
  | "worker_runtime"
  | "server_worker"
  | "sandbox_runtime"
  | "mcp_tool"
  | "mastra_agent"
  | "imagiclaw_sandbox";
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

export interface StudioManifest {
  id: StudioId;
  name: string;
  description: string;
  blocks: string[];
  capabilities: string[];
  modelPolicy: Partial<Record<ModelAlias, string>>;
  toolMountIds: string[];
  runtimeAdapterIds: string[];
  artifactTypesProduced: string[];
  artifactTypesAccepted: string[];
  fabricLanes: FabricLane[];
  permissions: StudioPermissionPolicy;
  uiSurfaces: StudioUiSurfaces;
}

export interface StudioPermissionPolicy {
  fileAccess: "none" | "workspace" | "project" | "sandbox";
  networkAccess: "none" | "allowlisted" | "full";
  shellAccess: "none" | "sandboxed" | "host";
  requiresHumanApprovalFor: string[];
}

export interface StudioUiSurfaces {
  libraryCard: string;
  minimizedBlock: string;
  expandedStudio: string;
  inspector?: string;
  chatPanel?: string;
  outputSurface?: string;
}

export interface ToolMount {
  id: string;
  name: string;
  kind: ToolMountKind;
  status: ToolMountStatus;
  studioIds: StudioId[];
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
  permissions: StudioPermissionPolicy & { secrets: string[] };
  adapter: { interfaceName: string; methods: string[]; events: string[] };
  notes?: string[];
}

export interface BlockCapabilityMetadata {
  type: string;
  title: string;
  studioAffinity: StudioId[];
  category: string;
  capabilities: string[];
  accepts: string[];
  produces: string[];
  modelAliases: ModelAlias[];
  toolMountIds: string[];
  runtimeKind: RuntimeKind;
  fabricLanes: FabricLane[];
  demoMode?: boolean;
  securityClass:
    | "safe_visual"
    | "document_edit"
    | "sandboxed_runtime"
    | "networked_tool"
    | "commerce_demo"
    | "high_risk";
}

export interface StudioRuntimeAdapter<TInput = unknown, TOutput = unknown> {
  id: string;
  studioId: StudioId;
  toolMountIds: string[];
  getReadiness(): Promise<RuntimeReadiness>;
  start(
    input: TInput,
    context: StudioRuntimeContext,
  ): AsyncIterable<StudioRuntimeEvent<TOutput>>;
  command(command: StudioRuntimeCommand): Promise<StudioRuntimeCommandResult>;
  cancel(runId: string): Promise<void>;
}

export interface RuntimeReadiness {
  mode:
    | "live"
    | "demo"
    | "adapter_ready"
    | "not_connected"
    | "blocked_by_policy";
  reason?: string;
  missing?: string[];
  warnings?: string[];
}
```
