import { describe, it, expect } from "vitest";
import {
  buildManuscriptArtifact,
  buildVideoProjectArtifact,
  buildResearchBriefArtifact,
} from "./artifacts.js";

describe("studio artifacts", () => {
  it("builds a manuscript artifact matching the contract", () => {
    const artifact = buildManuscriptArtifact("iem.studio.writer", {
      title: "Chapter One",
      body: "Once upon a time in the engine.",
    });

    expect(artifact.contractId).toBe("manuscript");
    expect(artifact.metadata.studioId).toBe("writers-studio");
    expect(artifact.data).toMatchObject({
      title: "Chapter One",
      wordCount: 7,
      format: "markdown",
    });
  });

  it("preserves an explicit empty manuscript title", () => {
    const artifact = buildManuscriptArtifact("iem.studio.writer", {
      title: "",
      body: "Draft without a heading.",
    });

    expect((artifact.data as { title: string }).title).toBe("");
  });

  it("builds a video project artifact", () => {
    const artifact = buildVideoProjectArtifact("iem.studio.video", {
      title: "Launch Reel",
      scenes: [{ id: "s1", label: "Hook", durationSec: 5 }],
    });

    expect(artifact.contractId).toBe("video-project");
    expect(artifact.data).toMatchObject({
      status: "draft",
      scenes: [{ id: "s1" }],
      references: [],
      forge: { prompt: "", status: "idle" },
    });
  });

  it("builds a research brief artifact", () => {
    const artifact = buildResearchBriefArtifact("iem.studio.research", {
      topic: "Studio manifests",
      summary: "Cross-studio contracts enable safe wiring.",
    });

    expect(artifact.contractId).toBe("research-brief");
    expect(artifact.metadata.sourceBlockId).toBe("iem.studio.research");
  });
});
