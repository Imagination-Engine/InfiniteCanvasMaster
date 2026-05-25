/**
 * Concrete Studio Manifests — All 12 Studios
 *
 * Each manifest is the single source of truth for what a studio is,
 * what blocks it contains, what tools it needs, and what artifacts it
 * produces/consumes.
 *
 * @module @iem/core/studio/manifests
 * @track studio_manifest_registration_20260504 (Track 4)
 */
// ============================================================================
// Tool Mount Definitions (shared across studios)
// ============================================================================
export const TOOL_MOUNTS = {
  "gemini-chat": {
    id: "gemini-chat",
    name: "Gemini Chat",
    description: "Google Gemini LLM for text generation and reasoning.",
    provider: "google",
    status: "configured",
  },
  "gemini-vision": {
    id: "gemini-vision",
    name: "Gemini Vision",
    description: "Gemini with image understanding capabilities.",
    provider: "google",
    status: "configured",
  },
  "elevenlabs-tts": {
    id: "elevenlabs-tts",
    name: "ElevenLabs TTS",
    description: "Text-to-speech generation via ElevenLabs API.",
    provider: "elevenlabs",
    status: "mock",
  },
  "nanobanana-image": {
    id: "nanobanana-image",
    name: "NanoBanana Image Gen",
    description: "Image generation via NanoBanana API.",
    provider: "nanobanana",
    status: "mock",
  },
  "google-veo": {
    id: "google-veo",
    name: "Google Veo",
    description:
      "Video generation via Gemini API (Veo 3.1) with optional reference images.",
    provider: "google",
    status: "configured",
  },
  "openai-embeddings": {
    id: "openai-embeddings",
    name: "OpenAI Embeddings",
    description: "Text embedding generation for vector search.",
    provider: "openai",
    status: "mock",
  },
  "pinecone-vector": {
    id: "pinecone-vector",
    name: "Pinecone Vector DB",
    description: "Vector database for similarity search.",
    provider: "pinecone",
    status: "mock",
  },
  "neo4j-graph": {
    id: "neo4j-graph",
    name: "Neo4j Graph DB",
    description: "Graph database for entity relationships.",
    provider: "neo4j",
    status: "mock",
  },
  "cloudflare-sandbox": {
    id: "cloudflare-sandbox",
    name: "Cloudflare Sandbox",
    description: "Isolated execution environment via Durable Objects.",
    provider: "cloudflare",
    status: "mock",
  },
};
// ============================================================================
// Studio Manifests
// ============================================================================
export const writerStudioManifest = {
  id: "writers-studio",
  name: "Writer's Studio",
  description: "A complete suite for narrative design and long-form writing.",
  icon: "PenTool",
  accent: "#7B5CEA",
  blockIds: [
    "iem.studio.writer",
    "iem.text.note",
    "iem.text.rich",
    "iem.text.markdown",
    "iem.text.prompt",
  ],
  capabilities: [
    {
      id: "narrative-design",
      name: "Narrative Design",
      description: "Full-featured writing environment with AI assistance.",
      requiresToolMounts: ["gemini-chat"],
    },
    {
      id: "manuscript-export",
      name: "Manuscript Export",
      description: "Export writing as formatted manuscript artifacts.",
    },
  ],
  toolMounts: [TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "manuscript",
      name: "Manuscript",
      mimeType: "application/x-manuscript+json",
      producedBy: ["iem.studio.writer", "iem.text.rich"],
      acceptedBy: ["iem.sys.export", "iem.sys.compiler"],
    },
  ],
  modelAliases: [
    {
      alias: "fast-draft",
      provider: "google",
      model: "gemini-2.5-flash",
      fallbacks: [{ provider: "google", model: "gemini-2.0-flash" }],
    },
    {
      alias: "deep-edit",
      provider: "google",
      model: "gemini-2.5-pro",
    },
  ],
  permissions: {
    sandboxLevel: "public",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 5,
  },
};
export const videoStudioManifest = {
  id: "video-studio",
  name: "Video Studio",
  description: "A complete suite for AI-assisted video production.",
  icon: "Clapperboard",
  accent: "#E05AFF",
  blockIds: [
    "iem.studio.video",
    "iem.media.video-gen",
    "iem.media.video-edit",
    "iem.media.storyboard",
    "iem.media.image-gen",
    "iem.media.voice",
  ],
  capabilities: [
    {
      id: "video-generation",
      name: "Video Generation",
      description: "Generate video clips from prompts.",
      requiresToolMounts: ["google-veo", "gemini-vision"],
    },
    {
      id: "storyboard-layout",
      name: "Storyboard Layout",
      description: "Arrange scenes in a sequential storyboard.",
    },
  ],
  toolMounts: [
    TOOL_MOUNTS["google-veo"],
    TOOL_MOUNTS["gemini-vision"],
    TOOL_MOUNTS["nanobanana-image"],
    TOOL_MOUNTS["elevenlabs-tts"],
  ],
  artifactContracts: [
    {
      id: "video-project",
      name: "Video Project",
      mimeType: "application/x-video-project+json",
      producedBy: ["iem.studio.video", "iem.media.video-edit"],
      acceptedBy: ["iem.sys.export", "iem.media.video-edit"],
    },
  ],
  modelAliases: [
    {
      alias: "scene-gen",
      provider: "google",
      model: "gemini-2.5-flash",
    },
  ],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 3,
  },
};
export const gameStudioManifest = {
  id: "game-studio",
  name: "Game Studio",
  description: "A complete suite for game development and world building.",
  icon: "Gamepad2",
  accent: "#00C2FF",
  blockIds: [
    "iem.studio.game",
    "iem.studio.world",
    "iem.app.game",
    "iem.media.3d",
  ],
  capabilities: [
    {
      id: "game-development",
      name: "Game Development",
      description: "Build playable game experiences.",
      requiresToolMounts: ["cloudflare-sandbox"],
    },
    {
      id: "world-building",
      name: "World Building",
      description: "Design game worlds and lore.",
    },
  ],
  toolMounts: [TOOL_MOUNTS["cloudflare-sandbox"], TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "game-project",
      name: "Game Project",
      mimeType: "application/x-game-project+json",
      producedBy: ["iem.studio.game"],
      acceptedBy: ["iem.app.game", "iem.sys.export"],
    },
  ],
  modelAliases: [
    {
      alias: "code-gen",
      provider: "google",
      model: "gemini-2.5-flash",
    },
  ],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: false,
    fileSystemAccess: false,
    maxConcurrency: 2,
  },
};
export const appCreationStudioManifest = {
  id: "app-creation-studio",
  name: "App Creation Studio",
  description: "A complete suite for building and deploying software.",
  icon: "AppWindow",
  accent: "#38D9F5",
  blockIds: [
    "iem.studio.app",
    "iem.studio.saas",
    "iem.agent.code",
    "iem.app.code-workspace",
    "iem.app.terminal",
    "iem.app.preview",
  ],
  capabilities: [
    {
      id: "app-development",
      name: "App Development",
      description: "Full-stack application building.",
      requiresToolMounts: ["cloudflare-sandbox", "gemini-chat"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["cloudflare-sandbox"], TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "app-project",
      name: "App Project",
      mimeType: "application/x-app-project+json",
      producedBy: ["iem.studio.app", "iem.studio.saas"],
      acceptedBy: ["iem.app.preview", "iem.sys.export"],
    },
  ],
  modelAliases: [
    {
      alias: "code-gen",
      provider: "google",
      model: "gemini-2.5-flash",
    },
    {
      alias: "architect",
      provider: "google",
      model: "gemini-2.5-pro",
    },
  ],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: true,
    fileSystemAccess: true,
    maxConcurrency: 4,
  },
};
export const commerceStudioManifest = {
  id: "commerce-studio",
  name: "Commerce & Intentcasting Studio",
  description: "A complete suite for storefronts, sales, and intentcasting.",
  icon: "Store",
  accent: "#FFB347",
  blockIds: [
    "iem.studio.commerce",
    "iem.commerce.wallet",
    "iem.commerce.checkout",
    "iem.commerce.payment",
    "iem.commerce.offer",
    "iem.commerce.intentcast",
    "iem.commerce.brand-response",
    "iem.commerce.negotiation",
    "iem.commerce.storefront",
    "iem.commerce.product",
    "iem.commerce.digital-asset",
    "iem.commerce.creator",
    "iem.commerce.cart",
  ],
  capabilities: [
    {
      id: "commerce-management",
      name: "Commerce Management",
      description: "End-to-end commerce and transaction flows.",
    },
    {
      id: "intentcasting",
      name: "Intentcasting",
      description: "Broadcast purchase intent to the market.",
    },
  ],
  toolMounts: [TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "storefront",
      name: "Storefront",
      mimeType: "application/x-storefront+json",
      producedBy: ["iem.commerce.storefront", "iem.studio.commerce"],
      acceptedBy: ["iem.sys.export"],
    },
  ],
  modelAliases: [],
  permissions: {
    sandboxLevel: "internal",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 5,
  },
};
export const agentStudioManifest = {
  id: "agent-studio",
  name: "Agent Automation Studio",
  description:
    "A complete suite for building, managing, and deploying AI agents.",
  icon: "Bot",
  accent: "#9B79FF",
  blockIds: [
    "iem.agent.agent",
    "iem.agent.blank",
    "iem.agent.supervisor",
    "iem.agent.swarm",
    "iem.agent.imagiclaw",
    "iem.agent.imagiclaw-swarm",
    "iem.agent.builder",
  ],
  capabilities: [
    {
      id: "agent-creation",
      name: "Agent Creation",
      description: "Build and configure AI agents.",
      requiresToolMounts: ["gemini-chat"],
    },
    {
      id: "swarm-orchestration",
      name: "Swarm Orchestration",
      description: "Manage multi-agent swarm execution.",
      requiresToolMounts: ["cloudflare-sandbox"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["gemini-chat"], TOOL_MOUNTS["cloudflare-sandbox"]],
  artifactContracts: [
    {
      id: "agent-config",
      name: "Agent Configuration",
      mimeType: "application/x-agent-config+json",
      producedBy: ["iem.agent.agent", "iem.agent.blank"],
      acceptedBy: ["iem.agent.supervisor", "iem.agent.swarm"],
    },
  ],
  modelAliases: [
    {
      alias: "reasoning",
      provider: "google",
      model: "gemini-2.5-pro",
    },
    {
      alias: "fast-agent",
      provider: "google",
      model: "gemini-2.5-flash",
    },
  ],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 10,
  },
};
export const researchStudioManifest = {
  id: "research-studio",
  name: "Research & Knowledge Studio",
  description:
    "A complete suite for deep investigation and knowledge synthesis.",
  icon: "Microscope",
  accent: "#4ECDC4",
  blockIds: [
    "iem.studio.research",
    "iem.agent.researcher",
    "iem.text.brief",
    "iem.text.citation",
    "iem.data.stream",
  ],
  capabilities: [
    {
      id: "deep-research",
      name: "Deep Research",
      description: "Multi-source research and synthesis.",
      requiresToolMounts: ["gemini-chat"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "research-brief",
      name: "Research Brief",
      mimeType: "application/x-research-brief+json",
      producedBy: ["iem.studio.research", "iem.text.brief"],
      acceptedBy: ["iem.text.rich", "iem.sys.export"],
    },
  ],
  modelAliases: [
    {
      alias: "deep-research",
      provider: "google",
      model: "gemini-2.5-pro",
    },
  ],
  permissions: {
    sandboxLevel: "internal",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 5,
  },
};
export const knowledgeStudioManifest = {
  id: "knowledge-studio",
  name: "Knowledge Studio",
  description: "A complete suite for organizing and retrieving information.",
  icon: "Library",
  accent: "#2ECC71",
  blockIds: [
    "iem.studio.knowledge",
    "iem.text.knowledge",
    "iem.data.pod",
    "iem.data.cluster",
  ],
  capabilities: [
    {
      id: "knowledge-management",
      name: "Knowledge Management",
      description: "Organize, embed, and retrieve knowledge.",
      requiresToolMounts: ["openai-embeddings", "pinecone-vector"],
    },
  ],
  toolMounts: [
    TOOL_MOUNTS["openai-embeddings"],
    TOOL_MOUNTS["pinecone-vector"],
    TOOL_MOUNTS["neo4j-graph"],
  ],
  artifactContracts: [
    {
      id: "knowledge-graph",
      name: "Knowledge Graph",
      mimeType: "application/x-knowledge-graph+json",
      producedBy: ["iem.studio.knowledge"],
      acceptedBy: ["iem.data.pod", "iem.sys.export"],
    },
  ],
  modelAliases: [
    {
      alias: "embedder",
      provider: "openai",
      model: "text-embedding-3-small",
    },
  ],
  permissions: {
    sandboxLevel: "internal",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 8,
  },
};
export const automationStudioManifest = {
  id: "automation-studio",
  name: "Automation Studio",
  description: "A complete suite for workflow pipelines and task automation.",
  icon: "Settings2",
  accent: "#FF6B6B",
  blockIds: [
    "iem.studio.automation",
    "iem.agent.mastra",
    "iem.agent.imagiclaw-sandbox",
    "iem.agent.operator",
  ],
  capabilities: [
    {
      id: "workflow-automation",
      name: "Workflow Automation",
      description: "Build and run automated pipelines.",
      requiresToolMounts: ["cloudflare-sandbox"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["cloudflare-sandbox"], TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "workflow-config",
      name: "Workflow Configuration",
      mimeType: "application/x-workflow+json",
      producedBy: ["iem.studio.automation", "iem.agent.mastra"],
      acceptedBy: ["iem.sys.runner"],
    },
  ],
  modelAliases: [],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: true,
    fileSystemAccess: true,
    maxConcurrency: 10,
  },
};
export const launchStudioManifest = {
  id: "launch-studio",
  name: "Launch Studio",
  description: "A complete suite for marketing and deployment.",
  icon: "Rocket",
  accent: "#FF4757",
  blockIds: ["iem.studio.launch"],
  capabilities: [
    {
      id: "deployment",
      name: "Deployment",
      description: "Deploy projects to production.",
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Create and manage marketing campaigns.",
    },
  ],
  toolMounts: [TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "deployment-config",
      name: "Deployment Configuration",
      mimeType: "application/x-deployment+json",
      producedBy: ["iem.studio.launch"],
      acceptedBy: ["iem.sys.export"],
    },
  ],
  modelAliases: [],
  permissions: {
    sandboxLevel: "internal",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 3,
  },
};
export const mediaStudioManifest = {
  id: "media-studio",
  name: "Media Studio",
  description:
    "A generative media creation environment for images, audio, and music.",
  icon: "Image",
  accent: "#FF69B4",
  blockIds: [
    "iem.media.image-gen",
    "iem.media.image-edit",
    "iem.media.audio-gen",
    "iem.media.voice",
    "iem.media.music",
    "iem.media.board",
  ],
  capabilities: [
    {
      id: "image-generation",
      name: "Image Generation",
      description: "Generate images from text prompts.",
      requiresToolMounts: ["nanobanana-image"],
    },
    {
      id: "audio-generation",
      name: "Audio Generation",
      description: "Generate audio, speech, and music.",
      requiresToolMounts: ["elevenlabs-tts"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["nanobanana-image"], TOOL_MOUNTS["elevenlabs-tts"]],
  artifactContracts: [
    {
      id: "media-asset",
      name: "Media Asset",
      mimeType: "application/x-media-asset+json",
      producedBy: ["iem.media.image-gen", "iem.media.audio-gen"],
      acceptedBy: ["iem.media.board", "iem.sys.export"],
    },
  ],
  modelAliases: [],
  permissions: {
    sandboxLevel: "sandbox",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 5,
  },
};
export const brandStudioManifest = {
  id: "brand-studio",
  name: "Brand Studio",
  description: "A complete suite for brand identity and creative assets.",
  icon: "Award",
  accent: "#F39C12",
  blockIds: ["iem.studio.brand", "iem.media.creative"],
  capabilities: [
    {
      id: "brand-design",
      name: "Brand Design",
      description: "Create brand identity and assets.",
      requiresToolMounts: ["nanobanana-image"],
    },
  ],
  toolMounts: [TOOL_MOUNTS["nanobanana-image"], TOOL_MOUNTS["gemini-chat"]],
  artifactContracts: [
    {
      id: "brand-kit",
      name: "Brand Kit",
      mimeType: "application/x-brand-kit+json",
      producedBy: ["iem.studio.brand"],
      acceptedBy: ["iem.sys.export"],
    },
  ],
  modelAliases: [],
  permissions: {
    sandboxLevel: "public",
    networkAccess: true,
    fileSystemAccess: false,
    maxConcurrency: 5,
  },
};
// ============================================================================
// Studio Registry
// ============================================================================
export const ALL_STUDIO_MANIFESTS = [
  writerStudioManifest,
  videoStudioManifest,
  gameStudioManifest,
  appCreationStudioManifest,
  commerceStudioManifest,
  agentStudioManifest,
  researchStudioManifest,
  knowledgeStudioManifest,
  automationStudioManifest,
  launchStudioManifest,
  mediaStudioManifest,
  brandStudioManifest,
];
// ============================================================================
// Tool Mount Registry
// ============================================================================
class ToolMountRegistry {
  mounts = new Map();
  register(mount) {
    this.mounts.set(mount.id, mount);
  }
  get(id) {
    return this.mounts.get(id);
  }
  list() {
    return Array.from(this.mounts.values());
  }
  /** Return mounts that are currently active or configured */
  available() {
    return this.list().filter((m) => m.status !== "mock");
  }
  /** Return mounts that are mocked (not yet configured) */
  mocked() {
    return this.list().filter((m) => m.status === "mock");
  }
}
export const toolMountRegistry = new ToolMountRegistry();
// Seed the registry with all known tool mounts
for (const mount of Object.values(TOOL_MOUNTS)) {
  toolMountRegistry.register(mount);
}
