// @ts-nocheck
export interface ChainStep {
  name: string;
  execute: (input: any) => Promise<any>;
}

export class ChainExecutor {
  constructor(private steps: ChainStep[]) {}

  async run(initialInput: any): Promise<any> {
    let currentInput = initialInput;

    for (const step of this.steps) {
      try {
        currentInput = await step.execute(currentInput);
      } catch (error: any) {
        throw new Error(`Chain execution failed at step ${step.name}: ${error.message}`);
      }
    }

    return currentInput;
  }
}