/**
 * Studio artifact payload types and builders.
 *
 * @module @iem/core/studio/artifacts
 * @track vertical_slice_writers_studio_20260504 (Tracks 6–12)
 */
export function buildStudioArtifact(contractId, studioId, sourceBlockId, data) {
  return {
    contractId,
    data,
    metadata: {
      sourceBlockId,
      studioId,
      createdAt: new Date().toISOString(),
      version: 1,
    },
  };
}
export function buildManuscriptArtifact(sourceBlockId, payload) {
  const body = payload.body ?? "";
  return buildStudioArtifact("manuscript", "writers-studio", sourceBlockId, {
    title: payload.title ?? "Untitled Manuscript",
    body,
    wordCount: body.trim() ? body.trim().split(/\s+/).length : 0,
    format: payload.format ?? "markdown",
  });
}
export function buildVideoProjectArtifact(sourceBlockId, payload) {
  return buildStudioArtifact("video-project", "video-studio", sourceBlockId, {
    title: payload.title,
    scenes: payload.scenes ?? [],
    status: payload.status ?? "draft",
  });
}
export function buildGameProjectArtifact(sourceBlockId, payload) {
  return buildStudioArtifact("game-project", "game-studio", sourceBlockId, {
    title: payload.title,
    genre: payload.genre ?? "adventure",
    mechanics: payload.mechanics ?? [],
    status: payload.status ?? "concept",
  });
}
export function buildAppProjectArtifact(sourceBlockId, payload) {
  return buildStudioArtifact(
    "app-project",
    "app-creation-studio",
    sourceBlockId,
    {
      title: payload.title,
      stack: payload.stack ?? "react",
      features: payload.features ?? [],
      status: payload.status ?? "planning",
    },
  );
}
export function buildStorefrontArtifact(sourceBlockId, payload) {
  return buildStudioArtifact("storefront", "commerce-studio", sourceBlockId, {
    name: payload.name,
    products: payload.products ?? [],
    currency: payload.currency ?? "USD",
  });
}
export function buildAgentConfigArtifact(sourceBlockId, payload) {
  return buildStudioArtifact("agent-config", "agent-studio", sourceBlockId, {
    name: payload.name,
    role: payload.role ?? "assistant",
    tools: payload.tools ?? [],
    systemPrompt: payload.systemPrompt ?? "",
  });
}
export function buildWorkflowConfigArtifact(sourceBlockId, payload) {
  return buildStudioArtifact(
    "workflow-config",
    "automation-studio",
    sourceBlockId,
    {
      name: payload.name,
      steps: payload.steps ?? [],
      status: payload.status ?? "draft",
    },
  );
}
export function buildResearchBriefArtifact(sourceBlockId, payload) {
  return buildStudioArtifact(
    "research-brief",
    "research-studio",
    sourceBlockId,
    {
      topic: payload.topic,
      summary: payload.summary ?? "",
      sources: payload.sources ?? [],
      status: payload.status ?? "draft",
    },
  );
}
