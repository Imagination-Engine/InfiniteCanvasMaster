import { Hono } from "hono";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

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

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NANOBANANA_API_KEY;

  if (!apiKey) {
    return c.json({ error: "No Gemini/Imagen API key configured" }, 500);
  }

  try {
    console.log(
      `[REEL] Generating image for prompt: "${prompt.slice(0, 80)}..."`,
    );

    // Use Gemini's Nano Banana model (gemini-2.5-flash-image) for image generation
    // Verified via ListModels API: display name "Nano Banana", supports generateContent
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an image: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[REEL] Gemini API error ${res.status}: ${errText}`);
      return c.json(
        { error: `Gemini API error: ${res.status}`, details: errText },
        502,
      );
    }

    const data = await res.json();

    // Walk the response parts looking for inline image data
    const parts = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || "image/png";
        const b64 = part.inlineData.data;
        const ext = mimeType.includes("jpeg") ? "jpg" : "png";

        // Save to disk so the URL is stable across sessions
        await mkdir(MEDIA_DIR, { recursive: true });
        const filename = `${randomUUID()}.${ext}`;
        const filepath = join(MEDIA_DIR, filename);
        await writeFile(filepath, Buffer.from(b64, "base64"));

        // Return a URL the frontend can persist in localStorage
        const stableUrl = `/generated-media/${filename}`;
        console.log(`[REEL] Image saved to ${filepath} → ${stableUrl}`);

        return c.json({ imageUrl: stableUrl });
      }
    }

    // If no image was returned, the model might have only returned text
    console.warn(
      "[REEL] No image in response, parts:",
      JSON.stringify(parts).slice(0, 200),
    );
    return c.json(
      {
        error: "Model did not return an image. Try a more descriptive prompt.",
      },
      422,
    );
  } catch (err: any) {
    console.error("[REEL] Image generation failed:", err);
    return c.json({ error: err.message }, 500);
  }
});

/**
 * GET /api/reel/media/:filename
 * Serves persisted generated media files.
 */
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
