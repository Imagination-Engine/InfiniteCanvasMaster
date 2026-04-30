import React from "react";
import type { ComponentType } from "react";
import type { BlockViewProps } from "@iem/core";

export type BlockViewComponent = ComponentType<BlockViewProps<any, any>>;

class ViewRegistry {
  private views = new Map<string, BlockViewComponent>();

  register(blockId: string, component: BlockViewComponent) {
    this.views.set(blockId, component);
  }

  get(blockId: string): BlockViewComponent | undefined {
    return this.views.get(blockId);
  }

  list(): string[] {
    return Array.from(this.views.keys());
  }
}

export const viewRegistry = new ViewRegistry();

/**
 * Hook to get a block view component by ID
 */
export function useBlockView(blockId: string): BlockViewComponent | undefined {
  return viewRegistry.get(blockId);
}
