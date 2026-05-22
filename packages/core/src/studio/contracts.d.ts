/**
 * Studio Capability Manifest — Type Contracts
 *
 * These interfaces define the formal contract for every studio in the
 * Imagination Engine. They are the backbone of cross-studio interoperability,
 * orchestrator awareness, and block registry normalization.
 *
 * @module @iem/core/studio
 * @track studio_manifest_types_20260504 (Track 2)
 */
/**
 * Canonical studio identifiers. Every block declares affinity to one or more
 * of these. The literal union prevents typos and enables exhaustive matching.
 */
export type StudioId =
  | "agent-studio"
  | "video-studio"
  | "game-studio"
  | "writers-studio"
  | "app-creation-studio"
  | "commerce-studio"
  | "research-studio"
  | "knowledge-studio"
  | "launch-studio"
  | "media-studio"
  | "automation-studio"
  | "brand-studio";
/**
 * Describes the operational state of a studio's runtime adapter.
 *
 * - `ready` — All tool mounts configured, runtime initialized.
 * - `degraded` — Running with reduced capability (e.g. mock fallback).
 * - `unavailable` — Missing critical configuration (e.g. API key).
 * - `configuring` — Setup in progress.
 */
export type RuntimeReadiness =
  | "ready"
  | "degraded"
  | "unavailable"
  | "configuring";
/**
 * The kind of runtime a block or studio operates within.
 * Stricter version of the loose string union on the legacy `BlockDefinition`.
 */
export type RuntimeKind =
  | "none"
  | "agent"
  | "studio"
  | "generator"
  | "sandbox"
  | "app"
  | "commerce"
  | "media"
  | "document";
/**
 * Classification of a block's security posture. Determines isolation level.
 *
 * - `public` — No special restrictions (display-only blocks).
 * - `internal` — Runs within the app boundary, no external calls.
 * - `sandbox` — Runs in a sandboxed environment (Durable Objects, etc.).
 * - `isolated` — Fully isolated container with no shared state.
 */
export type SecurityClass = "public" | "internal" | "sandbox" | "isolated";
/**
 * A named pointer to an LLM model with optional fallback chain.
 * Allows studios to reference models by intent (e.g. "fast-draft") rather
 * than provider-specific model IDs.
 */
export interface ModelAlias {
  /** Semantic name, e.g. "fast-draft", "deep-reason", "vision" */
  alias: string;
  /** Provider identifier, e.g. "google", "openai", "anthropic" */
  provider: string;
  /** Specific model ID, e.g. "gemini-2.5-flash" */
  model: string;
  /** Ordered fallback models if primary is unavailable */
  fallbacks?: Array<{
    provider: string;
    model: string;
  }>;
}
/**
 * A formal declaration of a tool that a studio or block requires.
 * The `ToolMountRegistry` holds all available mounts; blocks reference
 * them by `id`.
 */
export interface ToolMount {
  /** Unique identifier, e.g. "elevenlabs-tts", "pinecone-vector-search" */
  id: string;
  /** Human-readable name */
  name: string;
  /** What this tool does */
  description: string;
  /** External provider or "local" */
  provider: string;
  /** Whether this mount is currently active, mocked, or unconfigured */
  status: "mock" | "configured" | "active";
  /** Zod-compatible config schema (stored as a JSON-serializable descriptor) */
  configSchema?: Record<string, unknown>;
}
/**
 * Describes a data shape that a block can produce or consume.
 * This is the foundation of cross-studio interoperability — the
 * `StudioInteropResolver` uses these to determine valid block connections.
 */
export interface ArtifactContract {
  /** Unique identifier, e.g. "manuscript", "video-project", "research-brief" */
  id: string;
  /** Human-readable name */
  name: string;
  /** MIME type or custom type string */
  mimeType: string;
  /** JSON Schema descriptor for the artifact payload */
  schema?: Record<string, unknown>;
  /** Block IDs that produce this artifact */
  producedBy: string[];
  /** Block IDs that accept this artifact */
  acceptedBy: string[];
}
/**
 * A concrete instance of an artifact produced by a block execution.
 */
export interface StudioArtifact {
  /** References an ArtifactContract.id */
  contractId: string;
  /** The artifact payload */
  data: unknown;
  /** Provenance and context metadata */
  metadata: {
    sourceBlockId: string;
    studioId: StudioId;
    createdAt: string;
    version: number;
  };
}
/**
 * A named capability that a studio offers. Used by the orchestrator
 * to understand what a studio can do and suggest appropriate blocks.
 */
export interface CapabilityDefinition {
  /** Unique identifier, e.g. "text-generation", "image-generation" */
  id: string;
  /** Human-readable name */
  name: string;
  /** What this capability does */
  description: string;
  /** Tool mounts required for this capability to function */
  requiresToolMounts?: string[];
}
/**
 * Interface for a studio's runtime lifecycle management.
 * Each studio can provide an adapter that handles initialization,
 * health checks, and teardown.
 */
export interface StudioRuntimeAdapter {
  /** The kind of runtime this adapter manages */
  kind: RuntimeKind;
  /** Initialize the runtime (e.g. connect to external services) */
  initialize: () => Promise<void>;
  /** Tear down the runtime cleanly */
  dispose: () => Promise<void>;
  /** Check current operational readiness */
  getReadiness: () => Promise<RuntimeReadiness>;
}
/**
 * Sandbox boundaries for a studio. Controls what a studio's blocks
 * are allowed to do at runtime.
 */
export interface StudioPermissionPolicy {
  /** Isolation level for block execution */
  sandboxLevel: SecurityClass;
  /** Whether blocks can make outbound network requests */
  networkAccess: boolean;
  /** Whether blocks can read/write the local filesystem */
  fileSystemAccess: boolean;
  /** Maximum concurrent block executions */
  maxConcurrency: number;
}
/**
 * The complete, structured manifest for a studio. This is the single
 * source of truth for what a studio is, what it can do, and how it
 * interoperates with other studios.
 */
export interface StudioManifest {
  /** Canonical studio identifier */
  id: StudioId;
  /** Human-readable name, e.g. "Writer's Studio" */
  name: string;
  /** One-line description for UI and AI discovery */
  description: string;
  /** Lucide icon identifier */
  icon: string;
  /** CSS color for studio branding */
  accent: string;
  /** Block IDs that belong to this studio */
  blockIds: string[];
  /** Capabilities this studio provides */
  capabilities: CapabilityDefinition[];
  /** Tool mounts this studio requires */
  toolMounts: ToolMount[];
  /** Artifact contracts this studio's blocks produce and consume */
  artifactContracts: ArtifactContract[];
  /** Model aliases this studio uses */
  modelAliases: ModelAlias[];
  /** Runtime adapter for lifecycle management */
  runtimeAdapter?: StudioRuntimeAdapter;
  /** Permission policy governing block execution */
  permissions: StudioPermissionPolicy;
}
//# sourceMappingURL=contracts.d.ts.map
