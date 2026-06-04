import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

function extForMimeType(mimeType: string): string {
  const m = mimeType.toLowerCase();
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  return "png";
}

/**
 * Persist a base64-encoded image (raw base64 or a `data:` URL) to the media
 * directory and return a stable, resolvable URL (`/generated-media/<uuid>.<ext>`).
 */
export async function persistBase64Image(
  input: string,
  mimeType: string,
  mediaDir: string,
): Promise<string> {
  let base64 = input;
  let resolvedMime = mimeType;

  const dataUrlMatch = input.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch) {
    resolvedMime = dataUrlMatch[1];
    base64 = dataUrlMatch[2];
  }

  const ext = extForMimeType(resolvedMime);
  await mkdir(mediaDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(join(mediaDir, filename), Buffer.from(base64, "base64"));
  return `/generated-media/${filename}`;
}
