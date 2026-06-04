import { describe, it, expect } from "vitest";
import {
  buildOperationPollUrl,
  extractInlineVideoPayload,
  extractVideoDownloadUri,
  veoCompletionFailureMessage,
} from "./veoResponse.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

describe("extractVideoDownloadUri", () => {
  it("reads REST generateVideoResponse.generatedSamples[].video.uri", () => {
    const uri = extractVideoDownloadUri(
      {
        done: true,
        response: {
          generateVideoResponse: {
            generatedSamples: [
              {
                video: {
                  uri: "https://generativelanguage.googleapis.com/v1beta/files/abc:download?alt=media",
                },
              },
            ],
          },
        },
      },
      BASE,
    );
    expect(uri).toContain("files/abc");
  });

  it("reads SDK-style generatedVideos[].video.name as Files API download URL", () => {
    const uri = extractVideoDownloadUri(
      {
        done: true,
        response: {
          generatedVideos: [{ video: { name: "files/veo-output-1" } }],
        },
      },
      BASE,
    );
    expect(uri).toBe(`${BASE}/files/veo-output-1:download?alt=media`);
  });

  it("deep-searches nested download URIs", () => {
    const uri = extractVideoDownloadUri(
      {
        done: true,
        response: {
          "@type":
            "type.googleapis.com/google.ai.generativelanguage.v1beta.PredictLongRunningResponse",
          payload: {
            nested: {
              uri: "https://generativelanguage.googleapis.com/v1beta/files/deep1:download?alt=media",
            },
          },
        },
      },
      BASE,
    );
    expect(uri).toContain("files/deep1");
  });

  it("reads response.videos[].video.uri (Vertex-style)", () => {
    const uri = extractVideoDownloadUri(
      {
        done: true,
        response: {
          videos: [
            {
              video: {
                uri: "https://generativelanguage.googleapis.com/v1beta/files/vtx1:download?alt=media",
              },
            },
          ],
        },
      },
      BASE,
    );
    expect(uri).toContain("files/vtx1");
  });
});

describe("extractInlineVideoPayload", () => {
  it("reads generatedVideos[].video.videoBytes", () => {
    const payload = Buffer.from("hello").toString("base64");
    const inline = extractInlineVideoPayload({
      done: true,
      response: {
        generatedVideos: [
          { video: { videoBytes: payload, mimeType: "video/mp4" } },
        ],
      },
    });
    expect(inline?.data.toString()).toBe("hello");
    expect(inline?.mimeType).toBe("video/mp4");
  });
});

describe("buildOperationPollUrl", () => {
  it("prefixes bare operations/ names with the model path", () => {
    expect(buildOperationPollUrl("operations/abc123", BASE)).toBe(
      `${BASE}/models/veo-3.1-generate-preview/operations/abc123`,
    );
  });

  it("keeps model-scoped operation names", () => {
    expect(
      buildOperationPollUrl(
        "models/veo-3.1-generate-preview/operations/abc123",
        BASE,
      ),
    ).toBe(`${BASE}/models/veo-3.1-generate-preview/operations/abc123`);
  });
});

describe("veoCompletionFailureMessage", () => {
  it("surfaces RAI filter reasons when samples are empty", () => {
    const msg = veoCompletionFailureMessage({
      done: true,
      response: {
        generateVideoResponse: {
          generatedSamples: [],
          raiMediaFilteredReasons: ["Content policy violation"],
          raiMediaFilteredCount: 1,
        },
      },
    });
    expect(msg).toContain("blocked the video");
    expect(msg).toContain("Content policy violation");
  });

  it("includes response keys and debug preview for unknown shapes", () => {
    const msg = veoCompletionFailureMessage({
      done: true,
      response: { unknownField: true },
    });
    expect(msg).toContain("could not read a video download URL");
    expect(msg).toContain("unknownField");
    expect(msg).toContain("Debug:");
  });
});
