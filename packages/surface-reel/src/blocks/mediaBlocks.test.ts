import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { textToImageBlock, textToSpeechBlock } from "./mediaBlocks";

describe("Media-Primitive Blocks (Red/Green Phase)", () => {
  let originalFetch: typeof global.fetch;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NANOBANANA_API_KEY: "test-key",
      ELEVENLABS_API_KEY: "test-key",
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("Text to Image Block", () => {
    it("has valid metadata and schema", () => {
      expect(textToImageBlock.id).toBe("iem.reel.textToImage");
      const validIn = { prompt: "A futuristic city" };
      expect(textToImageBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("generates an image via fetch", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: "https://mock-image.url/image.png" }],
        }),
      });

      const output = await textToImageBlock.agent.invoke({ prompt: "test" });
      expect(output).toHaveProperty(
        "imageUrl",
        "https://mock-image.url/image.png",
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("adversarial: throws if API key is missing", async () => {
      process.env.NANOBANANA_API_KEY = "";
      process.env.IMAGE_API_KEY = "";
      await expect(
        textToImageBlock.agent.invoke({ prompt: "test" }),
      ).rejects.toThrow("Missing API key");
    });

    it("adversarial: throws if API fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });
      await expect(
        textToImageBlock.agent.invoke({ prompt: "test" }),
      ).rejects.toThrow("Image API error 500");
    });
  });

  describe("Text to Speech Block", () => {
    it("has valid metadata and schema", () => {
      expect(textToSpeechBlock.id).toBe("iem.reel.textToSpeech");
      const validIn = { text: "Hello world", voiceId: "1234" };
      expect(textToSpeechBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("generates audio via fetch and returns Data URI", async () => {
      const mockArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer,
      });

      const output = await textToSpeechBlock.agent.invoke({ text: "test" });
      expect(output).toHaveProperty("audioUrl");
      expect(output.audioUrl).toMatch(/^data:audio\/mpeg;base64,/);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("adversarial: throws if API key is missing", async () => {
      process.env.ELEVENLABS_API_KEY = "";
      await expect(
        textToSpeechBlock.agent.invoke({ text: "test" }),
      ).rejects.toThrow("Missing ElevenLabs API key");
    });

    it("adversarial: throws if API fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });
      await expect(
        textToSpeechBlock.agent.invoke({ text: "test" }),
      ).rejects.toThrow("ElevenLabs API error 500");
    });
  });
});
