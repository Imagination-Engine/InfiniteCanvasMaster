export * from "./contracts/index";

export * from "./state/canvasStore";
export * from "./state/viewportStore";
export * from "./state/connectionStore";
export * from "./state/expansionStore";

export * from "./utils/camera";

export * from "./components/InfiniteViewport";
export * from "./components/ObjectRenderer";
export * from "./components/ConnectorLayer";
export * from "./components/CanvasShell";

export * from "./hooks/useCanvasClipboard";
export * from "./hooks/useAgentOnCanvas";

import { BlockRegistry } from "./contracts/BlockRegistry";
import { NoteBlock } from "./components/blocks/NoteBlock";
import { RichTextBlock } from "./components/blocks/RichTextBlock";
import { AgentBlock } from "./components/blocks/AgentBlock";

// Register default blocks
BlockRegistry.register("note", NoteBlock as any);
BlockRegistry.register("rich-text", RichTextBlock as any);
BlockRegistry.register("agent", AgentBlock as any);

import { GoalBlock } from "./components/blocks/GoalBlock";
BlockRegistry.register("goal", GoalBlock as any);

import { ArtifactBlock } from "./components/blocks/ArtifactBlock";
import { ChatBlock } from "./components/blocks/ChatBlock";
import { MemoryClusterBlock } from "./components/blocks/MemoryClusterBlock";

BlockRegistry.register("artifact", ArtifactBlock as any);
BlockRegistry.register("chat", ChatBlock as any);
BlockRegistry.register("memory-cluster", MemoryClusterBlock as any);

import { AppBlock } from "./components/blocks/AppBlock";
BlockRegistry.register("app", AppBlock as any);

export * from "./components/BlockLibraryDrawer";

export * from "./components/ImmersiveBlockModal";

export * from "./components/FloatingOrchestratorChat";
