/**
 * Hook providing canvas-aware context to the Orchestrator.
 */
export declare function useOrchestratorContext(): {
  selectedBlockId: string | null;
  selectedBlock:
    | {
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
      }
    | {
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
      }
    | {
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
      }
    | {
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
      }
    | null;
  lastDroppedBlockId: string | null;
  lastDroppedBlock:
    | {
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
      }
    | {
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
      }
    | {
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
      }
    | {
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
      }
    | null;
  allObjects: Record<
    string,
    | {
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
      }
    | {
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
      }
    | {
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
      }
    | {
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
      }
  >;
  sessionContext: string | null;
};
//# sourceMappingURL=useOrchestratorContext.d.ts.map
