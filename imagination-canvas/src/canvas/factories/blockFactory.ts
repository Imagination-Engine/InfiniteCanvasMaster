/**
 * block.factory.ts — Factory function for creating new CanvasBlockNode instances.
 *
 * This is the only place in the codebase where new blocks should be instantiated.
 * Both AI agents and the UI sidebar call `createBlock()` to get a fully-formed node
 * with all required fields pre-populated and sensible defaults.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  BlockType,
  BlockDataMap,
  BlockData,
  CanvasBlockNode,
  BlockCapabilities,
  BlockMeta,
} from "../types/blockTypes";

/**
 * Default empty state data for each block type.
 */
const DEFAULT_STATE_DATA: { [T in BlockType]: BlockDataMap[T] } = {
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
 * Default capabilities for each block type.
 * In a real system, this might come from a static registry or database.
 */
const DEFAULT_CAPABILITIES: { [T in BlockType]: BlockCapabilities } = {
  content: {
    inputs: [
      { name: "content", type: "text/markdown", required: false }
    ],
    outputs: [
      { name: "content", type: "text/markdown", required: false }
    ],
    supported_triggers: ["manual"],
    execution_mode: "sync",
    llm_routing: "none",
  },
  code: {
    inputs: [
      { name: "code", type: "text/code", required: false },
      { name: "input_data", type: "*/*", required: false }
    ],
    outputs: [
      { name: "result", type: "*/*", required: false }
    ],
    supported_triggers: ["manual", "upstream"],
    execution_mode: "async",
    llm_routing: "none", // or prefer_local if it writes code
  },
  image: {
    inputs: [
      { name: "image", type: "image/*", required: true }
    ],
    outputs: [
      { name: "image", type: "image/*", required: false }
    ],
    supported_triggers: ["manual"],
    execution_mode: "sync",
    llm_routing: "none",
  },
  // Default fallback for others for now
  video: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  chat: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "streaming", llm_routing: "prefer_local" },
  sandbox: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "async", llm_routing: "none" },
  product: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  browser: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  datatable: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  listicle: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  aigenerative: {
    inputs: [{ name: "prompt", type: "text/plain", required: true }],
    outputs: [{ name: "output", type: "text/plain", required: true }],
    supported_triggers: ["manual", "upstream"],
    execution_mode: "async",
    llm_routing: "external"
  },
  audio: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
  group: { inputs: [], outputs: [], supported_triggers: [], execution_mode: "sync", llm_routing: "none" },
};

/**
 * Creates a new CanvasBlockNode with all required fields populated.
 */
export function createBlock<T extends BlockType>(
  type: T,
  overrides: {
    id?:           string;
    position?:     { x: number; y: number };
    title?:        string; // mapped to meta.label
    createdBy?:    string;
    data?:         Partial<BlockDataMap[T]>;
    config?:       Record<string, any>;
    color?:        string;
  } = {},
): CanvasBlockNode<T> {
  const now = new Date().toISOString();

  // Merge default state data with overrides
  const defaultState = DEFAULT_STATE_DATA[type] as BlockDataMap[T];
  const mergedStateData = overrides.data
    ? { ...defaultState, ...overrides.data }
    : defaultState;

  // Metadata
  const meta: BlockMeta = {
    label:        overrides.title ?? `New ${type}`,
    created_at:   now,
    updated_at:   now,
    created_by:   overrides.createdBy ?? "user",
    author:       overrides.createdBy ?? "user",
    version:      1,
    tags:         [],
    color:        overrides.color,
  };

  const blockData: BlockData<T> = {
    version: "1.0.0",
    meta,
    capabilities: DEFAULT_CAPABILITIES[type],
    state: {
      status: "idle",
      data: mergedStateData,
      last_run: null,
    },
    extensions: {
      config: overrides.config ?? {},
    },
  };

  return {
    id:       overrides.id ?? `${type}-${uuidv4()}`,
    type,
    position: overrides.position ?? { x: 0, y: 0 },
    data:     blockData,
  };
}
