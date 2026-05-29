// @ts-nocheck
export * from "./contracts/index";
export * from "./contracts/openclaw";

export * from "./state/canvasStore";
export * from "./state/viewportStore";
export * from "./state/connectionStore";
export * from "./state/expansionStore";

export * from "./utils/camera";
export * from "./utils/spatialDocumentBridge";

export * from "./components/InfiniteViewport";
export * from "./components/ObjectRenderer";
export * from "./components/ConnectorLayer";
export * from "./components/CanvasShell";

export * from "./hooks/useCanvasClipboard";
export * from "./hooks/useAgentOnCanvas";

import { BlockRegistry } from "./contracts/BlockRegistry";
export { BlockRegistry };
import { NoteBlock } from "./components/blocks/NoteBlock";
import { RichTextBlock } from "./components/blocks/RichTextBlock";
import { AgentBlock } from "./components/blocks/AgentBlock";
import { GoalBlock } from "./components/blocks/GoalBlock";
import { ArtifactBlock } from "./components/blocks/ArtifactBlock";
import { ChatBlock } from "./components/blocks/ChatBlock";
import { MemoryClusterBlock } from "./components/blocks/MemoryClusterBlock";
import { AppBlock } from "./components/blocks/AppBlock";
import { STUDIO_BLOCK_REGISTRATIONS } from "./components/blocks/studio/studioBlocks";

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
BlockRegistry.register("iem.agent.blank", AgentBlock as any);

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

// Conductor Blocks
import { ConductorBlockView } from "./components/blocks/ConductorBlockView";

// Conductor Core Nodes (Short, full & trigger formats)
BlockRegistry.register("conductor.webhook", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.webhook", ConductorBlockView as any);
BlockRegistry.register("trigger.webhook", ConductorBlockView as any);

BlockRegistry.register("conductor.schedule", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.schedule", ConductorBlockView as any);
BlockRegistry.register("trigger.time", ConductorBlockView as any);

BlockRegistry.register("conductor.agent", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.agent", ConductorBlockView as any);

BlockRegistry.register("conductor.webFetch", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.webFetch", ConductorBlockView as any);

BlockRegistry.register("conductor.if", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.if", ConductorBlockView as any);
BlockRegistry.register("conductor.router", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.router", ConductorBlockView as any);

BlockRegistry.register("conductor.forEach", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.foreach", ConductorBlockView as any);

BlockRegistry.register("conductor.delay", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.delay", ConductorBlockView as any);

BlockRegistry.register("conductor.state", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.state", ConductorBlockView as any);

BlockRegistry.register("conductor.saas", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.saas", ConductorBlockView as any);

BlockRegistry.register("conductor.slackPost", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.slackPost", ConductorBlockView as any);

BlockRegistry.register("conductor.notionCreate", ConductorBlockView as any);
BlockRegistry.register("iem.conductor.notionCreate", ConductorBlockView as any);

// SaaS Integration Kinds
BlockRegistry.register("discord.post", ConductorBlockView as any);
BlockRegistry.register("slack.post", ConductorBlockView as any);
BlockRegistry.register("gmail.send", ConductorBlockView as any);
BlockRegistry.register("sheets.update", ConductorBlockView as any);
BlockRegistry.register("trello.create", ConductorBlockView as any);
BlockRegistry.register("zoom.create", ConductorBlockView as any);
BlockRegistry.register("calendly.get", ConductorBlockView as any);

for (const [blockId, Component] of STUDIO_BLOCK_REGISTRATIONS) {
  BlockRegistry.register(blockId, Component as any);
}

export * from "./components/BlockLibraryDrawer";
export * from "./components/BlockLibraryCard";

export * from "./components/ImmersiveBlockModal";

export * from "./components/FloatingOrchestratorChat";

export * from "./components/ConductorInspector";
export * from "./components/RunWorkflowBar";
