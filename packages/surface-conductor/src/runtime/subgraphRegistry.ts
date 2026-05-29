export interface SubGraphDef {
  graphId: string;
  canvasId: string;
  name: string;
  globalAccess: boolean;
}

export class SubGraphRegistry {
  private static subGraphs = new Map<string, SubGraphDef>();

  public static register(def: Omit<SubGraphDef, "graphId">): string {
    const graphId = `sg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.subGraphs.set(graphId, {
      ...def,
      graphId,
    });
    return graphId;
  }

  public static get(graphId: string): SubGraphDef | undefined {
    return this.subGraphs.get(graphId);
  }

  public static clear(): void {
    this.subGraphs.clear();
  }
}
