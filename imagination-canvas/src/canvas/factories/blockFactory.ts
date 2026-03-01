/**
 * block.factory.ts — Factory function for creating new CanvasBlockNode instances.
 *
 * This is the only place in the codebase where new blocks should be instantiated.
 * Both AI agents and the UI sidebar call `createBlock()` to get a fully-formed node
 * with all required fields pre-populated and sensible defaults.
 *
 * Why a factory instead of inline construction:
 *   - Guarantees every block has valid metadata, permissions, and content shape
 *   - Centralises ID generation (uuid v4 prefixed with block type for debuggability)
 *   - DEFAULT_CONTENT ensures blocks are always in a renderable state, even before
 *     an agent or user has populated them
 */

import { v4 as uuidv4 } from "uuid";
import type {
  BlockType,
  BlockContentMap,
  BlockData,
  AgentContext,
  CanvasBlockNode,
} from "../types/blockTypes";

/**
 * Default empty content for each block type.
 * Ensures a block is always in a valid, renderable state even before
 * an agent or user has populated it.
 */
const DEFAULT_CONTENT: { [T in BlockType]: BlockContentMap[T] } = {
  content:      { document: "", format: "markdown" },
  code:         { source: "", language: "python", dependencies: [] },
  image:        { imageUrl: "", format: "png" },
  video:        { videoUrl: "", format: "mp4" },
  chat:         { messages: [] },
  sandbox:      { environmentVars: {} },
  browser:      { url: "" },
  product:      { name: "" },
  datatable:    { columns: [], rows: [] },
  listicle:     { items: [] },
  aigenerative: { prompt: "", outputType: "text" },
  audio:        { audioUrl: "", duration: "0:00" },
  group:        {},
};

/**
 * Creates a new CanvasBlockNode with all required fields populated.
 * Agents call this when generating blocks; the UI calls it when a user
 * manually adds a block from the sidebar.
 *
 * @param type      - The block type to create
 * @param overrides - Partial overrides for position, metadata, content, etc.
 * @returns A fully-formed CanvasBlockNode ready to add to React Flow
 */
export function createBlock<T extends BlockType>(
  type: T,
  overrides: {
    id?:           string;
    position?:     { x: number; y: number };
    title?:        string;
    createdBy?:    string;
    content?:      Partial<BlockContentMap[T]>;
    agentContext?: AgentContext;
    color?:        string;
  } = {},
): CanvasBlockNode<T> {
  const now = new Date().toISOString();

  const defaultContent = DEFAULT_CONTENT[type] as BlockContentMap[T];
  const mergedContent = overrides.content
    ? { ...defaultContent, ...overrides.content }
    : defaultContent;

  const blockData: BlockData<T> = {
    status: "idle",
    metadata: {
      title:          overrides.title ?? "",
      createdAt:      now,
      lastModifiedAt: now,
      createdBy:      overrides.createdBy ?? "user",
      version:        1,
      tags:           [],
      color:          overrides.color,
    },
    content:      mergedContent,
    agentContext: overrides.agentContext ?? null,
    permissions: {
      ownerId:    "",
      sharedWith: [],
      readOnly:   false,
    },
  };

  return {
    id:       overrides.id ?? `${type}-${uuidv4()}`,
    type,
    position: overrides.position ?? { x: 0, y: 0 },
    data:     blockData,
  };
}
