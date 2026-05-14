import {
  ConductorNode,
  ConductorRuntimeState,
  ConductorEnvelope,
  ArtifactRef,
} from "../types/runtime.js";

export type NodeExecutionResult = {
  statePatch?: Partial<ConductorRuntimeState>;
  outputs: ConductorEnvelope[];
  artifacts?: ArtifactRef[];
  logs?: any[];
};

export interface ConductorNodeExecutor {
  execute(input: {
    node: ConductorNode;
    state: ConductorRuntimeState;
    incoming: ConductorEnvelope[];
  }): Promise<NodeExecutionResult>;
}
