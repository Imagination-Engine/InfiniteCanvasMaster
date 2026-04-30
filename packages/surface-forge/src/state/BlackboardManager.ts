export interface BlackboardState {
  spec: Record<string, any> | null;
  design: Record<string, any> | null;
  code: Record<string, string>;
  testResults: Record<string, any> | null;
}

export class BlackboardManager {
  private state: BlackboardState;

  constructor() {
    this.state = {
      spec: null,
      design: null,
      code: {},
      testResults: null,
    };
  }

  getState(): BlackboardState {
    return this.state;
  }

  update(partialState: Partial<BlackboardState>): BlackboardState {
    // Deep merge code specifically
    const newCode = { ...this.state.code, ...(partialState.code || {}) };
    
    this.state = {
      ...this.state,
      ...partialState,
      code: newCode
    };

    return this.state;
  }
}