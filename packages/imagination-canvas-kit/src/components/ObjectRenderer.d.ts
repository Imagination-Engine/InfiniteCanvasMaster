import React from "react";
import type { CanvasObject } from "../contracts";
export type ComponentRegistry = Record<
  string,
  React.FC<{
    object?: CanvasObject;
    data?: any;
    mode?: string;
    onParamsChange?: any;
  }>
>;
export declare const ObjectRenderer: React.FC<{
  object: CanvasObject;
  registry?: ComponentRegistry;
}>;
//# sourceMappingURL=ObjectRenderer.d.ts.map
