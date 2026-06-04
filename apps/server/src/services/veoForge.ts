import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import {
  buildOperationPollUrl,
  extractInlineVideoPayload,
  extractVideoDownloadUri,
  veoCompletionFailureMessage,
} from "./veoResponse.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const VEO_MODEL = "veo-3.1-generate-preview";

export type VeoJobStatus = "pending" | "running" | "done" | "error";

export interface VeoJobRecord {
  status: VeoJobStatus;
  clipUrl?: string;
  error?: string;
  geminiOperationName?: string;
}

// Persist the job map to a JSON file so that dev-server hot-reloads don't
// lose in-flight operations. The file lives next to the server's public dir.
const JOB_STORE_PATH = join(process.cwd(), "public", "veo-jobs.json");

function loadJobStore(): Map<string, VeoJobRecord> {
  try {
    if (existsSync(JOB_STORE_PATH)) {
      const raw = readFileSync(JOB_STORE_PATH, "utf8");
      const parsed = JSON.parse(raw) as Record<string, VeoJobRecord>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    // corrupt file – start fresh
  }
  return new Map();
}

function saveJobStore(map: Map<string, VeoJobRecord>): void {
  try {
    const obj = Object.fromEntries(map.entries());
    writeFileSync(JOB_STORE_PATH, JSON.stringify(obj, null, 2), "utf8");
  } catch {
    // best-effort; don't crash the request
  }
}

const jobs = loadJobStore();

// On startup, resume any jobs that were "running" or "pending" when the server
// last stopped – they need to be re-queued once startVeoForgeJob is wired up.
const pendingResumeIds: string[] = [];
for (const [id, job] of jobs.entries()) {
  if (
    (job.status === "running" || job.status === "pending") &&
    job.geminiOperationName
  ) {
    pendingResumeIds.push(id);
  } else if (job.status === "running" || job.status === "pending") {
    // No Gemini operation name recorded – can't resume; mark as error.
    job.status = "error";
    job.error = "Server restarted before operation started; please retry.";
  }
}

export function getVeoJob(operationId: string): VeoJobRecord | undefined {
  return jobs.get(operationId);
}

export function clearVeoJobsForTests(): void {
  jobs.clear();
}

function setVeoJob(id: string, record: VeoJobRecord): void {
  jobs.set(id, record);
  saveJobStore(jobs);
}

function updateVeoJob(id: string, patch: Partial<VeoJobRecord>): void {
  const existing = jobs.get(id);
  if (existing) {
    Object.assign(existing, patch);
    saveJobStore(jobs);
  }
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

async function persistVideoBuffer(
  buf: Buffer,
  mediaDir: string,
  ext = "mp4",
): Promise<string> {
  await mkdir(mediaDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(join(mediaDir, filename), buf);
  return `/generated-media/${filename}`;
}

async function downloadVideoToMediaDir(
  videoUri: string,
  apiKey: string,
  mediaDir: string,
): Promise<string> {
  console.log(`[VEO] Downloading video from: ${videoUri}`);
  const res = await fetch(videoUri, {
    headers: { "x-goog-api-key": apiKey },
    redirect: "follow",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[VEO] Download failed ${res.status} for URL: ${videoUri}\n${body.slice(0, 300)}`,
    );
    throw new Error(`Failed to download generated video: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`[VEO] Downloaded ${buf.byteLength} bytes`);
  return persistVideoBuffer(buf, mediaDir);
}

async function pollGeminiOperation(
  operationName: string,
  apiKey: string,
  mediaDir: string,
): Promise<string> {
  const pollUrl = buildOperationPollUrl(operationName, GEMINI_BASE, VEO_MODEL);
  console.log(`[VEO] Polling operation: ${operationName}`);
  console.log(`[VEO] Poll URL: ${pollUrl}`);
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(pollUrl, {
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
      console.log(
        "[VEO] Operation complete. Response shape:",
        JSON.stringify(data).slice(0, 1000),
      );

      const inline = extractInlineVideoPayload(data);
      if (inline) {
        const ext = inline.mimeType.includes("webm") ? "webm" : "mp4";
        return persistVideoBuffer(inline.data, mediaDir, ext);
      }

      const videoUri = extractVideoDownloadUri(data, GEMINI_BASE);
      console.log("[VEO] Download URI:", videoUri);
      if (videoUri) {
        return downloadVideoToMediaDir(videoUri, apiKey, mediaDir);
      }

      console.error(
        "[VEO] Operation completed without a downloadable video:",
        JSON.stringify(data).slice(0, 2000),
      );
      throw new Error(veoCompletionFailureMessage(data));
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

  updateVeoJob(operationId, { status: "running" });

  const apiKey = geminiApiKey();
  if (!apiKey) {
    updateVeoJob(operationId, {
      status: "error",
      error: "No Gemini API key configured (GEMINI_API_KEY)",
    });
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
          ...(referencePayload.length > 0 ? { resolution: "720p" } : {}),
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

    // Persist the Gemini operation name immediately so a restart can resume.
    updateVeoJob(operationId, { geminiOperationName: operationName });

    const clipUrl = await pollGeminiOperation(operationName, apiKey, mediaDir);
    updateVeoJob(operationId, { status: "done", clipUrl });
  } catch (err) {
    updateVeoJob(operationId, {
      status: "error",
      error: err instanceof Error ? err.message : "Veo generation failed",
    });
  }
}

async function resumeVeoJob(operationId: string, mediaDir: string) {
  const job = jobs.get(operationId);
  if (!job?.geminiOperationName) return;
  const apiKey = geminiApiKey();
  if (!apiKey) {
    updateVeoJob(operationId, {
      status: "error",
      error: "No Gemini API key configured (GEMINI_API_KEY)",
    });
    return;
  }
  console.log(
    `[VEO] Resuming job ${operationId} (op: ${job.geminiOperationName})`,
  );
  updateVeoJob(operationId, { status: "running" });
  try {
    const clipUrl = await pollGeminiOperation(
      job.geminiOperationName,
      apiKey,
      mediaDir,
    );
    updateVeoJob(operationId, { status: "done", clipUrl });
  } catch (err) {
    updateVeoJob(operationId, {
      status: "error",
      error: err instanceof Error ? err.message : "Veo generation failed",
    });
  }
}

export async function startVeoForgeJob(options: {
  prompt: string;
  referenceImages: ReferenceImageInput[];
  mediaDir: string;
}): Promise<{ operationId: string }> {
  if (process.env.IEM_MOCK_MODELS === "1") {
    const operationId = `mock-${randomUUID()}`;
    setVeoJob(operationId, {
      status: "done",
      clipUrl: "/generated-media/mock-reel.mp4",
    });
    return { operationId };
  }

  const operationId = randomUUID();
  setVeoJob(operationId, { status: "pending" });

  void runVeoJob(
    operationId,
    options.prompt,
    options.referenceImages,
    options.mediaDir,
  );

  return { operationId };
}

/**
 * Resume any jobs that were in-flight when the server last stopped.
 * Call once at server startup.
 */
export function resumePendingVeoJobs(mediaDir: string): void {
  for (const id of pendingResumeIds) {
    void resumeVeoJob(id, mediaDir);
  }
}
