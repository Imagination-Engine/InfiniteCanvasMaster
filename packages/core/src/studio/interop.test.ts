import { describe, it, expect } from "vitest";
import {
  artifactRegistry,
  capabilityRegistry,
  studioInteropResolver,
} from "./interop.js";

describe("StudioInteropResolver", () => {
  it("connects blocks when producer output matches consumer input", () => {
    expect(
      studioInteropResolver.canConnectBlocks(
        "iem.studio.writer",
        "iem.sys.export",
      ),
    ).toBe(true);
  });

  it("rejects incompatible artifact types", () => {
    expect(
      studioInteropResolver.canConnectBlocks(
        "iem.media.voice",
        "iem.studio.game",
      ),
    ).toBe(false);
  });

  it("suggests compatible downstream blocks for a writer studio block", () => {
    const suggestions =
      studioInteropResolver.suggestCompatibleBlocks("iem.studio.writer");
    const ids = suggestions.map((b) => b.id);
    expect(ids).toContain("iem.sys.export");
  });

  it("returns overlapping compatible types between blocks", () => {
    const types = studioInteropResolver.getCompatibleTypes(
      "iem.studio.writer",
      "iem.text.rich",
    );
    expect(types.length).toBeGreaterThan(0);
  });
});

describe("ArtifactRegistry", () => {
  it("indexes manuscript contract from writer studio manifest", () => {
    const contract = artifactRegistry.get("manuscript");
    expect(contract?.producedBy).toContain("iem.studio.writer");
  });
});

describe("CapabilityRegistry", () => {
  it("finds studio for narrative-design capability", () => {
    expect(capabilityRegistry.findStudio("narrative-design")).toBe(
      "writers-studio",
    );
  });
});
