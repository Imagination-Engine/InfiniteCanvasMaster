export interface ChainStep {
  name: string;
  execute: (input: any) => Promise<any>;
}
export declare class ChainExecutor {
  private steps;
  constructor(steps: ChainStep[]);
  run(initialInput: any): Promise<any>;
}
//# sourceMappingURL=ChainExecutor.d.ts.map
