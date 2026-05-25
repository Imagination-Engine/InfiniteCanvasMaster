import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const VEO_MODEL = "veo-3.1-generate-preview";

export type VeoJobStatus = "pending" | "running" | "done" | "error";

export interface VeoJobRecord {
  status: VeoJobStatus;
  clipUrl?: string;
  error?: string;
  geminiOperationName?: string;
}

const jobs = new Map<string, VeoJobRecord>();

export function getVeoJob(operationId: string): VeoJobRecord | undefined {
  return jobs.get(operationId);
}

export function clearVeoJobsForTests(): void {
  jobs.clear();
}

function geminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NANOBANANA_API_KEY
  );
}

export interface ReferenceImageInput {
  url: string;
  mimeType?: string;
}

type VeoReferenceImageEncoding =
  | "inlineData"
  | "imageBytes"
  | "bytesBase64Encoded";

async function resolveImageToBase64(
  url: string,
  mediaDir: string,
): Promise<{ data: string; mimeType: string }> {
  if (url.startsWith("data:image/")) {
    const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL for reference image");
    return { mimeType: match[1], data: match[2] };
  }

  let fetchUrl = url;
  if (url.startsWith("/generated-media/")) {
    const filename = url.replace("/generated-media/", "");
    const filepath = join(mediaDir, filename);
    const buf = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeType =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    return { mimeType, data: buf.toString("base64") };
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch reference image: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/png";
  return { mimeType, data: buf.toString("base64") };
}

async function downloadVideoToMediaDir(
  videoUri: string,
  apiKey: string,
  mediaDir: string,
): Promise<string> {
  await mkdir(mediaDir, { recursive: true });
  const res = await fetch(videoUri, {
    headers: { "x-goog-api-key": apiKey },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to download generated video: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${randomUUID()}.mp4`;
  await writeFile(join(mediaDir, filename), buf);
  return `/generated-media/${filename}`;
}

async function pollGeminiOperation(
  operationName: string,
  apiKey: string,
  mediaDir: string,
): Promise<string> {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${GEMINI_BASE}/${operationName}`, {
      headers: { "x-goog-api-key": apiKey },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Veo poll error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || "Veo operation failed");
    }

    if (data.done) {
      const videoUri =
        data.response?.generateVideoResponse?.generatedSamples?.[0]?.video
          ?.uri ?? data.response?.generatedVideos?.[0]?.video?.uri;

      if (!videoUri) {
        throw new Error("Veo completed but no video URI in response");
      }

      return downloadVideoToMediaDir(videoUri, apiKey, mediaDir);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error("Veo operation timed out");
}

async function runVeoJob(
  operationId: string,
  prompt: string,
  referenceImages: ReferenceImageInput[],
  mediaDir: string,
): Promise<void> {
  const job = jobs.get(operationId);
  if (!job) return;

  job.status = "running";

  const apiKey = geminiApiKey();
  if (!apiKey) {
    job.status = "error";
    job.error = "No Gemini API key configured (GEMINI_API_KEY)";
    return;
  }

  try {
    const resolvedReferences = await Promise.all(
      referenceImages
        .slice(0, 3)
        .map(async (ref) => resolveImageToBase64(ref.url, mediaDir)),
    );

    const buildReferencePayload = (encoding: VeoReferenceImageEncoding) =>
      resolvedReferences.map(({ data, mimeType }) => {
        if (encoding === "imageBytes") {
          return {
            image: { imageBytes: data, mimeType },
            referenceType: "asset",
          };
        }
        if (encoding === "bytesBase64Encoded") {
          return {
            image: { bytesBase64Encoded: data, mimeType },
            referenceType: "asset",
          };
        }
        return {
          image: { inlineData: { mimeType, data } },
          referenceType: "asset",
        };
      });

    const startVeoOperation = async (encoding: VeoReferenceImageEncoding) => {
      const referencePayload = buildReferencePayload(encoding);
      const body: Record<string, unknown> = {
        instances: [
          {
            prompt,
            ...(referencePayload.length > 0
              ? { referenceImages: referencePayload }
              : {}),
          },
        ],
        parameters: {
          aspectRatio: "16:9",
          durationSeconds: referencePayload.length > 0 ? 8 : 6,
        },
      };

      const startRes = await fetch(
        `${GEMINI_BASE}/models/${VEO_MODEL}:predictLongRunning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(body),
        },
      );

      if (!startRes.ok) {
        const errText = await startRes.text();
        throw new Error(
          `Veo start error ${startRes.status}: ${errText.slice(0, 300)}`,
        );
      }

      return startRes.json();
    };

    let startData: any;
    try {
      startData = await startVeoOperation("inlineData");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("`inlineData` isn't supported")) {
        try {
          startData = await startVeoOperation("imageBytes");
        } catch {
          startData = await startVeoOperation("bytesBase64Encoded");
        }
      } else {
        throw err;
      }
    }

    const operationName = startData.name as string | undefined;
    if (!operationName) {
      throw new Error("Veo did not return an operation name");
    }

    job.geminiOperationName = operationName;
    const clipUrl = await pollGeminiOperation(operationName, apiKey, mediaDir);
    job.status = "done";
    job.clipUrl = clipUrl;
  } catch (err) {
    job.status = "error";
    job.error = err instanceof Error ? err.message : "Veo generation failed";
  }
}

export async function startVeoForgeJob(options: {
  prompt: string;
  referenceImages: ReferenceImageInput[];
  mediaDir: string;
}): Promise<{ operationId: string }> {
  if (process.env.IEM_MOCK_MODELS === "1") {
    const operationId = `mock-${randomUUID()}`;
    jobs.set(operationId, {
      status: "done",
      clipUrl: "/generated-media/mock-reel.mp4",
    });
    return { operationId };
  }

  const operationId = randomUUID();
  jobs.set(operationId, { status: "pending" });

  void runVeoJob(
    operationId,
    options.prompt,
    options.referenceImages,
    options.mediaDir,
  );

  return { operationId };
}
