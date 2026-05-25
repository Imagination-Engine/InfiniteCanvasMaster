import { Hono } from "hono";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getVeoJob, startVeoForgeJob } from "../services/veoForge.js";
import { generateGeminiImageToMedia } from "../services/geminiImagePersist.js";

const reelRouter = new Hono();

// Directory where generated images are persisted to disk
const MEDIA_DIR = join(process.cwd(), "public", "generated-media");

/**
 * POST /api/reel/generate-image
 *
 * Uses Google's Nano Banana model (Imagen) through the Gemini API
 * to generate an image from a text prompt.
 * Saves the image to disk and returns a stable, persistable URL.
 */
reelRouter.post("/generate-image", async (c) => {
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json({ error: "prompt is required" }, 400);
  }

  try {
    console.log(
      `[REEL] Generating image for prompt: "${prompt.slice(0, 80)}..."`,
    );

    const stableUrl = await generateGeminiImageToMedia(prompt, MEDIA_DIR);
    console.log(`[REEL] Image saved → ${stableUrl}`);
    return c.json({ imageUrl: stableUrl });
  } catch (err: any) {
    if (err.message?.includes("No Gemini API key")) {
      return c.json({ error: "No Gemini/Imagen API key configured" }, 500);
    }
    console.error("[REEL] Image generation failed:", err);
    return c.json({ error: err.message }, 500);
  }
});

/**
 * GET /api/reel/media/:filename
 * Serves persisted generated media files.
 */
/**
 * POST /api/reel/generate-video
 *
 * Starts a Veo 3.1 job using up to 3 reference images + prompt.
 * Poll GET /api/reel/generate-video/:operationId until status is done.
 */
reelRouter.post("/generate-video", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const referenceImages = Array.isArray(body.referenceImages)
    ? body.referenceImages
        .filter(
          (r: unknown) => r && typeof (r as { url?: string }).url === "string",
        )
        .slice(0, 3)
        .map((r: { url: string; mimeType?: string }) => ({
          url: r.url,
          mimeType: r.mimeType,
        }))
    : [];

  if (!prompt) {
    return c.json({ error: "prompt is required" }, 400);
  }

  const { operationId } = await startVeoForgeJob({
    prompt,
    referenceImages,
    mediaDir: MEDIA_DIR,
  });

  return c.json({ operationId, status: "pending" });
});

/**
 * GET /api/reel/generate-video/:operationId
 */
reelRouter.get("/generate-video/:operationId", async (c) => {
  const operationId = c.req.param("operationId");
  const job = getVeoJob(operationId);

  if (!job) {
    return c.json({ error: "Unknown operation" }, 404);
  }

  return c.json({
    operationId,
    status: job.status,
    clipUrl: job.clipUrl,
    error: job.error,
  });
});

reelRouter.get("/media/:filename", async (c) => {
  const filename = c.req.param("filename");
  const filepath = join(MEDIA_DIR, filename);

  try {
    const { readFile } = await import("node:fs/promises");
    const data = await readFile(filepath);
    const ext = filename.split(".").pop() || "png";
    const mimeType = ext === "jpg" ? "image/jpeg" : "image/png";

    return new Response(data, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

export { reelRouter };
