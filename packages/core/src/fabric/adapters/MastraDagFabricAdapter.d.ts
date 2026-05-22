import type { FabricRouter } from "../transport";
export declare class MastraDagFabricAdapter {
  private router;
  private runId;
  private traceId;
  constructor(router: FabricRouter, runId: string, traceId: string);
  emitWorkflowStarted(input: any): Promise<void>;
  emitNodeOutput(nodeId: string, output: any): Promise<void>;
}
//# sourceMappingURL=MastraDagFabricAdapter.d.ts.map
