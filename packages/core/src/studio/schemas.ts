/**
 * Studio Capability Manifest — Zod Schemas
 *
 * Runtime validation schemas that mirror the TypeScript interfaces in
 * `contracts.ts`. Used during manifest registration to catch malformed
 * definitions before they enter the registry.
 *
 * @module @iem/core/studio
 * @track studio_manifest_types_20260504 (Track 2)
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Studio Identity
// ---------------------------------------------------------------------------

export const StudioIdSchema = z.enum([
  "agent-studio",
  "video-studio",
  "game-studio",
  "writers-studio",
  "app-creation-studio",
  "commerce-studio",
  "research-studio",
  "knowledge-studio",
  "launch-studio",
  "media-studio",
  "automation-studio",
  "brand-studio",
]);

// ---------------------------------------------------------------------------
// Runtime & Security
// ---------------------------------------------------------------------------

export const RuntimeReadinessSchema = z.enum([
  "ready",
  "degraded",
  "unavailable",
  "configuring",
]);

export const RuntimeKindSchema = z.enum([
  "none",
  "agent",
  "studio",
  "generator",
  "sandbox",
  "app",
  "commerce",
  "media",
  "document",
]);

export const SecurityClassSchema = z.enum([
  "public",
  "internal",
  "sandbox",
  "isolated",
]);

// ---------------------------------------------------------------------------
// Model Aliases
// ---------------------------------------------------------------------------

export const ModelAliasSchema = z.object({
  alias: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  fallbacks: z
    .array(
      z.object({
        provider: z.string().min(1),
        model: z.string().min(1),
      }),
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Tool Mounts
// ---------------------------------------------------------------------------

export const ToolMountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  provider: z.string().min(1),
  status: z.enum(["mock", "configured", "active"]),
  configSchema: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Artifact Contracts
// ---------------------------------------------------------------------------

export const ArtifactContractSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  schema: z.record(z.unknown()).optional(),
  producedBy: z.array(z.string()),
  acceptedBy: z.array(z.string()),
});

export const StudioArtifactSchema = z.object({
  contractId: z.string().min(1),
  data: z.unknown(),
  metadata: z.object({
    sourceBlockId: z.string().min(1),
    studioId: StudioIdSchema,
    createdAt: z.string(),
    version: z.number().int().positive(),
  }),
});

// ---------------------------------------------------------------------------
// Capability Definitions
// ---------------------------------------------------------------------------

export const CapabilityDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  requiresToolMounts: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Permission Policy
// ---------------------------------------------------------------------------

export const StudioPermissionPolicySchema = z.object({
  sandboxLevel: SecurityClassSchema,
  networkAccess: z.boolean(),
  fileSystemAccess: z.boolean(),
  maxConcurrency: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Studio Manifest (Top-Level)
// ---------------------------------------------------------------------------

export const StudioManifestSchema = z.object({
  id: StudioIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  accent: z.string().min(1),
  blockIds: z.array(z.string()),
  capabilities: z.array(CapabilityDefinitionSchema),
  toolMounts: z.array(ToolMountSchema),
  artifactContracts: z.array(ArtifactContractSchema),
  modelAliases: z.array(ModelAliasSchema),
  permissions: StudioPermissionPolicySchema,
});
