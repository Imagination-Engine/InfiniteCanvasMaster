// @ts-nocheck
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
import { GoalBlock } from "./components/blocks/GoalBlock";
import { ArtifactBlock } from "./components/blocks/ArtifactBlock";
import { ChatBlock } from "./components/blocks/ChatBlock";
import { MemoryClusterBlock } from "./components/blocks/MemoryClusterBlock";
import { AppBlock } from "./components/blocks/AppBlock";

// Register default blocks with both short and full IDs
BlockRegistry.register("note", NoteBlock as any);
BlockRegistry.register("iem.text.note", NoteBlock as any);

BlockRegistry.register("rich-text", RichTextBlock as any);
BlockRegistry.register("iem.text.rich", RichTextBlock as any);

BlockRegistry.register("agent", AgentBlock as any);
BlockRegistry.register("iem.agent.agent", AgentBlock as any);
BlockRegistry.register("iem.agent.researcher", AgentBlock as any);
BlockRegistry.register("iem.agent.builder", AgentBlock as any);
BlockRegistry.register("iem.agent.code", AgentBlock as any);

BlockRegistry.register("goal", GoalBlock as any);
BlockRegistry.register("iem.intent.goal", GoalBlock as any);

BlockRegistry.register("artifact", ArtifactBlock as any);
BlockRegistry.register("iem.data.artifact", ArtifactBlock as any);

BlockRegistry.register("chat", ChatBlock as any);
BlockRegistry.register("iem.chat.chat", ChatBlock as any);
BlockRegistry.register("iem.chat.orchestrator", ChatBlock as any);

BlockRegistry.register("memory-cluster", MemoryClusterBlock as any);
BlockRegistry.register("iem.data.cluster", MemoryClusterBlock as any);

BlockRegistry.register("app", AppBlock as any);
BlockRegistry.register("iem.app.web", AppBlock as any);
BlockRegistry.register("iem.app.iframe", AppBlock as any);

export * from "./components/BlockLibraryDrawer";

export * from "./components/ImmersiveBlockModal";

export * from "./components/FloatingOrchestratorChat";
