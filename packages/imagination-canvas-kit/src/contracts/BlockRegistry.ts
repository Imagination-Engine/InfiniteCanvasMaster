// @ts-nocheck
import React from "react";
import type { CanvasObject } from "./index";

export type BlockComponentProps = {
  object: CanvasObject;
  data?: any;
  onParamsChange?: (params: any) => void;
};

export type BlockComponent = React.FC<BlockComponentProps>;

export interface IBlockRegistry {
  register(kind: string, component: BlockComponent): void;
  resolve(kind: string): BlockComponent | undefined;
}

const registry = new Map<string, BlockComponent>();

export const BlockRegistry: IBlockRegistry = {
  register: (kind, component) => {
    registry.set(kind, component);
  },
  resolve: (kind) => {
    return registry.get(kind);
  },
};
