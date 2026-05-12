import { z } from "zod";
class BlockRegistry {
  blocks = new Map();
  register(def) {
    // Override to allow hot-reloading in dev without crashing
    this.blocks.set(def.id, def);
  }
  get(id) {
    return this.blocks.get(id);
  }
  list() {
    return Array.from(this.blocks.values());
  }
  byCategory(category) {
    return this.list().filter((b) => b.category === category);
  }
  clear() {
    this.blocks.clear();
  }
}
export const blockRegistry = new BlockRegistry();
// Helper to construct empty/dummy MCP bindings for UI-only blocks
const dummyMcp = {
  kind: "local",
  toolName: "ui-only",
  invoke: async () => ({}),
};
// ============================================================================
// PHASE 1: Populate the 65+ Required Blocks
// ============================================================================
const createBlock = (opts) => {
  blockRegistry.register({
    ...opts,
    input: opts.input || z.any(),
    output: opts.output || z.any(),
    agent: opts.agent || dummyMcp,
    mode: opts.mode || "ambient",
    capabilities: opts.capabilities || [],
    accepts: opts.accepts || [],
    produces: opts.produces || [],
    agentic: opts.agentic || false,
    runtime: opts.runtime || "none",
  });
};
// --- Intent & Planning ---
createBlock({
  id: "iem.intent.intent",
  name: "Intent Block",
  category: "Intent & Planning",
  description: "Captures the raw spark of an idea.",
  icon: "Sparkles",
  runtime: "document",
});
createBlock({
  id: "iem.intent.goal",
  name: "Goal Block",
  category: "Intent & Planning",
  description: "A measurable objective.",
  icon: "Target",
  runtime: "document",
});
createBlock({
  id: "iem.intent.task",
  name: "Task Block",
  category: "Intent & Planning",
  description: "A specific unit of work.",
  icon: "CheckSquare",
  runtime: "document",
});
createBlock({
  id: "iem.intent.milestone",
  name: "Milestone Block",
  category: "Intent & Planning",
  description: "A significant project marker.",
  icon: "Flag",
  runtime: "document",
});
createBlock({
  id: "iem.intent.requirement",
  name: "Requirement Block",
  category: "Intent & Planning",
  description: "A necessary condition for success.",
  icon: "ListChecks",
  runtime: "document",
});
createBlock({
  id: "iem.intent.decision",
  name: "Decision Block",
  category: "Intent & Planning",
  description: "A recorded architectural or creative choice.",
  icon: "GitCommit",
  runtime: "document",
});
createBlock({
  id: "iem.intent.constraint",
  name: "Constraint Block",
  category: "Intent & Planning",
  description: "A boundary condition.",
  icon: "ShieldAlert",
  runtime: "document",
});
createBlock({
  id: "iem.intent.checkpoint",
  name: "Human Checkpoint Block",
  category: "Intent & Planning",
  description: "Halts workflow until human approval.",
  icon: "Hand",
  runtime: "sandbox",
});
createBlock({
  id: "iem.intent.timeline",
  name: "Timeline Block",
  category: "Intent & Planning",
  description: "A temporal view of tasks.",
  icon: "Calendar",
  runtime: "document",
});
createBlock({
  id: "iem.intent.plan",
  name: "Plan / DAG Block",
  category: "Intent & Planning",
  description: "A compiled workflow graph.",
  icon: "Network",
  runtime: "document",
});
// --- Agents & Swarms ---
createBlock({
  id: "iem.agent.agent",
  name: "Agent Block",
  category: "Agents & Swarms",
  description: "A standard AI collaborator.",
  icon: "Bot",
  agentic: true,
  runtime: "agent",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.blank",
  name: "Blank Agent Template",
  category: "Agents & Swarms",
  description: "An unconfigured agent ready for instructions.",
  icon: "Bot",
  agentic: true,
  runtime: "agent",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.mastra",
  name: "Mastra Workflow Block",
  category: "Agents & Swarms",
  description: "A rigid, resumable graph of agentic steps.",
  icon: "Workflow",
  agentic: true,
  runtime: "sandbox",
  studio: "Automation Studio",
});
createBlock({
  id: "iem.agent.supervisor",
  name: "Supervisor Agent Block",
  category: "Agents & Swarms",
  description: "An agent that manages other agents.",
  icon: "Crown",
  agentic: true,
  runtime: "agent",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.swarm",
  name: "Agent Swarm Block",
  category: "Agents & Swarms",
  description: "A dynamic cluster of specialized agents.",
  icon: "Users",
  agentic: true,
  runtime: "sandbox",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.imagiclaw",
  name: "ImagiClaw Agent",
  category: "Agents & Swarms",
  description: "A highly capable agent with advanced computer use.",
  icon: "TerminalSquare",
  agentic: true,
  runtime: "agent",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.imagiclaw-sandbox",
  name: "ImagiClaw Sandbox",
  category: "Agents & Swarms",
  description: "An isolated environment for ImagiClaw execution.",
  icon: "Box",
  agentic: true,
  runtime: "sandbox",
  studio: "Automation Studio",
});
createBlock({
  id: "iem.agent.imagiclaw-swarm",
  name: "ImagiClaw Swarm",
  category: "Agents & Swarms",
  description: "A networked group of ImagiClaw agents.",
  icon: "Boxes",
  agentic: true,
  runtime: "sandbox",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.tool-runner",
  name: "Tool Runner Block",
  category: "Agents & Swarms",
  description: "Executes specific deterministic tools.",
  icon: "Wrench",
  agentic: true,
  runtime: "sandbox",
});
createBlock({
  id: "iem.agent.mcp",
  name: "MCP Tool Block",
  category: "Agents & Swarms",
  description: "Connects to a remote Model Context Protocol server.",
  icon: "Plug",
  runtime: "app",
});
createBlock({
  id: "iem.agent.router",
  name: "Model Router Block",
  category: "Agents & Swarms",
  description: "Dynamically routes prompts to the best LLM.",
  icon: "ArrowRightLeft",
  runtime: "sandbox",
});
createBlock({
  id: "iem.agent.researcher",
  name: "Research Agent Block",
  category: "Agents & Swarms",
  description: "Specializes in deep web and document research.",
  icon: "Search",
  agentic: true,
  runtime: "agent",
  studio: "Research Studio",
});
createBlock({
  id: "iem.agent.builder",
  name: "Builder Agent Block",
  category: "Agents & Swarms",
  description: "Specializes in scaffolding projects and files.",
  icon: "Hammer",
  agentic: true,
  runtime: "agent",
  studio: "Agent Studio",
});
createBlock({
  id: "iem.agent.code",
  name: "Code Agent Block",
  category: "Agents & Swarms",
  description: "Specializes in writing and debugging code.",
  icon: "Code2",
  agentic: true,
  runtime: "agent",
  studio: "App Creation Studio",
});
createBlock({
  id: "iem.agent.operator",
  name: "Operator Agent Block",
  category: "Agents & Swarms",
  description: "Specializes in using SaaS apps and browsers.",
  icon: "Globe",
  agentic: true,
  runtime: "agent",
  studio: "Automation Studio",
});
// --- Chat & Communication ---
createBlock({
  id: "iem.chat.chat",
  name: "Block Chat",
  category: "Chat & Communication",
  description: "A conversational interface for a specific context.",
  icon: "MessageSquare",
  runtime: "app",
});
createBlock({
  id: "iem.chat.multi",
  name: "Multi-Agent Room",
  category: "Chat & Communication",
  description: "A chat room where multiple agents converse.",
  icon: "MessagesSquare",
  runtime: "app",
});
createBlock({
  id: "iem.chat.interview",
  name: "User Interview Block",
  category: "Chat & Communication",
  description: "An agent structured to interview the human.",
  icon: "Mic",
  agentic: true,
  runtime: "agent",
});
createBlock({
  id: "iem.chat.approval",
  name: "Approval Queue Block",
  category: "Chat & Communication",
  description: "A list of actions awaiting human sign-off.",
  icon: "ThumbsUp",
  runtime: "app",
});
createBlock({
  id: "iem.chat.inbox",
  name: "Inbox Block",
  category: "Chat & Communication",
  description: "A centralized feed of messages and notifications.",
  icon: "Inbox",
  runtime: "app",
});
createBlock({
  id: "iem.chat.comment",
  name: "Comment Thread Block",
  category: "Chat & Communication",
  description: "A localized discussion thread.",
  icon: "MessageCircle",
  runtime: "document",
});
createBlock({
  id: "iem.chat.voice",
  name: "Voice Note Block",
  category: "Chat & Communication",
  description: "An audio recording with transcription.",
  icon: "Mic",
  runtime: "media",
});
createBlock({
  id: "iem.chat.notification",
  name: "Notification Block",
  category: "Chat & Communication",
  description: "A transient system alert.",
  icon: "Bell",
  runtime: "app",
});
createBlock({
  id: "iem.chat.feed",
  name: "Agent Status Feed",
  category: "Chat & Communication",
  description: "A streaming log of agent thoughts and actions.",
  icon: "Activity",
  runtime: "app",
});
createBlock({
  id: "iem.chat.orchestrator",
  name: "Canvas Orchestrator Chat",
  category: "Chat & Communication",
  description: "The primary copilot interface.",
  icon: "BrainCircuit",
  agentic: true,
  runtime: "app",
});
// --- Text & Knowledge ---
createBlock({
  id: "iem.text.note",
  name: "Note Block",
  category: "Text & Knowledge",
  description: "A simple text sticky note.",
  icon: "StickyNote",
  runtime: "document",
});
createBlock({
  id: "iem.text.rich",
  name: "Rich Document Block",
  category: "Text & Knowledge",
  description: "A full rich-text editor surface.",
  icon: "FileText",
  runtime: "document",
});
createBlock({
  id: "iem.text.markdown",
  name: "Markdown Block",
  category: "Text & Knowledge",
  description: "A markdown editor and viewer.",
  icon: "FileCode2",
  runtime: "document",
});
createBlock({
  id: "iem.text.table",
  name: "Table Block",
  category: "Text & Knowledge",
  description: "A structured data grid.",
  icon: "Table",
  runtime: "document",
});
createBlock({
  id: "iem.text.checklist",
  name: "Checklist Block",
  category: "Text & Knowledge",
  description: "A list of actionable items.",
  icon: "ListTodo",
  runtime: "document",
});
createBlock({
  id: "iem.text.code",
  name: "Code Block",
  category: "Text & Knowledge",
  description: "Syntax-highlighted code snippet.",
  icon: "Code",
  runtime: "document",
});
createBlock({
  id: "iem.text.prompt",
  name: "Prompt Block",
  category: "Text & Knowledge",
  description: "A reusable LLM prompt template.",
  icon: "Terminal",
  runtime: "document",
});
createBlock({
  id: "iem.text.citation",
  name: "Source / Citation Block",
  category: "Text & Knowledge",
  description: "A linked reference to external knowledge.",
  icon: "Quote",
  runtime: "document",
});
createBlock({
  id: "iem.text.knowledge",
  name: "Knowledge Card Block",
  category: "Text & Knowledge",
  description: "A synthesized fact or concept.",
  icon: "BookOpen",
  runtime: "document",
  studio: "Knowledge Studio",
});
createBlock({
  id: "iem.text.transcript",
  name: "Transcript Block",
  category: "Text & Knowledge",
  description: "Text generated from audio or video.",
  icon: "FileAudio",
  runtime: "document",
});
createBlock({
  id: "iem.text.brief",
  name: "Research Brief Block",
  category: "Text & Knowledge",
  description: "A compiled summary of findings.",
  icon: "Newspaper",
  runtime: "document",
  studio: "Research Studio",
});
// --- Generative Media ---
createBlock({
  id: "iem.media.image-gen",
  name: "Image Generator Block",
  category: "Generative Media",
  description: "Generates images from prompts.",
  icon: "ImagePlus",
  agentic: true,
  runtime: "generator",
  studio: "Media Studio",
});
createBlock({
  id: "iem.media.image-edit",
  name: "Image Editor Block",
  category: "Generative Media",
  description: "Tools to modify existing images.",
  icon: "Image",
  runtime: "app",
  studio: "Media Studio",
});
createBlock({
  id: "iem.media.video-gen",
  name: "Video Generator Block",
  category: "Generative Media",
  description: "Generates video clips from prompts.",
  icon: "Video",
  agentic: true,
  runtime: "generator",
  studio: "Video Studio",
});
createBlock({
  id: "iem.media.video-edit",
  name: "Video Editor Block",
  category: "Generative Media",
  description: "NLE interface for video clips.",
  icon: "Film",
  runtime: "app",
  studio: "Video Studio",
});
createBlock({
  id: "iem.media.audio-gen",
  name: "Audio Generator Block",
  category: "Generative Media",
  description: "Generates sound effects or tracks.",
  icon: "AudioLines",
  agentic: true,
  runtime: "generator",
  studio: "Media Studio",
});
createBlock({
  id: "iem.media.voice",
  name: "Voice / TTS Block",
  category: "Generative Media",
  description: "Text-to-speech generation.",
  icon: "Speech",
  agentic: true,
  runtime: "generator",
  studio: "Media Studio",
});
createBlock({
  id: "iem.media.music",
  name: "Music Block",
  category: "Generative Media",
  description: "Music generation and sequencing.",
  icon: "Music",
  agentic: true,
  runtime: "generator",
  studio: "Media Studio",
});
createBlock({
  id: "iem.media.3d",
  name: "3D Asset Block",
  category: "Generative Media",
  description: "A 3D model viewer and generator.",
  icon: "Box",
  runtime: "media",
  studio: "Game Studio",
});
createBlock({
  id: "iem.media.storyboard",
  name: "Storyboard Block",
  category: "Generative Media",
  description: "A sequential layout of scenes.",
  icon: "LayoutGrid",
  runtime: "document",
  studio: "Video Studio",
});
createBlock({
  id: "iem.media.creative",
  name: "Brand Creative Block",
  category: "Generative Media",
  description: "A composed brand asset.",
  icon: "Palette",
  runtime: "document",
  studio: "Brand Studio",
});
createBlock({
  id: "iem.media.board",
  name: "Media Asset Board",
  category: "Generative Media",
  description: "A moodboard of collected media.",
  icon: "Layout",
  runtime: "document",
  studio: "Media Studio",
});
// --- Studios ---
createBlock({
  id: "iem.studio.video",
  name: "Video Studio",
  category: "Studios",
  description: "A complete suite for video production.",
  icon: "Clapperboard",
  runtime: "studio",
  studio: "Video Studio",
});
createBlock({
  id: "iem.studio.game",
  name: "Game Studio",
  category: "Studios",
  description: "A complete suite for game development.",
  icon: "Gamepad2",
  runtime: "studio",
  studio: "Game Studio",
});
createBlock({
  id: "iem.studio.app",
  name: "App Creation Studio",
  category: "Studios",
  description: "A complete suite for building software.",
  icon: "AppWindow",
  runtime: "studio",
  studio: "App Creation Studio",
});
createBlock({
  id: "iem.studio.writer",
  name: "Writer’s Studio",
  category: "Studios",
  description: "A complete suite for narrative design.",
  icon: "PenTool",
  runtime: "studio",
  studio: "Writer’s Studio",
});
createBlock({
  id: "iem.studio.launch",
  name: "Launch Studio",
  category: "Studios",
  description: "A complete suite for marketing and deployment.",
  icon: "Rocket",
  runtime: "studio",
  studio: "Launch Studio",
});
createBlock({
  id: "iem.studio.research",
  name: "Research Studio",
  category: "Studios",
  description: "A complete suite for deep investigation.",
  icon: "Microscope",
  runtime: "studio",
  studio: "Research Studio",
});
createBlock({
  id: "iem.studio.commerce",
  name: "Commerce Studio",
  category: "Studios",
  description: "A complete suite for storefronts and sales.",
  icon: "Store",
  runtime: "studio",
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.studio.knowledge",
  name: "Knowledge Studio",
  category: "Studios",
  description: "A complete suite for organizing information.",
  icon: "Library",
  runtime: "studio",
  studio: "Knowledge Studio",
});
createBlock({
  id: "iem.studio.automation",
  name: "Automation Studio",
  category: "Studios",
  description: "A complete suite for workflow pipelines.",
  icon: "Settings2",
  runtime: "studio",
  studio: "Automation Studio",
});
createBlock({
  id: "iem.studio.brand",
  name: "Brand Studio",
  category: "Studios",
  description: "A complete suite for brand identity.",
  icon: "Award",
  runtime: "studio",
  studio: "Brand Studio",
});
createBlock({
  id: "iem.studio.saas",
  name: "SaaS Builder Studio",
  category: "Studios",
  description: "A complete suite for multi-tenant software.",
  icon: "Building2",
  runtime: "studio",
  studio: "App Creation Studio",
});
createBlock({
  id: "iem.studio.world",
  name: "World Builder Studio",
  category: "Studios",
  description: "A complete suite for lore and environment design.",
  icon: "Globe2",
  runtime: "studio",
  studio: "Game Studio",
});
// --- Runtime & Apps ---
createBlock({
  id: "iem.app.iframe",
  name: "Iframe Block",
  category: "Runtime & Apps",
  description: "An embedded web page.",
  icon: "Window",
  runtime: "app",
});
createBlock({
  id: "iem.app.web",
  name: "Web App Block",
  category: "Runtime & Apps",
  description: "A hosted web application.",
  icon: "Laptop",
  runtime: "app",
});
createBlock({
  id: "iem.app.game",
  name: "Game Runtime Block",
  category: "Runtime & Apps",
  description: "An executable game engine surface.",
  icon: "Play",
  runtime: "app",
  studio: "Game Studio",
});
createBlock({
  id: "iem.app.simulation",
  name: "Simulation Block",
  category: "Runtime & Apps",
  description: "An interactive physics or data simulation.",
  icon: "Dna",
  runtime: "app",
});
createBlock({
  id: "iem.app.terminal",
  name: "Terminal Block",
  category: "Runtime & Apps",
  description: "A command-line interface.",
  icon: "TerminalSquare",
  runtime: "app",
});
createBlock({
  id: "iem.app.browser",
  name: "Browser Block",
  category: "Runtime & Apps",
  description: "A headless browser view.",
  icon: "Chrome",
  runtime: "app",
});
createBlock({
  id: "iem.app.api",
  name: "API Tester Block",
  category: "Runtime & Apps",
  description: "An interface to test network requests.",
  icon: "Network",
  runtime: "app",
});
createBlock({
  id: "iem.app.db",
  name: "Database View Block",
  category: "Runtime & Apps",
  description: "A queryable view into structured data.",
  icon: "Database",
  runtime: "app",
});
createBlock({
  id: "iem.app.dashboard",
  name: "Dashboard Block",
  category: "Runtime & Apps",
  description: "A collection of metrics and charts.",
  icon: "LayoutDashboard",
  runtime: "app",
});
createBlock({
  id: "iem.app.files",
  name: "File Workspace Block",
  category: "Runtime & Apps",
  description: "A file system explorer.",
  icon: "FolderTree",
  runtime: "app",
});
createBlock({
  id: "iem.app.code-workspace",
  name: "Code Workspace Block",
  category: "Runtime & Apps",
  description: "A full IDE surface.",
  icon: "Code2",
  runtime: "app",
  studio: "App Creation Studio",
});
createBlock({
  id: "iem.app.preview",
  name: "Live Preview Block",
  category: "Runtime & Apps",
  description: "A real-time render of code or media.",
  icon: "MonitorPlay",
  runtime: "app",
});
// --- Commerce & Intentcasting ---
createBlock({
  id: "iem.commerce.wallet",
  name: "Wallet Block",
  category: "Commerce & Intentcasting",
  description: "Identity and funds.",
  icon: "Wallet",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.checkout",
  name: "Checkout Block",
  category: "Commerce & Intentcasting",
  description: "A transaction flow.",
  icon: "CreditCard",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.payment",
  name: "Payment Flow Block",
  category: "Commerce & Intentcasting",
  description: "A sequence of payment steps.",
  icon: "CircleDollarSign",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.offer",
  name: "Offer Block",
  category: "Commerce & Intentcasting",
  description: "A proposed exchange of value.",
  icon: "Tag",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.intentcast",
  name: "Intentcasting Block",
  category: "Commerce & Intentcasting",
  description: "Broadcasting a desire to the market.",
  icon: "Radio",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.brand-response",
  name: "Brand Response Block",
  category: "Commerce & Intentcasting",
  description: "An automated reply from a brand agent.",
  icon: "MessageSquareHeart",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.negotiation",
  name: "Negotiation Block",
  category: "Commerce & Intentcasting",
  description: "A multi-party agreement flow.",
  icon: "Handshake",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.storefront",
  name: "Storefront Block",
  category: "Commerce & Intentcasting",
  description: "A collection of offers.",
  icon: "Store",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.product",
  name: "Product Block",
  category: "Commerce & Intentcasting",
  description: "A discrete item for sale.",
  icon: "Package",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.digital-asset",
  name: "Digital Asset Sale Block",
  category: "Commerce & Intentcasting",
  description: "A flow for selling digital goods.",
  icon: "FileKey",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.creator",
  name: "Creator Commerce Block",
  category: "Commerce & Intentcasting",
  description: "A unified portal for creator sales.",
  icon: "Star",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
createBlock({
  id: "iem.commerce.cart",
  name: "Sovereign Cart Block",
  category: "Commerce & Intentcasting",
  description: "A portable shopping cart.",
  icon: "ShoppingCart",
  runtime: "commerce",
  demoMode: true,
  studio: "Commerce Studio",
});
// --- Files & Data ---
createBlock({
  id: "iem.data.file",
  name: "File Block",
  category: "Files & Data",
  description: "A single uploaded file.",
  icon: "File",
  runtime: "document",
});
createBlock({
  id: "iem.data.dropzone",
  name: "Upload Dropzone Block",
  category: "Files & Data",
  description: "An area to drag and drop assets.",
  icon: "UploadCloud",
  runtime: "app",
});
createBlock({
  id: "iem.data.dataset",
  name: "Dataset Block",
  category: "Files & Data",
  description: "A collection of structured data.",
  icon: "Database",
  runtime: "document",
});
createBlock({
  id: "iem.data.csv",
  name: "CSV/Table Import Block",
  category: "Files & Data",
  description: "A flow for ingesting tabular data.",
  icon: "Sheet",
  runtime: "app",
});
createBlock({
  id: "iem.data.pod",
  name: "Knowledge Pod Block",
  category: "Files & Data",
  description: "An isolated vector database of context.",
  icon: "BoxSelect",
  runtime: "app",
  studio: "Knowledge Studio",
});
createBlock({
  id: "iem.data.stream",
  name: "Research Stream Block",
  category: "Files & Data",
  description: "A live feed of incoming data.",
  icon: "ActivitySquare",
  runtime: "app",
  studio: "Research Studio",
});
createBlock({
  id: "iem.data.cluster",
  name: "Memory Cluster Block",
  category: "Files & Data",
  description: "A grouped set of related facts.",
  icon: "Brain",
  runtime: "document",
  studio: "Knowledge Studio",
});
createBlock({
  id: "iem.data.artifact",
  name: "Artifact Block",
  category: "Files & Data",
  description: "A finalized piece of generated output.",
  icon: "Gem",
  runtime: "document",
});
createBlock({
  id: "iem.data.provenance",
  name: "Provenance / Origin Trail Block",
  category: "Files & Data",
  description: "A cryptographically secure log of creation.",
  icon: "Link",
  runtime: "document",
  demoMode: true,
});
createBlock({
  id: "iem.data.view",
  name: "Data View Block",
  category: "Files & Data",
  description: "A specialized lens into a dataset.",
  icon: "Eye",
  runtime: "app",
});
// --- System & Utility ---
createBlock({
  id: "iem.sys.timer",
  name: "Timer Block",
  category: "System & Utility",
  description: "A countdown or stopwatch.",
  icon: "Timer",
  runtime: "app",
});
createBlock({
  id: "iem.sys.monitor",
  name: "Status Monitor Block",
  category: "System & Utility",
  description: "Observability for workflows.",
  icon: "Activity",
  runtime: "app",
});
createBlock({
  id: "iem.sys.settings",
  name: "Settings Block",
  category: "System & Utility",
  description: "Configuration for the canvas or studio.",
  icon: "Settings",
  runtime: "app",
});
createBlock({
  id: "iem.sys.env",
  name: "Environment Block",
  category: "System & Utility",
  description: "Secrets and variables.",
  icon: "Key",
  runtime: "app",
});
createBlock({
  id: "iem.sys.trace",
  name: "Debug Trace Block",
  category: "System & Utility",
  description: "A deep log of execution.",
  icon: "Bug",
  runtime: "app",
});
createBlock({
  id: "iem.sys.log",
  name: "Workflow Log Block",
  category: "System & Utility",
  description: "A human-readable log of events.",
  icon: "ScrollText",
  runtime: "app",
});
createBlock({
  id: "iem.sys.event-stream",
  name: "Event Stream Block",
  category: "System & Utility",
  description: "A live pipe of message fabric events.",
  icon: "Rss",
  runtime: "app",
});
createBlock({
  id: "iem.sys.compiler",
  name: "Output Compiler Block",
  category: "System & Utility",
  description: "Gathers artifacts into a final format.",
  icon: "Combine",
  runtime: "sandbox",
});
createBlock({
  id: "iem.sys.runner",
  name: "Canvas Runner Block",
  category: "System & Utility",
  description: "Executes the DAG logic of the canvas.",
  icon: "PlaySquare",
  runtime: "sandbox",
});
createBlock({
  id: "iem.sys.export",
  name: "Export Block",
  category: "System & Utility",
  description: "Saves canvas state to external formats.",
  icon: "DownloadCloud",
  runtime: "app",
});
