/**
 * Gemini image generation (Nano Banana / gemini-2.5-flash-image).
 */

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

const DEFAULT_SYSTEM_INSTRUCTION =
  "You are an expert anime key visual and storyboard artist. Follow the user's prompt exactly — especially studio style (e.g. ufotable), composition, characters, and scene references. Output a single high-quality still image that looks like an authentic anime screencap when requested.";

export function resolveGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NANOBANANA_API_KEY
  );
}

export async function generateGeminiImage(
  prompt,
  apiKey,
  systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
) {
  const key = apiKey ?? resolveGeminiApiKey();
  if (!key) {
    throw new Error("No Gemini API key configured");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini image API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        mimeType: part.inlineData.mimeType || "image/png",
        base64: part.inlineData.data,
      };
    }
  }

  throw new Error(
    "Model did not return an image. Try a more descriptive prompt.",
  );
}

export function geminiImageToDataUrl(result) {
  return `data:${result.mimeType};base64,${result.base64}`;
}
