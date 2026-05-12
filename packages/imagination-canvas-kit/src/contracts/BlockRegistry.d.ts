import React from "react";
import type { CanvasObject } from "./index";
export type BlockComponentProps = {
  object: CanvasObject;
  data?: any;
  mode?: "compact" | "fullscreen" | "side-panel";
  onParamsChange?: (params: any) => void;
};
export type BlockComponent = React.FC<BlockComponentProps>;
export interface IBlockRegistry {
  register(kind: string, component: BlockComponent): void;
  resolve(kind: string): BlockComponent | undefined;
}
export declare const BlockRegistry: IBlockRegistry;
//# sourceMappingURL=BlockRegistry.d.ts.map
