import type { FabricRouter } from "../transport";
export declare class DurableEventAdapter {
  private router;
  constructor(router: FabricRouter);
  recordFact(runId: string, type: string, payload: any): Promise<void>;
}
//# sourceMappingURL=DurableEventAdapter.d.ts.map
