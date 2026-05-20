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
export declare const StudioIdSchema: z.ZodEnum<
  [
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
  ]
>;
export declare const RuntimeReadinessSchema: z.ZodEnum<
  ["ready", "degraded", "unavailable", "configuring"]
>;
export declare const RuntimeKindSchema: z.ZodEnum<
  [
    "none",
    "agent",
    "studio",
    "generator",
    "sandbox",
    "app",
    "commerce",
    "media",
    "document",
  ]
>;
export declare const SecurityClassSchema: z.ZodEnum<
  ["public", "internal", "sandbox", "isolated"]
>;
export declare const ModelAliasSchema: z.ZodObject<
  {
    alias: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    fallbacks: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            provider: z.ZodString;
            model: z.ZodString;
          },
          "strip",
          z.ZodTypeAny,
          {
            model: string;
            provider: string;
          },
          {
            model: string;
            provider: string;
          }
        >,
        "many"
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    model: string;
    alias: string;
    provider: string;
    fallbacks?:
      | {
          model: string;
          provider: string;
        }[]
      | undefined;
  },
  {
    model: string;
    alias: string;
    provider: string;
    fallbacks?:
      | {
          model: string;
          provider: string;
        }[]
      | undefined;
  }
>;
export declare const ToolMountSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    provider: z.ZodString;
    status: z.ZodEnum<["mock", "configured", "active"]>;
    configSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    status: "mock" | "configured" | "active";
    id: string;
    description: string;
    name: string;
    provider: string;
    configSchema?: Record<string, unknown> | undefined;
  },
  {
    status: "mock" | "configured" | "active";
    id: string;
    description: string;
    name: string;
    provider: string;
    configSchema?: Record<string, unknown> | undefined;
  }
>;
export declare const ArtifactContractSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    mimeType: z.ZodString;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    producedBy: z.ZodArray<z.ZodString, "many">;
    acceptedBy: z.ZodArray<z.ZodString, "many">;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    name: string;
    mimeType: string;
    producedBy: string[];
    acceptedBy: string[];
    schema?: Record<string, unknown> | undefined;
  },
  {
    id: string;
    name: string;
    mimeType: string;
    producedBy: string[];
    acceptedBy: string[];
    schema?: Record<string, unknown> | undefined;
  }
>;
export declare const StudioArtifactSchema: z.ZodObject<
  {
    contractId: z.ZodString;
    data: z.ZodUnknown;
    metadata: z.ZodObject<
      {
        sourceBlockId: z.ZodString;
        studioId: z.ZodEnum<
          [
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
          ]
        >;
        createdAt: z.ZodString;
        version: z.ZodNumber;
      },
      "strip",
      z.ZodTypeAny,
      {
        version: number;
        sourceBlockId: string;
        studioId:
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
        createdAt: string;
      },
      {
        version: number;
        sourceBlockId: string;
        studioId:
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
        createdAt: string;
      }
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    metadata: {
      version: number;
      sourceBlockId: string;
      studioId:
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
      createdAt: string;
    };
    contractId: string;
    data?: unknown;
  },
  {
    metadata: {
      version: number;
      sourceBlockId: string;
      studioId:
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
      createdAt: string;
    };
    contractId: string;
    data?: unknown;
  }
>;
export declare const CapabilityDefinitionSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    requiresToolMounts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    name: string;
    requiresToolMounts?: string[] | undefined;
  },
  {
    id: string;
    description: string;
    name: string;
    requiresToolMounts?: string[] | undefined;
  }
>;
export declare const StudioPermissionPolicySchema: z.ZodObject<
  {
    sandboxLevel: z.ZodEnum<["public", "internal", "sandbox", "isolated"]>;
    networkAccess: z.ZodBoolean;
    fileSystemAccess: z.ZodBoolean;
    maxConcurrency: z.ZodNumber;
  },
  "strip",
  z.ZodTypeAny,
  {
    sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
    networkAccess: boolean;
    fileSystemAccess: boolean;
    maxConcurrency: number;
  },
  {
    sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
    networkAccess: boolean;
    fileSystemAccess: boolean;
    maxConcurrency: number;
  }
>;
export declare const StudioManifestSchema: z.ZodObject<
  {
    id: z.ZodEnum<
      [
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
      ]
    >;
    name: z.ZodString;
    description: z.ZodString;
    icon: z.ZodString;
    accent: z.ZodString;
    blockIds: z.ZodArray<z.ZodString, "many">;
    capabilities: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          description: z.ZodString;
          requiresToolMounts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        },
        "strip",
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          name: string;
          requiresToolMounts?: string[] | undefined;
        },
        {
          id: string;
          description: string;
          name: string;
          requiresToolMounts?: string[] | undefined;
        }
      >,
      "many"
    >;
    toolMounts: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          description: z.ZodString;
          provider: z.ZodString;
          status: z.ZodEnum<["mock", "configured", "active"]>;
          configSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          status: "mock" | "configured" | "active";
          id: string;
          description: string;
          name: string;
          provider: string;
          configSchema?: Record<string, unknown> | undefined;
        },
        {
          status: "mock" | "configured" | "active";
          id: string;
          description: string;
          name: string;
          provider: string;
          configSchema?: Record<string, unknown> | undefined;
        }
      >,
      "many"
    >;
    artifactContracts: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          mimeType: z.ZodString;
          schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          producedBy: z.ZodArray<z.ZodString, "many">;
          acceptedBy: z.ZodArray<z.ZodString, "many">;
        },
        "strip",
        z.ZodTypeAny,
        {
          id: string;
          name: string;
          mimeType: string;
          producedBy: string[];
          acceptedBy: string[];
          schema?: Record<string, unknown> | undefined;
        },
        {
          id: string;
          name: string;
          mimeType: string;
          producedBy: string[];
          acceptedBy: string[];
          schema?: Record<string, unknown> | undefined;
        }
      >,
      "many"
    >;
    modelAliases: z.ZodArray<
      z.ZodObject<
        {
          alias: z.ZodString;
          provider: z.ZodString;
          model: z.ZodString;
          fallbacks: z.ZodOptional<
            z.ZodArray<
              z.ZodObject<
                {
                  provider: z.ZodString;
                  model: z.ZodString;
                },
                "strip",
                z.ZodTypeAny,
                {
                  model: string;
                  provider: string;
                },
                {
                  model: string;
                  provider: string;
                }
              >,
              "many"
            >
          >;
        },
        "strip",
        z.ZodTypeAny,
        {
          model: string;
          alias: string;
          provider: string;
          fallbacks?:
            | {
                model: string;
                provider: string;
              }[]
            | undefined;
        },
        {
          model: string;
          alias: string;
          provider: string;
          fallbacks?:
            | {
                model: string;
                provider: string;
              }[]
            | undefined;
        }
      >,
      "many"
    >;
    permissions: z.ZodObject<
      {
        sandboxLevel: z.ZodEnum<["public", "internal", "sandbox", "isolated"]>;
        networkAccess: z.ZodBoolean;
        fileSystemAccess: z.ZodBoolean;
        maxConcurrency: z.ZodNumber;
      },
      "strip",
      z.ZodTypeAny,
      {
        sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
        networkAccess: boolean;
        fileSystemAccess: boolean;
        maxConcurrency: number;
      },
      {
        sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
        networkAccess: boolean;
        fileSystemAccess: boolean;
        maxConcurrency: number;
      }
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    id:
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
    capabilities: {
      id: string;
      description: string;
      name: string;
      requiresToolMounts?: string[] | undefined;
    }[];
    description: string;
    name: string;
    icon: string;
    accent: string;
    blockIds: string[];
    toolMounts: {
      status: "mock" | "configured" | "active";
      id: string;
      description: string;
      name: string;
      provider: string;
      configSchema?: Record<string, unknown> | undefined;
    }[];
    artifactContracts: {
      id: string;
      name: string;
      mimeType: string;
      producedBy: string[];
      acceptedBy: string[];
      schema?: Record<string, unknown> | undefined;
    }[];
    modelAliases: {
      model: string;
      alias: string;
      provider: string;
      fallbacks?:
        | {
            model: string;
            provider: string;
          }[]
        | undefined;
    }[];
    permissions: {
      sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
      networkAccess: boolean;
      fileSystemAccess: boolean;
      maxConcurrency: number;
    };
  },
  {
    id:
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
    capabilities: {
      id: string;
      description: string;
      name: string;
      requiresToolMounts?: string[] | undefined;
    }[];
    description: string;
    name: string;
    icon: string;
    accent: string;
    blockIds: string[];
    toolMounts: {
      status: "mock" | "configured" | "active";
      id: string;
      description: string;
      name: string;
      provider: string;
      configSchema?: Record<string, unknown> | undefined;
    }[];
    artifactContracts: {
      id: string;
      name: string;
      mimeType: string;
      producedBy: string[];
      acceptedBy: string[];
      schema?: Record<string, unknown> | undefined;
    }[];
    modelAliases: {
      model: string;
      alias: string;
      provider: string;
      fallbacks?:
        | {
            model: string;
            provider: string;
          }[]
        | undefined;
    }[];
    permissions: {
      sandboxLevel: "sandbox" | "public" | "internal" | "isolated";
      networkAccess: boolean;
      fileSystemAccess: boolean;
      maxConcurrency: number;
    };
  }
>;
//# sourceMappingURL=schemas.d.ts.map
