import { z } from "zod";
/**
 * Descriptor for agent/system provenance.
 */
export declare const ProvenanceDescriptorSchema: z.ZodEffects<
  z.ZodObject<
    {
      source: z.ZodEnum<["user", "agent", "system"]>;
      agentId: z.ZodOptional<z.ZodString>;
      model: z.ZodOptional<z.ZodString>;
      prompt: z.ZodOptional<z.ZodString>;
      timestamp: z.ZodString;
      confidence: z.ZodOptional<z.ZodNumber>;
    },
    "strip",
    z.ZodTypeAny,
    {
      source: "system" | "user" | "agent";
      timestamp: string;
      model?: string | undefined;
      prompt?: string | undefined;
      agentId?: string | undefined;
      confidence?: number | undefined;
    },
    {
      source: "system" | "user" | "agent";
      timestamp: string;
      model?: string | undefined;
      prompt?: string | undefined;
      agentId?: string | undefined;
      confidence?: number | undefined;
    }
  >,
  {
    source: "system" | "user" | "agent";
    timestamp: string;
    model?: string | undefined;
    prompt?: string | undefined;
    agentId?: string | undefined;
    confidence?: number | undefined;
  },
  {
    source: "system" | "user" | "agent";
    timestamp: string;
    model?: string | undefined;
    prompt?: string | undefined;
    agentId?: string | undefined;
    confidence?: number | undefined;
  }
>;
export type ProvenanceDescriptor = z.infer<typeof ProvenanceDescriptorSchema>;
/**
 * Descriptor for block expansion state.
 */
export declare const ExpansionDescriptorSchema: z.ZodObject<
  {
    mode: z.ZodEnum<
      [
        "none",
        "peek",
        "inline-expanded",
        "side-panel",
        "focus-region",
        "modal",
        "fullscreen",
        "route",
        "presentation",
      ]
    >;
    surfaceId: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    mode:
      | "none"
      | "peek"
      | "inline-expanded"
      | "side-panel"
      | "focus-region"
      | "modal"
      | "fullscreen"
      | "route"
      | "presentation";
    surfaceId?: string | undefined;
    config?: Record<string, any> | undefined;
  },
  {
    mode:
      | "none"
      | "peek"
      | "inline-expanded"
      | "side-panel"
      | "focus-region"
      | "modal"
      | "fullscreen"
      | "route"
      | "presentation";
    surfaceId?: string | undefined;
    config?: Record<string, any> | undefined;
  }
>;
export type ExpansionDescriptor = z.infer<typeof ExpansionDescriptorSchema>;
/**
 * Capabilities of a canvas block.
 */
export declare const CanvasBlockCapabilitiesSchema: z.ZodObject<
  {
    canMove: z.ZodOptional<z.ZodBoolean>;
    canResize: z.ZodOptional<z.ZodBoolean>;
    canRotate: z.ZodOptional<z.ZodBoolean>;
    canEditInline: z.ZodOptional<z.ZodBoolean>;
    canExpand: z.ZodOptional<z.ZodBoolean>;
    canConfigure: z.ZodOptional<z.ZodBoolean>;
    canConnect: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  {
    canMove?: boolean | undefined;
    canResize?: boolean | undefined;
    canRotate?: boolean | undefined;
    canEditInline?: boolean | undefined;
    canExpand?: boolean | undefined;
    canConfigure?: boolean | undefined;
    canConnect?: boolean | undefined;
  },
  {
    canMove?: boolean | undefined;
    canResize?: boolean | undefined;
    canRotate?: boolean | undefined;
    canEditInline?: boolean | undefined;
    canExpand?: boolean | undefined;
    canConfigure?: boolean | undefined;
    canConnect?: boolean | undefined;
  }
>;
export type CanvasBlockCapabilities = z.infer<
  typeof CanvasBlockCapabilitiesSchema
>;
/**
 * States of a canvas object.
 */
export declare const CanvasObjectStateSchema: z.ZodEnum<
  [
    "idle",
    "selected",
    "hovered",
    "editing",
    "generating",
    "thinking",
    "waiting-for-user",
    "running",
    "complete",
    "error",
    "paused",
    "locked",
  ]
>;
export type CanvasObjectState = z.infer<typeof CanvasObjectStateSchema>;
/**
 * Base properties for all canvas objects.
 */
export declare const BaseCanvasObjectSchema: z.ZodObject<
  {
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    zIndex: z.ZodDefault<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<
      z.ZodEnum<
        [
          "idle",
          "selected",
          "hovered",
          "editing",
          "generating",
          "thinking",
          "waiting-for-user",
          "running",
          "complete",
          "error",
          "paused",
          "locked",
        ]
      >
    >;
    capabilities: z.ZodDefault<
      z.ZodObject<
        {
          canMove: z.ZodOptional<z.ZodBoolean>;
          canResize: z.ZodOptional<z.ZodBoolean>;
          canRotate: z.ZodOptional<z.ZodBoolean>;
          canEditInline: z.ZodOptional<z.ZodBoolean>;
          canExpand: z.ZodOptional<z.ZodBoolean>;
          canConfigure: z.ZodOptional<z.ZodBoolean>;
          canConnect: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        },
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      >
    >;
    provenance: z.ZodOptional<
      z.ZodEffects<
        z.ZodObject<
          {
            source: z.ZodEnum<["user", "agent", "system"]>;
            agentId: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            prompt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            confidence: z.ZodOptional<z.ZodNumber>;
          },
          "strip",
          z.ZodTypeAny,
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          },
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        },
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      >
    >;
    expansion: z.ZodOptional<
      z.ZodObject<
        {
          mode: z.ZodEnum<
            [
              "none",
              "peek",
              "inline-expanded",
              "side-panel",
              "focus-region",
              "modal",
              "fullscreen",
              "route",
              "presentation",
            ]
          >;
          surfaceId: z.ZodOptional<z.ZodString>;
          config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        },
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      >
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    capabilities: {
      canMove?: boolean | undefined;
      canResize?: boolean | undefined;
      canRotate?: boolean | undefined;
      canEditInline?: boolean | undefined;
      canExpand?: boolean | undefined;
      canConfigure?: boolean | undefined;
      canConnect?: boolean | undefined;
    };
    status:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked";
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  },
  {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    capabilities?:
      | {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      | undefined;
    status?:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked"
      | undefined;
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    zIndex?: number | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  }
>;
export type BaseCanvasObject = z.infer<typeof BaseCanvasObjectSchema>;
/**
 * Specific block types.
 */
export declare const NoteObjectSchema: z.ZodObject<
  {
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    zIndex: z.ZodDefault<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<
      z.ZodEnum<
        [
          "idle",
          "selected",
          "hovered",
          "editing",
          "generating",
          "thinking",
          "waiting-for-user",
          "running",
          "complete",
          "error",
          "paused",
          "locked",
        ]
      >
    >;
    capabilities: z.ZodDefault<
      z.ZodObject<
        {
          canMove: z.ZodOptional<z.ZodBoolean>;
          canResize: z.ZodOptional<z.ZodBoolean>;
          canRotate: z.ZodOptional<z.ZodBoolean>;
          canEditInline: z.ZodOptional<z.ZodBoolean>;
          canExpand: z.ZodOptional<z.ZodBoolean>;
          canConfigure: z.ZodOptional<z.ZodBoolean>;
          canConnect: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        },
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      >
    >;
    provenance: z.ZodOptional<
      z.ZodEffects<
        z.ZodObject<
          {
            source: z.ZodEnum<["user", "agent", "system"]>;
            agentId: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            prompt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            confidence: z.ZodOptional<z.ZodNumber>;
          },
          "strip",
          z.ZodTypeAny,
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          },
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        },
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      >
    >;
    expansion: z.ZodOptional<
      z.ZodObject<
        {
          mode: z.ZodEnum<
            [
              "none",
              "peek",
              "inline-expanded",
              "side-panel",
              "focus-region",
              "modal",
              "fullscreen",
              "route",
              "presentation",
            ]
          >;
          surfaceId: z.ZodOptional<z.ZodString>;
          config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        },
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      >
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  } & {
    type: z.ZodLiteral<"block">;
    blockKind: z.ZodLiteral<"note">;
    data: z.ZodObject<
      {
        content: z.ZodString;
      },
      "strip",
      z.ZodTypeAny,
      {
        content: string;
      },
      {
        content: string;
      }
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    data: {
      content: string;
    };
    type: "block";
    capabilities: {
      canMove?: boolean | undefined;
      canResize?: boolean | undefined;
      canRotate?: boolean | undefined;
      canEditInline?: boolean | undefined;
      canExpand?: boolean | undefined;
      canConfigure?: boolean | undefined;
      canConnect?: boolean | undefined;
    };
    status:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked";
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    blockKind: "note";
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  },
  {
    id: string;
    data: {
      content: string;
    };
    type: "block";
    x: number;
    y: number;
    width: number;
    height: number;
    blockKind: "note";
    capabilities?:
      | {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      | undefined;
    status?:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked"
      | undefined;
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    zIndex?: number | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  }
>;
export type NoteObject = z.infer<typeof NoteObjectSchema>;
export declare const AgentBlockObjectSchema: z.ZodObject<
  {
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    zIndex: z.ZodDefault<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<
      z.ZodEnum<
        [
          "idle",
          "selected",
          "hovered",
          "editing",
          "generating",
          "thinking",
          "waiting-for-user",
          "running",
          "complete",
          "error",
          "paused",
          "locked",
        ]
      >
    >;
    capabilities: z.ZodDefault<
      z.ZodObject<
        {
          canMove: z.ZodOptional<z.ZodBoolean>;
          canResize: z.ZodOptional<z.ZodBoolean>;
          canRotate: z.ZodOptional<z.ZodBoolean>;
          canEditInline: z.ZodOptional<z.ZodBoolean>;
          canExpand: z.ZodOptional<z.ZodBoolean>;
          canConfigure: z.ZodOptional<z.ZodBoolean>;
          canConnect: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        },
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      >
    >;
    provenance: z.ZodOptional<
      z.ZodEffects<
        z.ZodObject<
          {
            source: z.ZodEnum<["user", "agent", "system"]>;
            agentId: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            prompt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            confidence: z.ZodOptional<z.ZodNumber>;
          },
          "strip",
          z.ZodTypeAny,
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          },
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        },
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      >
    >;
    expansion: z.ZodOptional<
      z.ZodObject<
        {
          mode: z.ZodEnum<
            [
              "none",
              "peek",
              "inline-expanded",
              "side-panel",
              "focus-region",
              "modal",
              "fullscreen",
              "route",
              "presentation",
            ]
          >;
          surfaceId: z.ZodOptional<z.ZodString>;
          config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        },
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      >
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  } & {
    type: z.ZodLiteral<"block">;
    blockKind: z.ZodLiteral<"agent">;
    agentId: z.ZodString;
    role: z.ZodString;
    instructions: z.ZodOptional<z.ZodString>;
    tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    type: "block";
    role: string;
    capabilities: {
      canMove?: boolean | undefined;
      canResize?: boolean | undefined;
      canRotate?: boolean | undefined;
      canEditInline?: boolean | undefined;
      canExpand?: boolean | undefined;
      canConfigure?: boolean | undefined;
      canConnect?: boolean | undefined;
    };
    status:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked";
    agentId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    blockKind: "agent";
    metadata?: Record<string, any> | undefined;
    tools?: string[] | undefined;
    instructions?: string | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  },
  {
    id: string;
    type: "block";
    role: string;
    agentId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    blockKind: "agent";
    capabilities?:
      | {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      | undefined;
    status?:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked"
      | undefined;
    metadata?: Record<string, any> | undefined;
    tools?: string[] | undefined;
    instructions?: string | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    zIndex?: number | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  }
>;
export type AgentBlockObject = z.infer<typeof AgentBlockObjectSchema>;
/**
 * Union of all supported canvas objects.
 */
export declare const CanvasObjectSchema: z.ZodUnion<
  [
    z.ZodObject<
      {
        type: z.ZodLiteral<"shape">;
        shapeType: z.ZodEnum<["rectangle", "circle", "arrow"]>;
      } & {
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        zIndex: z.ZodDefault<z.ZodNumber>;
        parentId: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<
          z.ZodEnum<
            [
              "idle",
              "selected",
              "hovered",
              "editing",
              "generating",
              "thinking",
              "waiting-for-user",
              "running",
              "complete",
              "error",
              "paused",
              "locked",
            ]
          >
        >;
        capabilities: z.ZodDefault<
          z.ZodObject<
            {
              canMove: z.ZodOptional<z.ZodBoolean>;
              canResize: z.ZodOptional<z.ZodBoolean>;
              canRotate: z.ZodOptional<z.ZodBoolean>;
              canEditInline: z.ZodOptional<z.ZodBoolean>;
              canExpand: z.ZodOptional<z.ZodBoolean>;
              canConfigure: z.ZodOptional<z.ZodBoolean>;
              canConnect: z.ZodOptional<z.ZodBoolean>;
            },
            "strip",
            z.ZodTypeAny,
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            },
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          >
        >;
        provenance: z.ZodOptional<
          z.ZodEffects<
            z.ZodObject<
              {
                source: z.ZodEnum<["user", "agent", "system"]>;
                agentId: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                prompt: z.ZodOptional<z.ZodString>;
                timestamp: z.ZodString;
                confidence: z.ZodOptional<z.ZodNumber>;
              },
              "strip",
              z.ZodTypeAny,
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              },
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              }
            >,
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            },
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          >
        >;
        expansion: z.ZodOptional<
          z.ZodObject<
            {
              mode: z.ZodEnum<
                [
                  "none",
                  "peek",
                  "inline-expanded",
                  "side-panel",
                  "focus-region",
                  "modal",
                  "fullscreen",
                  "route",
                  "presentation",
                ]
              >;
              surfaceId: z.ZodOptional<z.ZodString>;
              config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            },
            "strip",
            z.ZodTypeAny,
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            },
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          >
        >;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
      },
      "strip",
      z.ZodTypeAny,
      {
        id: string;
        type: "shape";
        capabilities: {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        };
        status:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked";
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex: number;
        shapeType: "rectangle" | "circle" | "arrow";
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      },
      {
        id: string;
        type: "shape";
        x: number;
        y: number;
        width: number;
        height: number;
        shapeType: "rectangle" | "circle" | "arrow";
        capabilities?:
          | {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          | undefined;
        status?:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked"
          | undefined;
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        zIndex?: number | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      }
    >,
    z.ZodObject<
      {
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        zIndex: z.ZodDefault<z.ZodNumber>;
        parentId: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<
          z.ZodEnum<
            [
              "idle",
              "selected",
              "hovered",
              "editing",
              "generating",
              "thinking",
              "waiting-for-user",
              "running",
              "complete",
              "error",
              "paused",
              "locked",
            ]
          >
        >;
        capabilities: z.ZodDefault<
          z.ZodObject<
            {
              canMove: z.ZodOptional<z.ZodBoolean>;
              canResize: z.ZodOptional<z.ZodBoolean>;
              canRotate: z.ZodOptional<z.ZodBoolean>;
              canEditInline: z.ZodOptional<z.ZodBoolean>;
              canExpand: z.ZodOptional<z.ZodBoolean>;
              canConfigure: z.ZodOptional<z.ZodBoolean>;
              canConnect: z.ZodOptional<z.ZodBoolean>;
            },
            "strip",
            z.ZodTypeAny,
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            },
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          >
        >;
        provenance: z.ZodOptional<
          z.ZodEffects<
            z.ZodObject<
              {
                source: z.ZodEnum<["user", "agent", "system"]>;
                agentId: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                prompt: z.ZodOptional<z.ZodString>;
                timestamp: z.ZodString;
                confidence: z.ZodOptional<z.ZodNumber>;
              },
              "strip",
              z.ZodTypeAny,
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              },
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              }
            >,
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            },
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          >
        >;
        expansion: z.ZodOptional<
          z.ZodObject<
            {
              mode: z.ZodEnum<
                [
                  "none",
                  "peek",
                  "inline-expanded",
                  "side-panel",
                  "focus-region",
                  "modal",
                  "fullscreen",
                  "route",
                  "presentation",
                ]
              >;
              surfaceId: z.ZodOptional<z.ZodString>;
              config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            },
            "strip",
            z.ZodTypeAny,
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            },
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          >
        >;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
      } & {
        type: z.ZodLiteral<"block">;
        blockKind: z.ZodLiteral<"note">;
        data: z.ZodObject<
          {
            content: z.ZodString;
          },
          "strip",
          z.ZodTypeAny,
          {
            content: string;
          },
          {
            content: string;
          }
        >;
      },
      "strip",
      z.ZodTypeAny,
      {
        id: string;
        data: {
          content: string;
        };
        type: "block";
        capabilities: {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        };
        status:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked";
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex: number;
        blockKind: "note";
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      },
      {
        id: string;
        data: {
          content: string;
        };
        type: "block";
        x: number;
        y: number;
        width: number;
        height: number;
        blockKind: "note";
        capabilities?:
          | {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          | undefined;
        status?:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked"
          | undefined;
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        zIndex?: number | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      }
    >,
    z.ZodObject<
      {
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        zIndex: z.ZodDefault<z.ZodNumber>;
        parentId: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<
          z.ZodEnum<
            [
              "idle",
              "selected",
              "hovered",
              "editing",
              "generating",
              "thinking",
              "waiting-for-user",
              "running",
              "complete",
              "error",
              "paused",
              "locked",
            ]
          >
        >;
        capabilities: z.ZodDefault<
          z.ZodObject<
            {
              canMove: z.ZodOptional<z.ZodBoolean>;
              canResize: z.ZodOptional<z.ZodBoolean>;
              canRotate: z.ZodOptional<z.ZodBoolean>;
              canEditInline: z.ZodOptional<z.ZodBoolean>;
              canExpand: z.ZodOptional<z.ZodBoolean>;
              canConfigure: z.ZodOptional<z.ZodBoolean>;
              canConnect: z.ZodOptional<z.ZodBoolean>;
            },
            "strip",
            z.ZodTypeAny,
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            },
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          >
        >;
        provenance: z.ZodOptional<
          z.ZodEffects<
            z.ZodObject<
              {
                source: z.ZodEnum<["user", "agent", "system"]>;
                agentId: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                prompt: z.ZodOptional<z.ZodString>;
                timestamp: z.ZodString;
                confidence: z.ZodOptional<z.ZodNumber>;
              },
              "strip",
              z.ZodTypeAny,
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              },
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              }
            >,
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            },
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          >
        >;
        expansion: z.ZodOptional<
          z.ZodObject<
            {
              mode: z.ZodEnum<
                [
                  "none",
                  "peek",
                  "inline-expanded",
                  "side-panel",
                  "focus-region",
                  "modal",
                  "fullscreen",
                  "route",
                  "presentation",
                ]
              >;
              surfaceId: z.ZodOptional<z.ZodString>;
              config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            },
            "strip",
            z.ZodTypeAny,
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            },
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          >
        >;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
      } & {
        type: z.ZodLiteral<"block">;
        blockKind: z.ZodLiteral<"agent">;
        agentId: z.ZodString;
        role: z.ZodString;
        instructions: z.ZodOptional<z.ZodString>;
        tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      },
      "strip",
      z.ZodTypeAny,
      {
        id: string;
        type: "block";
        role: string;
        capabilities: {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        };
        status:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked";
        agentId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex: number;
        blockKind: "agent";
        metadata?: Record<string, any> | undefined;
        tools?: string[] | undefined;
        instructions?: string | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      },
      {
        id: string;
        type: "block";
        role: string;
        agentId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        blockKind: "agent";
        capabilities?:
          | {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          | undefined;
        status?:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked"
          | undefined;
        metadata?: Record<string, any> | undefined;
        tools?: string[] | undefined;
        instructions?: string | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        zIndex?: number | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      }
    >,
    z.ZodObject<
      {
        type: z.ZodLiteral<"block">;
        blockKind: z.ZodEnum<
          [
            "artifact",
            "goal",
            "app",
            "chat",
            "memory-cluster",
            "research-stream",
          ]
        >;
      } & {
        id: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        zIndex: z.ZodDefault<z.ZodNumber>;
        parentId: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<
          z.ZodEnum<
            [
              "idle",
              "selected",
              "hovered",
              "editing",
              "generating",
              "thinking",
              "waiting-for-user",
              "running",
              "complete",
              "error",
              "paused",
              "locked",
            ]
          >
        >;
        capabilities: z.ZodDefault<
          z.ZodObject<
            {
              canMove: z.ZodOptional<z.ZodBoolean>;
              canResize: z.ZodOptional<z.ZodBoolean>;
              canRotate: z.ZodOptional<z.ZodBoolean>;
              canEditInline: z.ZodOptional<z.ZodBoolean>;
              canExpand: z.ZodOptional<z.ZodBoolean>;
              canConfigure: z.ZodOptional<z.ZodBoolean>;
              canConnect: z.ZodOptional<z.ZodBoolean>;
            },
            "strip",
            z.ZodTypeAny,
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            },
            {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          >
        >;
        provenance: z.ZodOptional<
          z.ZodEffects<
            z.ZodObject<
              {
                source: z.ZodEnum<["user", "agent", "system"]>;
                agentId: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                prompt: z.ZodOptional<z.ZodString>;
                timestamp: z.ZodString;
                confidence: z.ZodOptional<z.ZodNumber>;
              },
              "strip",
              z.ZodTypeAny,
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              },
              {
                source: "system" | "user" | "agent";
                timestamp: string;
                model?: string | undefined;
                prompt?: string | undefined;
                agentId?: string | undefined;
                confidence?: number | undefined;
              }
            >,
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            },
            {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          >
        >;
        expansion: z.ZodOptional<
          z.ZodObject<
            {
              mode: z.ZodEnum<
                [
                  "none",
                  "peek",
                  "inline-expanded",
                  "side-panel",
                  "focus-region",
                  "modal",
                  "fullscreen",
                  "route",
                  "presentation",
                ]
              >;
              surfaceId: z.ZodOptional<z.ZodString>;
              config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            },
            "strip",
            z.ZodTypeAny,
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            },
            {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          >
        >;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
      },
      "strip",
      z.ZodTypeAny,
      {
        id: string;
        type: "block";
        capabilities: {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        };
        status:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked";
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex: number;
        blockKind:
          | "app"
          | "artifact"
          | "goal"
          | "chat"
          | "memory-cluster"
          | "research-stream";
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      },
      {
        id: string;
        type: "block";
        x: number;
        y: number;
        width: number;
        height: number;
        blockKind:
          | "app"
          | "artifact"
          | "goal"
          | "chat"
          | "memory-cluster"
          | "research-stream";
        capabilities?:
          | {
              canMove?: boolean | undefined;
              canResize?: boolean | undefined;
              canRotate?: boolean | undefined;
              canEditInline?: boolean | undefined;
              canExpand?: boolean | undefined;
              canConfigure?: boolean | undefined;
              canConnect?: boolean | undefined;
            }
          | undefined;
        status?:
          | "error"
          | "idle"
          | "selected"
          | "hovered"
          | "editing"
          | "generating"
          | "thinking"
          | "waiting-for-user"
          | "running"
          | "complete"
          | "paused"
          | "locked"
          | undefined;
        metadata?: Record<string, any> | undefined;
        provenance?:
          | {
              source: "system" | "user" | "agent";
              timestamp: string;
              model?: string | undefined;
              prompt?: string | undefined;
              agentId?: string | undefined;
              confidence?: number | undefined;
            }
          | undefined;
        parentId?: string | undefined;
        zIndex?: number | undefined;
        expansion?:
          | {
              mode:
                | "none"
                | "peek"
                | "inline-expanded"
                | "side-panel"
                | "focus-region"
                | "modal"
                | "fullscreen"
                | "route"
                | "presentation";
              surfaceId?: string | undefined;
              config?: Record<string, any> | undefined;
            }
          | undefined;
      }
    >,
  ]
>;
export type CanvasObject = z.infer<typeof CanvasObjectSchema>;
/**
 * A connection between two objects.
 */
export declare const CanvasConnectionSchema: z.ZodObject<
  {
    id: z.ZodString;
    sourceId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["semantic", "flow", "data"]>>;
    label: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    type: "data" | "semantic" | "flow";
    sourceId: string;
    targetId: string;
    metadata?: Record<string, any> | undefined;
    label?: string | undefined;
  },
  {
    id: string;
    sourceId: string;
    targetId: string;
    type?: "data" | "semantic" | "flow" | undefined;
    metadata?: Record<string, any> | undefined;
    label?: string | undefined;
  }
>;
export type CanvasConnection = z.infer<typeof CanvasConnectionSchema>;
/**
 * A persistent behavioral relationship.
 */
export declare const CanvasBindingSchema: z.ZodObject<
  {
    id: z.ZodString;
    actorId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodEnum<["follow", "stick", "observe", "lock-to"]>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    type: "follow" | "stick" | "observe" | "lock-to";
    targetId: string;
    actorId: string;
    metadata?: Record<string, any> | undefined;
    config?: Record<string, any> | undefined;
  },
  {
    id: string;
    type: "follow" | "stick" | "observe" | "lock-to";
    targetId: string;
    actorId: string;
    metadata?: Record<string, any> | undefined;
    config?: Record<string, any> | undefined;
  }
>;
export type CanvasBinding = z.infer<typeof CanvasBindingSchema>;
/**
 * The state of the infinite viewport.
 */
export declare const CanvasViewportSchema: z.ZodObject<
  {
    x: z.ZodNumber;
    y: z.ZodNumber;
    zoom: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
  },
  "strip",
  z.ZodTypeAny,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  },
  {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  }
>;
export type CanvasViewport = z.infer<typeof CanvasViewportSchema>;
/**
 * Current selection state.
 */
export declare const CanvasSelectionSchema: z.ZodObject<
  {
    objectIds: z.ZodArray<z.ZodString, "many">;
    marquee: z.ZodOptional<
      z.ZodObject<
        {
          startX: z.ZodNumber;
          startY: z.ZodNumber;
          endX: z.ZodNumber;
          endY: z.ZodNumber;
        },
        "strip",
        z.ZodTypeAny,
        {
          startX: number;
          startY: number;
          endX: number;
          endY: number;
        },
        {
          startX: number;
          startY: number;
          endX: number;
          endY: number;
        }
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    objectIds: string[];
    marquee?:
      | {
          startX: number;
          startY: number;
          endX: number;
          endY: number;
        }
      | undefined;
  },
  {
    objectIds: string[];
    marquee?:
      | {
          startX: number;
          startY: number;
          endX: number;
          endY: number;
        }
      | undefined;
  }
>;
export type CanvasSelection = z.infer<typeof CanvasSelectionSchema>;
/**
 * Events occurring on the canvas.
 */
export declare const CanvasEventSchema: z.ZodObject<
  {
    type: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodAny;
  },
  "strip",
  z.ZodTypeAny,
  {
    type: string;
    timestamp: string;
    payload?: any;
  },
  {
    type: string;
    timestamp: string;
    payload?: any;
  }
>;
export type CanvasEvent = z.infer<typeof CanvasEventSchema>;
/**
 * Legacy/Simple CanvasBlock for compatibility (if needed).
 */
export declare const CanvasBlockSchema: z.ZodObject<
  {
    id: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    zIndex: z.ZodDefault<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<
      z.ZodEnum<
        [
          "idle",
          "selected",
          "hovered",
          "editing",
          "generating",
          "thinking",
          "waiting-for-user",
          "running",
          "complete",
          "error",
          "paused",
          "locked",
        ]
      >
    >;
    capabilities: z.ZodDefault<
      z.ZodObject<
        {
          canMove: z.ZodOptional<z.ZodBoolean>;
          canResize: z.ZodOptional<z.ZodBoolean>;
          canRotate: z.ZodOptional<z.ZodBoolean>;
          canEditInline: z.ZodOptional<z.ZodBoolean>;
          canExpand: z.ZodOptional<z.ZodBoolean>;
          canConfigure: z.ZodOptional<z.ZodBoolean>;
          canConnect: z.ZodOptional<z.ZodBoolean>;
        },
        "strip",
        z.ZodTypeAny,
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        },
        {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      >
    >;
    provenance: z.ZodOptional<
      z.ZodEffects<
        z.ZodObject<
          {
            source: z.ZodEnum<["user", "agent", "system"]>;
            agentId: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            prompt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            confidence: z.ZodOptional<z.ZodNumber>;
          },
          "strip",
          z.ZodTypeAny,
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          },
          {
            source: "system" | "user" | "agent";
            timestamp: string;
            model?: string | undefined;
            prompt?: string | undefined;
            agentId?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        },
        {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      >
    >;
    expansion: z.ZodOptional<
      z.ZodObject<
        {
          mode: z.ZodEnum<
            [
              "none",
              "peek",
              "inline-expanded",
              "side-panel",
              "focus-region",
              "modal",
              "fullscreen",
              "route",
              "presentation",
            ]
          >;
          surfaceId: z.ZodOptional<z.ZodString>;
          config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        },
        {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      >
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  } & {
    type: z.ZodLiteral<"block">;
    blockType: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    data: Record<string, any>;
    type: "block";
    capabilities: {
      canMove?: boolean | undefined;
      canResize?: boolean | undefined;
      canRotate?: boolean | undefined;
      canEditInline?: boolean | undefined;
      canExpand?: boolean | undefined;
      canConfigure?: boolean | undefined;
      canConnect?: boolean | undefined;
    };
    status:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked";
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    blockType: string;
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  },
  {
    id: string;
    data: Record<string, any>;
    type: "block";
    x: number;
    y: number;
    width: number;
    height: number;
    blockType: string;
    capabilities?:
      | {
          canMove?: boolean | undefined;
          canResize?: boolean | undefined;
          canRotate?: boolean | undefined;
          canEditInline?: boolean | undefined;
          canExpand?: boolean | undefined;
          canConfigure?: boolean | undefined;
          canConnect?: boolean | undefined;
        }
      | undefined;
    status?:
      | "error"
      | "idle"
      | "selected"
      | "hovered"
      | "editing"
      | "generating"
      | "thinking"
      | "waiting-for-user"
      | "running"
      | "complete"
      | "paused"
      | "locked"
      | undefined;
    metadata?: Record<string, any> | undefined;
    provenance?:
      | {
          source: "system" | "user" | "agent";
          timestamp: string;
          model?: string | undefined;
          prompt?: string | undefined;
          agentId?: string | undefined;
          confidence?: number | undefined;
        }
      | undefined;
    parentId?: string | undefined;
    zIndex?: number | undefined;
    expansion?:
      | {
          mode:
            | "none"
            | "peek"
            | "inline-expanded"
            | "side-panel"
            | "focus-region"
            | "modal"
            | "fullscreen"
            | "route"
            | "presentation";
          surfaceId?: string | undefined;
          config?: Record<string, any> | undefined;
        }
      | undefined;
  }
>;
export type CanvasBlock = z.infer<typeof CanvasBlockSchema>;
//# sourceMappingURL=index.d.ts.map
