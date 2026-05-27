import { crypto } from "node:crypto";

export interface FunctionDef {
  functionId: string;
  canvasId: string;
  name: string;
  globalAccess: boolean;
  inputs: string[];
}

export class FunctionRegistry {
  private static functions = new Map<string, FunctionDef>();

  public static register(def: Omit<FunctionDef, "functionId">): string {
    // Generate a unique dynamic ID starting with fn_
    const functionId = `fn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.functions.set(functionId, {
      ...def,
      functionId,
    });
    return functionId;
  }

  public static get(functionId: string): FunctionDef | undefined {
    return this.functions.get(functionId);
  }

  public static clear(): void {
    this.functions.clear();
  }
}
