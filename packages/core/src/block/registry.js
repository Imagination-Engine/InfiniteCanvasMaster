import { z } from "zod";
// ---------------------------------------------------------------------------
// Map legacy studio strings to canonical StudioId values
// ---------------------------------------------------------------------------
const STUDIO_LEGACY_MAP = {
  "Agent Studio": "agent-studio",
  "Video Studio": "video-studio",
  "Game Studio": "game-studio",
  "Writer's Studio": "writers-studio",
  "Writer\u2019s Studio": "writers-studio",
  "App Creation Studio": "app-creation-studio",
  "Commerce Studio": "commerce-studio",
  "Research Studio": "research-studio",
  "Knowledge Studio": "knowledge-studio",
  "Launch Studio": "launch-studio",
  "Media Studio": "media-studio",
  "Automation Studio": "automation-studio",
  "Brand Studio": "brand-studio",
};
// ---------------------------------------------------------------------------
// Registry Class
// ---------------------------------------------------------------------------
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
  /** Return blocks belonging to a studio (checks both legacy and canonical) */
  byStudio(studioId) {
    return this.list().filter((b) => {
      if (b.studioAffinity) {
        return Array.isArray(b.studioAffinity)
          ? b.studioAffinity.includes(studioId)
          : b.studioAffinity === studioId;
      }
      return false;
    });
  }
  /** Return blocks that produce a given artifact type */
  byProduces(artifactType) {
    return this.list().filter((b) => b.produces?.includes(artifactType));
  }
  /** Return blocks that accept a given artifact type */
  byAccepts(artifactType) {
    return this.list().filter((b) => b.accepts?.includes(artifactType));
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
// ---------------------------------------------------------------------------
// Auto-infer securityClass from runtime kind when not explicitly set
// ---------------------------------------------------------------------------
function inferSecurityClass(runtime) {
  switch (runtime) {
    case "sandbox":
      return "sandbox";
    case "agent":
      return "sandbox";
    case "commerce":
      return "internal";
    case "generator":
      return "sandbox";
    case "studio":
      return "internal";
    case "app":
      return "internal";
    default:
      return "public";
  }
}
// ============================================================================
// Block Registration Helper
// ============================================================================
const createBlock = (opts) => {
  // Auto-wire studioAffinity from legacy studio field if not set
  const studioAffinity =
    opts.studioAffinity ||
    (opts.studio ? STUDIO_LEGACY_MAP[opts.studio] : undefined);
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
    studioAffinity,
    securityClass: opts.securityClass || inferSecurityClass(opts.runtime),
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
  accepts: ["text", "prompt"],
  produces: ["intent", "text"],
  capabilities: ["intent-capture"],
});
createBlock({
  id: "iem.intent.goal",
  name: "Goal Block",
  category: "Intent & Planning",
  description: "A measurable objective.",
  icon: "Target",
  runtime: "document",
  accepts: ["intent", "text"],
  produces: ["goal", "text"],
  capabilities: ["goal-definition"],
});
createBlock({
  id: "iem.intent.task",
  name: "Task Block",
  category: "Intent & Planning",
  description: "A specific unit of work.",
  icon: "CheckSquare",
  runtime: "document",
  accepts: ["goal", "intent", "text"],
  produces: ["task", "text"],
  capabilities: ["task-management"],
});
createBlock({
  id: "iem.intent.milestone",
  name: "Milestone Block",
  category: "Intent & Planning",
  description: "A significant project marker.",
  icon: "Flag",
  runtime: "document",
  accepts: ["task", "goal", "text"],
  produces: ["milestone", "text"],
  capabilities: ["milestone-tracking"],
});
createBlock({
  id: "iem.intent.requirement",
  name: "Requirement Block",
  category: "Intent & Planning",
  description: "A necessary condition for success.",
  icon: "ListChecks",
  runtime: "document",
  accepts: ["goal", "intent", "text"],
  produces: ["requirement", "text"],
  capabilities: ["requirement-definition"],
});
createBlock({
  id: "iem.intent.decision",
  name: "Decision Block",
  category: "Intent & Planning",
  description: "A recorded architectural or creative choice.",
  icon: "GitCommit",
  runtime: "document",
  accepts: ["text", "requirement", "goal"],
  produces: ["decision", "text"],
  capabilities: ["decision-recording"],
});
createBlock({
  id: "iem.intent.constraint",
  name: "Constraint Block",
  category: "Intent & Planning",
  description: "A boundary condition.",
  icon: "ShieldAlert",
  runtime: "document",
  accepts: ["text", "requirement"],
  produces: ["constraint", "text"],
  capabilities: ["constraint-definition"],
});
createBlock({
  id: "iem.intent.checkpoint",
  name: "Human Checkpoint Block",
  category: "Intent & Planning",
  description: "Halts workflow until human approval.",
  icon: "Hand",
  runtime: "sandbox",
  accepts: ["any"],
  produces: ["approval", "any"],
  capabilities: ["human-in-the-loop"],
});
createBlock({
  id: "iem.intent.timeline",
  name: "Timeline Block",
  category: "Intent & Planning",
  description: "A temporal view of tasks.",
  icon: "Calendar",
  runtime: "document",
  accepts: ["task", "milestone", "goal"],
  produces: ["timeline", "text"],
  capabilities: ["timeline-visualization"],
});
createBlock({
  id: "iem.intent.plan",
  name: "Plan / DAG Block",
  category: "Intent & Planning",
  description: "A compiled workflow graph.",
  icon: "Network",
  runtime: "document",
  accepts: ["task", "goal", "intent", "requirement"],
  produces: ["workflow", "dag", "text"],
  capabilities: ["workflow-compilation"],
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
createBlock({
  id: "iem.reel.textToImage",
  name: "Text to Image",
  category: "Generative Media",
  description: "Generate a reference still from a text prompt.",
  icon: "Image",
  runtime: "media",
  studio: "Video Studio",
});
createBlock({
  id: "iem.reel.character",
  name: "Reel Character",
  category: "Generative Media",
  description: "Character reference for reel production.",
  icon: "User",
  runtime: "media",
  studio: "Video Studio",
});
createBlock({
  id: "iem.reel.scene",
  name: "Reel Scene",
  category: "Generative Media",
  description: "Scene layout for reel production.",
  icon: "Clapperboard",
  runtime: "media",
  studio: "Video Studio",
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
// ============================================================================
// Block Data Enrichment — Normalization Pass (Track 3)
//
// Rather than modifying every createBlock call above, this declarative map
// patches each block with its correct accepts/produces/capabilities data.
// The createBlock helper already auto-wires studioAffinity and securityClass
// from the legacy `studio` and `runtime` fields.
// ============================================================================
const BLOCK_DATA_ENRICHMENT = {
  // --- Agents & Swarms ---
  "iem.agent.agent": {
    accepts: ["prompt", "text", "config"],
    produces: ["text", "data", "any"],
    capabilities: ["text-generation", "tool-use", "reasoning"],
  },
  "iem.agent.blank": {
    accepts: ["prompt", "config"],
    produces: ["text", "any"],
    capabilities: ["configurable-agent"],
  },
  "iem.agent.mastra": {
    accepts: ["workflow", "config", "data"],
    produces: ["data", "text", "any"],
    capabilities: ["workflow-execution", "resumable-graph"],
  },
  "iem.agent.supervisor": {
    accepts: ["prompt", "task", "config"],
    produces: ["text", "task", "data"],
    capabilities: ["agent-management", "delegation"],
  },
  "iem.agent.swarm": {
    accepts: ["prompt", "task"],
    produces: ["text", "data", "any"],
    capabilities: ["parallel-execution", "swarm-intelligence"],
  },
  "iem.agent.imagiclaw": {
    accepts: ["prompt", "text", "config"],
    produces: ["text", "code", "data", "file"],
    capabilities: ["computer-use", "code-generation", "tool-use"],
  },
  "iem.agent.imagiclaw-sandbox": {
    accepts: ["prompt", "code", "config"],
    produces: ["text", "code", "file", "data"],
    capabilities: ["sandboxed-execution", "computer-use"],
  },
  "iem.agent.imagiclaw-swarm": {
    accepts: ["prompt", "task"],
    produces: ["text", "code", "data"],
    capabilities: ["parallel-execution", "computer-use"],
  },
  "iem.agent.tool-runner": {
    accepts: ["config", "data"],
    produces: ["data", "any"],
    capabilities: ["tool-execution"],
  },
  "iem.agent.mcp": {
    accepts: ["config", "prompt"],
    produces: ["data", "any"],
    capabilities: ["mcp-integration", "remote-tool-use"],
  },
  "iem.agent.router": {
    accepts: ["prompt", "text"],
    produces: ["text", "prompt"],
    capabilities: ["model-routing", "llm-selection"],
  },
  "iem.agent.researcher": {
    accepts: ["prompt", "text", "url"],
    produces: ["text", "research-brief", "citation"],
    capabilities: ["web-research", "document-analysis"],
  },
  "iem.agent.builder": {
    accepts: ["prompt", "text", "requirement"],
    produces: ["code", "file", "text"],
    capabilities: ["scaffolding", "project-generation"],
  },
  "iem.agent.code": {
    accepts: ["prompt", "code", "text"],
    produces: ["code", "text", "file"],
    capabilities: ["code-generation", "debugging"],
  },
  "iem.agent.operator": {
    accepts: ["prompt", "config", "url"],
    produces: ["data", "text", "file"],
    capabilities: ["browser-automation", "saas-operation"],
  },
  // --- Chat & Communication ---
  "iem.chat.chat": {
    accepts: ["text", "prompt"],
    produces: ["text"],
    capabilities: ["conversation"],
  },
  "iem.chat.multi": {
    accepts: ["text", "prompt"],
    produces: ["text", "transcript"],
    capabilities: ["multi-agent-conversation"],
  },
  "iem.chat.interview": {
    accepts: ["prompt", "config"],
    produces: ["text", "data", "transcript"],
    capabilities: ["structured-interview"],
  },
  "iem.chat.approval": {
    accepts: ["any"],
    produces: ["approval", "any"],
    capabilities: ["approval-workflow"],
  },
  "iem.chat.inbox": {
    accepts: ["notification", "text"],
    produces: ["text"],
    capabilities: ["message-aggregation"],
  },
  "iem.chat.comment": {
    accepts: ["text"],
    produces: ["text", "comment"],
    capabilities: ["threaded-discussion"],
  },
  "iem.chat.voice": {
    accepts: ["audio"],
    produces: ["audio", "transcript", "text"],
    capabilities: ["voice-recording", "transcription"],
  },
  "iem.chat.notification": {
    accepts: ["text", "any"],
    produces: ["notification"],
    capabilities: ["alerting"],
  },
  "iem.chat.feed": {
    accepts: ["any"],
    produces: ["text", "event-stream"],
    capabilities: ["agent-monitoring"],
  },
  "iem.chat.orchestrator": {
    accepts: ["prompt", "text", "any"],
    produces: ["text", "workflow", "any"],
    capabilities: ["orchestration", "canvas-control"],
  },
  // --- Text & Knowledge ---
  "iem.text.note": {
    accepts: ["text"],
    produces: ["text"],
    capabilities: ["note-taking"],
  },
  "iem.text.rich": {
    accepts: ["text", "rich-text", "markdown"],
    produces: ["rich-text", "text"],
    capabilities: ["rich-text-editing"],
  },
  "iem.text.markdown": {
    accepts: ["text", "markdown"],
    produces: ["markdown", "text"],
    capabilities: ["markdown-editing"],
  },
  "iem.text.table": {
    accepts: ["data", "csv", "text"],
    produces: ["data", "csv", "text"],
    capabilities: ["tabular-data"],
  },
  "iem.text.checklist": {
    accepts: ["task", "text"],
    produces: ["task", "text"],
    capabilities: ["task-tracking"],
  },
  "iem.text.code": {
    accepts: ["code", "text"],
    produces: ["code", "text"],
    capabilities: ["code-display"],
  },
  "iem.text.prompt": {
    accepts: ["text"],
    produces: ["prompt", "text"],
    capabilities: ["prompt-authoring"],
  },
  "iem.text.citation": {
    accepts: ["url", "text"],
    produces: ["citation", "text"],
    capabilities: ["reference-management"],
  },
  "iem.text.knowledge": {
    accepts: ["text", "data"],
    produces: ["knowledge-card", "text"],
    capabilities: ["knowledge-synthesis"],
  },
  "iem.text.transcript": {
    accepts: ["audio", "video"],
    produces: ["transcript", "text"],
    capabilities: ["transcription"],
  },
  "iem.text.brief": {
    accepts: ["text", "citation", "data"],
    produces: ["research-brief", "text"],
    capabilities: ["research-summarization"],
  },
  // --- Generative Media ---
  "iem.media.image-gen": {
    accepts: ["prompt", "text"],
    produces: ["image"],
    capabilities: ["image-generation"],
  },
  "iem.media.image-edit": {
    accepts: ["image", "prompt"],
    produces: ["image"],
    capabilities: ["image-editing"],
  },
  "iem.media.video-gen": {
    accepts: ["prompt", "text", "image"],
    produces: ["video"],
    capabilities: ["video-generation"],
  },
  "iem.media.video-edit": {
    accepts: ["video", "audio"],
    produces: ["video"],
    capabilities: ["video-editing"],
  },
  "iem.media.audio-gen": {
    accepts: ["prompt", "text"],
    produces: ["audio"],
    capabilities: ["audio-generation"],
  },
  "iem.media.voice": {
    accepts: ["text"],
    produces: ["audio"],
    capabilities: ["text-to-speech"],
  },
  "iem.media.music": {
    accepts: ["prompt", "text"],
    produces: ["audio"],
    capabilities: ["music-generation"],
  },
  "iem.media.3d": {
    accepts: ["prompt", "image"],
    produces: ["3d-model"],
    capabilities: ["3d-generation"],
  },
  "iem.media.storyboard": {
    accepts: ["text", "image"],
    produces: ["storyboard", "image"],
    capabilities: ["storyboard-layout"],
  },
  "iem.media.creative": {
    accepts: ["text", "image", "prompt"],
    produces: ["image", "rich-text"],
    capabilities: ["brand-asset-creation"],
  },
  "iem.media.board": {
    accepts: ["image", "video", "audio", "file"],
    produces: ["collection", "image"],
    capabilities: ["media-curation"],
  },
  "iem.reel.textToImage": {
    accepts: ["prompt", "text"],
    produces: ["image"],
    capabilities: ["image-generation"],
  },
  "iem.reel.character": {
    accepts: ["prompt", "text"],
    produces: ["image"],
    capabilities: ["image-generation"],
  },
  "iem.reel.scene": {
    accepts: ["prompt", "text", "image"],
    produces: ["image", "storyboard"],
    capabilities: ["storyboard-layout"],
  },
  "iem.reel.dialogue": {
    accepts: ["text"],
    produces: ["audio"],
    capabilities: ["text-to-speech"],
  },
  "iem.reel.timeline": {
    accepts: ["image", "video", "audio"],
    produces: ["video"],
    capabilities: ["storyboard-layout"],
  },
  "iem.reel.export": {
    accepts: ["video"],
    produces: ["video", "file"],
    capabilities: ["video-editing"],
  },
  // --- Studios ---
  "iem.studio.video": {
    accepts: ["prompt", "text", "image", "video", "audio"],
    produces: ["video", "image", "audio"],
    capabilities: ["video-production"],
  },
  "iem.studio.game": {
    accepts: ["prompt", "text", "code", "3d-model", "image"],
    produces: ["game-project", "code", "3d-model"],
    capabilities: ["game-development"],
  },
  "iem.studio.app": {
    accepts: ["prompt", "text", "code", "requirement"],
    produces: ["app-project", "code", "file"],
    capabilities: ["app-development"],
  },
  "iem.studio.writer": {
    accepts: ["prompt", "text", "rich-text"],
    produces: ["manuscript", "rich-text", "text"],
    capabilities: ["narrative-design"],
  },
  "iem.studio.launch": {
    accepts: ["text", "image", "config"],
    produces: ["deployment", "config"],
    capabilities: ["deployment", "marketing"],
  },
  "iem.studio.research": {
    accepts: ["prompt", "text", "url"],
    produces: ["research-brief", "text", "citation"],
    capabilities: ["deep-research"],
  },
  "iem.studio.commerce": {
    accepts: ["config", "data", "text"],
    produces: ["storefront", "product", "data"],
    capabilities: ["commerce-management"],
  },
  "iem.studio.knowledge": {
    accepts: ["text", "file", "url"],
    produces: ["knowledge-card", "embedding", "data"],
    capabilities: ["knowledge-management"],
  },
  "iem.studio.automation": {
    accepts: ["workflow", "config", "prompt"],
    produces: ["workflow", "data", "any"],
    capabilities: ["workflow-automation"],
  },
  "iem.studio.brand": {
    accepts: ["text", "image", "prompt"],
    produces: ["image", "rich-text", "config"],
    capabilities: ["brand-design"],
  },
  "iem.studio.saas": {
    accepts: ["prompt", "code", "requirement"],
    produces: ["app-project", "code"],
    capabilities: ["saas-development"],
  },
  "iem.studio.world": {
    accepts: ["prompt", "text", "3d-model"],
    produces: ["world-data", "3d-model", "text"],
    capabilities: ["world-building"],
  },
  // --- Runtime & Apps ---
  "iem.app.iframe": {
    accepts: ["url"],
    produces: ["html"],
    capabilities: ["web-embedding"],
  },
  "iem.app.web": {
    accepts: ["code", "url"],
    produces: ["html", "app-project"],
    capabilities: ["web-hosting"],
  },
  "iem.app.game": {
    accepts: ["game-project", "code"],
    produces: ["game-runtime"],
    capabilities: ["game-execution"],
  },
  "iem.app.simulation": {
    accepts: ["config", "data", "code"],
    produces: ["data", "visualization"],
    capabilities: ["simulation-execution"],
  },
  "iem.app.terminal": {
    accepts: ["command", "code"],
    produces: ["text", "data"],
    capabilities: ["command-execution"],
  },
  "iem.app.browser": {
    accepts: ["url"],
    produces: ["html", "data", "image"],
    capabilities: ["web-browsing"],
  },
  "iem.app.api": {
    accepts: ["url", "config"],
    produces: ["data"],
    capabilities: ["api-testing"],
  },
  "iem.app.db": {
    accepts: ["config", "query"],
    produces: ["data"],
    capabilities: ["database-querying"],
  },
  "iem.app.dashboard": {
    accepts: ["data"],
    produces: ["visualization"],
    capabilities: ["data-visualization"],
  },
  "iem.app.files": {
    accepts: ["file"],
    produces: ["file"],
    capabilities: ["file-management"],
  },
  "iem.app.code-workspace": {
    accepts: ["code", "file"],
    produces: ["code", "file"],
    capabilities: ["code-editing"],
  },
  "iem.app.preview": {
    accepts: ["code", "html", "markdown"],
    produces: ["html", "image"],
    capabilities: ["live-preview"],
  },
  // --- Commerce & Intentcasting ---
  "iem.commerce.wallet": {
    accepts: ["config"],
    produces: ["identity", "config"],
    capabilities: ["wallet-management"],
  },
  "iem.commerce.checkout": {
    accepts: ["product", "cart"],
    produces: ["transaction"],
    capabilities: ["checkout-flow"],
  },
  "iem.commerce.payment": {
    accepts: ["transaction"],
    produces: ["receipt", "transaction"],
    capabilities: ["payment-processing"],
  },
  "iem.commerce.offer": {
    accepts: ["product", "text"],
    produces: ["offer"],
    capabilities: ["offer-creation"],
  },
  "iem.commerce.intentcast": {
    accepts: ["text", "prompt"],
    produces: ["intent-broadcast"],
    capabilities: ["intentcasting"],
  },
  "iem.commerce.brand-response": {
    accepts: ["intent-broadcast"],
    produces: ["offer", "text"],
    capabilities: ["brand-response"],
  },
  "iem.commerce.negotiation": {
    accepts: ["offer", "text"],
    produces: ["agreement", "offer"],
    capabilities: ["negotiation"],
  },
  "iem.commerce.storefront": {
    accepts: ["product", "config"],
    produces: ["storefront"],
    capabilities: ["storefront-display"],
  },
  "iem.commerce.product": {
    accepts: ["text", "image", "config"],
    produces: ["product"],
    capabilities: ["product-definition"],
  },
  "iem.commerce.digital-asset": {
    accepts: ["file", "config"],
    produces: ["product", "transaction"],
    capabilities: ["digital-sales"],
  },
  "iem.commerce.creator": {
    accepts: ["product", "config"],
    produces: ["storefront", "data"],
    capabilities: ["creator-commerce"],
  },
  "iem.commerce.cart": {
    accepts: ["product", "offer"],
    produces: ["cart"],
    capabilities: ["cart-management"],
  },
  // --- Files & Data ---
  "iem.data.file": {
    accepts: ["file"],
    produces: ["file", "text"],
    capabilities: ["file-storage"],
  },
  "iem.data.dropzone": {
    accepts: ["file"],
    produces: ["file"],
    capabilities: ["file-upload"],
  },
  "iem.data.dataset": {
    accepts: ["data", "csv", "file"],
    produces: ["data"],
    capabilities: ["dataset-management"],
  },
  "iem.data.csv": {
    accepts: ["csv", "file"],
    produces: ["data", "csv"],
    capabilities: ["csv-import"],
  },
  "iem.data.pod": {
    accepts: ["text", "embedding"],
    produces: ["embedding", "data"],
    capabilities: ["vector-storage"],
  },
  "iem.data.stream": {
    accepts: ["url", "config"],
    produces: ["data", "event-stream"],
    capabilities: ["data-streaming"],
  },
  "iem.data.cluster": {
    accepts: ["text", "data"],
    produces: ["data", "knowledge-card"],
    capabilities: ["memory-clustering"],
  },
  "iem.data.artifact": {
    accepts: ["any"],
    produces: ["artifact", "file"],
    capabilities: ["artifact-storage"],
  },
  "iem.data.provenance": {
    accepts: ["any"],
    produces: ["provenance", "data"],
    capabilities: ["provenance-tracking"],
  },
  "iem.data.view": {
    accepts: ["data"],
    produces: ["visualization", "data"],
    capabilities: ["data-lens"],
  },
  // --- System & Utility ---
  "iem.sys.timer": {
    accepts: ["config"],
    produces: ["event"],
    capabilities: ["timer"],
  },
  "iem.sys.monitor": {
    accepts: ["any"],
    produces: ["data", "event-stream"],
    capabilities: ["observability"],
  },
  "iem.sys.settings": {
    accepts: ["config"],
    produces: ["config"],
    capabilities: ["configuration"],
  },
  "iem.sys.env": {
    accepts: ["config"],
    produces: ["config"],
    capabilities: ["secret-management"],
  },
  "iem.sys.trace": {
    accepts: ["any"],
    produces: ["data", "text"],
    capabilities: ["debug-tracing"],
  },
  "iem.sys.log": {
    accepts: ["any"],
    produces: ["text", "data"],
    capabilities: ["logging"],
  },
  "iem.sys.event-stream": {
    accepts: ["config"],
    produces: ["event-stream", "data"],
    capabilities: ["event-streaming"],
  },
  "iem.sys.compiler": {
    accepts: ["any"],
    produces: ["file", "data"],
    capabilities: ["artifact-compilation"],
  },
  "iem.sys.runner": {
    accepts: ["workflow", "dag"],
    produces: ["data", "any"],
    capabilities: ["workflow-execution"],
  },
  "iem.sys.export": {
    accepts: ["any"],
    produces: ["file"],
    capabilities: ["export"],
  },
};
// Apply enrichment data to all registered blocks
for (const [blockId, enrichment] of Object.entries(BLOCK_DATA_ENRICHMENT)) {
  const block = blockRegistry.get(blockId);
  if (block) {
    if (enrichment.accepts && block.accepts?.length === 0) {
      block.accepts = enrichment.accepts;
    }
    if (enrichment.produces && block.produces?.length === 0) {
      block.produces = enrichment.produces;
    }
    if (enrichment.capabilities && block.capabilities?.length === 0) {
      block.capabilities = enrichment.capabilities;
    }
  }
}
