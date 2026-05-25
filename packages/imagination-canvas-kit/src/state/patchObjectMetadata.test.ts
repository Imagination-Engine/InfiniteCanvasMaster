import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });
});

import { useCanvasStore } from "./canvasStore";

describe("patchObjectMetadata", () => {
  beforeEach(() => {
    localStorage.clear();
    useCanvasStore.setState({
      objects: {},
      connections: [],
      bindings: [],
      _hasHydrated: true,
    });
  });

  it("keeps studioPayload on metadata, not in outputs", () => {
    const { addObject, patchObjectMetadata } = useCanvasStore.getState();
    addObject({
      id: "forge-1",
      type: "block" as never,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1,
      status: "idle",
      metadata: { inputs: {}, outputs: { clipUrl: "/old.mp4" } },
    });

    patchObjectMetadata("forge-1", {
      studioPayload: {
        title: "Reel",
        forge: { prompt: "pan", status: "idle" },
      },
      outputs: { "video-project": { contractId: "video-project" } },
      imageUrl: "/generated-media/ref.png",
      prompt: "still prompt",
    });

    const meta = useCanvasStore.getState().objects["forge-1"]
      .metadata as Record<string, unknown>;

    expect(meta.studioPayload).toMatchObject({ title: "Reel" });
    expect(meta.outputs).toMatchObject({
      clipUrl: "/old.mp4",
      "video-project": { contractId: "video-project" },
      imageUrl: "/generated-media/ref.png",
    });
    expect(meta.outputs).not.toHaveProperty("studioPayload");
    expect(meta.inputs).toMatchObject({
      prompt: "still prompt",
      imageUrl: "/generated-media/ref.png",
    });
    expect(meta).not.toHaveProperty("imageUrl");
    expect(meta).not.toHaveProperty("prompt");
  });

  it("does not duplicate routed scalars at metadata top level", () => {
    const { addObject, patchObjectMetadata } = useCanvasStore.getState();
    addObject({
      id: "reel-1",
      type: "block" as never,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1,
      status: "idle",
      metadata: {
        imageUrl: "/stale-top.png",
        prompt: "stale",
        inputs: {},
        outputs: {},
      },
    });

    patchObjectMetadata("reel-1", {
      imageUrl: "/generated-media/new.png",
      prompt: "fresh prompt",
      clipUrl: "/generated-media/clip.mp4",
    });

    const meta = useCanvasStore.getState().objects["reel-1"].metadata as Record<
      string,
      unknown
    >;

    expect(meta).not.toHaveProperty("imageUrl");
    expect(meta).not.toHaveProperty("prompt");
    expect(meta).not.toHaveProperty("clipUrl");
    expect(meta.inputs).toMatchObject({
      imageUrl: "/generated-media/new.png",
      prompt: "fresh prompt",
    });
    expect(meta.outputs).toMatchObject({
      imageUrl: "/generated-media/new.png",
      clipUrl: "/generated-media/clip.mp4",
    });
  });
});
