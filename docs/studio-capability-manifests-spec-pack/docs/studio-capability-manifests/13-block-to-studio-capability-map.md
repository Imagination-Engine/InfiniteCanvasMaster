# 13 — Block to Studio Capability Map

Each block definition must include:

```ts
{
  (type,
    title,
    studioAffinity,
    category,
    capabilities,
    accepts,
    produces,
    modelAliases,
    toolMountIds,
    runtimeKind,
    fabricLanes,
    demoMode,
    securityClass);
}
```

## Required Block Groups

Writer: Writer's Studio, Rich Document, Script, Outline, Story Bible, Character, Scene, Critique Agent, Style Guide, Export.
Video: Video Studio, Reel Studio, Storyboard, Timeline Editor, Caption, Voiceover, Render Queue, Video Artifact.
Game: Game Studio, World Builder, Game Runtime, Scene, Level, Character, Mechanics, Asset Generator, Playtest.
App: App Creation Studio, Code Agent, Code Workspace, Live Preview, Web App, Iframe, Terminal, API Tester, Database View.
Commerce: Intentcasting, Offer, Brand Response, Negotiation, Wallet, Checkout, Payment Flow, Storefront, Product, Sovereign Cart.
Agent: Blank Agent Template, Agent, Supervisor Agent, Agent Swarm, ImagiClaw Agent, ImagiClaw Sandbox, MCP Tool, Mastra Workflow.
Research: Research Studio, Research Stream, Knowledge Card, Source/Citation, Dataset, Transcript, Memory Cluster, Knowledge Pod, RAG Query.

## Acceptance Criteria

- [ ] All existing blocks have studioAffinity.
- [ ] All blocks have capabilities.
- [ ] All blocks declare accepts/produces.
- [ ] Search/filter can use studio and capability metadata.
- [ ] Cross-studio resolver uses metadata.
