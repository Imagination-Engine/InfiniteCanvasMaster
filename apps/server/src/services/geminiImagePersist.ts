import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { generateGeminiImage } from "@iem/core";

export async function generateGeminiImageToMedia(
  prompt: string,
  mediaDir: string,
): Promise<string> {
  const { mimeType, base64 } = await generateGeminiImage(prompt);
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";

  await mkdir(mediaDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(mediaDir, filename);
  await writeFile(filepath, Buffer.from(base64, "base64"));

  return `/generated-media/${filename}`;
}
