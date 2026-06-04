const DEFAULT_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_DEEP_SEARCH_DEPTH = 14;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function firstStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((v): v is string => typeof v === "string");
  return strings.length ? strings : undefined;
}

function videoDownloadUriFromObject(
  video: Record<string, unknown> | undefined,
  geminiBase: string,
): string | undefined {
  if (!video) return undefined;

  if (typeof video.uri === "string" && video.uri.length > 0) {
    return video.uri;
  }

  const nestedFile = asRecord(video.file);
  if (nestedFile) {
    const fromFile = videoDownloadUriFromObject(nestedFile, geminiBase);
    if (fromFile) return fromFile;
  }

  const name =
    typeof video.name === "string"
      ? video.name
      : typeof video.fileUri === "string"
        ? video.fileUri
        : undefined;

  if (!name) return undefined;

  if (name.startsWith("http://") || name.startsWith("https://")) {
    return name;
  }

  const normalized = name.startsWith("files/") ? name : `files/${name}`;
  return `${geminiBase}/${normalized}:download?alt=media`;
}

function uriFromSampleLike(
  sample: unknown,
  geminiBase: string,
): string | undefined {
  const record = asRecord(sample);
  if (!record) return undefined;
  return videoDownloadUriFromObject(asRecord(record.video), geminiBase);
}

function getGenerateVideoResponse(
  response: Record<string, unknown>,
): Record<string, unknown> | undefined {
  return (
    asRecord(response.generateVideoResponse) ??
    asRecord(response.generate_video_response)
  );
}

function getGeneratedSamples(
  gvr: Record<string, unknown>,
): unknown[] | undefined {
  const samples = gvr.generatedSamples ?? gvr.generated_samples;
  return Array.isArray(samples) ? samples : undefined;
}

function getGeneratedVideos(
  response: Record<string, unknown>,
): unknown[] | undefined {
  const videos = response.generatedVideos ?? response.generated_videos;
  return Array.isArray(videos) ? videos : undefined;
}

function getTopLevelVideos(
  response: Record<string, unknown>,
): unknown[] | undefined {
  const videos = response.videos;
  return Array.isArray(videos) ? videos : undefined;
}

function findDownloadUriDeep(
  value: unknown,
  geminiBase: string,
  depth = 0,
): string | undefined {
  if (depth > MAX_DEEP_SEARCH_DEPTH) return undefined;

  if (typeof value === "string") {
    if (
      value.includes("generativelanguage.googleapis.com") &&
      value.includes(":download")
    ) {
      return value;
    }
    if (/^files\/[a-zA-Z0-9_-]+$/.test(value)) {
      return `${geminiBase}/${value}:download?alt=media`;
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDownloadUriDeep(item, geminiBase, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  const record = asRecord(value);
  if (!record) return undefined;

  const direct = videoDownloadUriFromObject(record, geminiBase);
  if (direct) return direct;

  for (const key of Object.keys(record)) {
    const found = findDownloadUriDeep(record[key], geminiBase, depth + 1);
    if (found) return found;
  }

  return undefined;
}

function findInlineVideoDeep(
  value: unknown,
  depth = 0,
): { data: Buffer; mimeType: string } | undefined {
  if (depth > MAX_DEEP_SEARCH_DEPTH) return undefined;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findInlineVideoDeep(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  const record = asRecord(value);
  if (!record) return undefined;

  const mimeType =
    typeof record.mimeType === "string"
      ? record.mimeType
      : typeof record.mime_type === "string"
        ? record.mime_type
        : "video/mp4";

  const rawBytes =
    record.videoBytes ??
    record.video_bytes ??
    record.bytesBase64Encoded ??
    record.bytes_base64_encoded;

  if (typeof rawBytes === "string" && rawBytes.length > 0) {
    return { data: Buffer.from(rawBytes, "base64"), mimeType };
  }

  const inline = asRecord(record.inlineData) ?? asRecord(record.inline_data);
  if (inline && typeof inline.data === "string" && inline.data.length > 0) {
    const inlineMime =
      typeof inline.mimeType === "string"
        ? inline.mimeType
        : typeof inline.mime_type === "string"
          ? inline.mime_type
          : mimeType;
    if (inlineMime.startsWith("video/")) {
      return {
        data: Buffer.from(inline.data, "base64"),
        mimeType: inlineMime,
      };
    }
  }

  for (const key of Object.keys(record)) {
    const found = findInlineVideoDeep(record[key], depth + 1);
    if (found) return found;
  }

  return undefined;
}

export function getOperationResponse(
  operationData: Record<string, unknown>,
): Record<string, unknown> | undefined {
  return asRecord(operationData.response) ?? asRecord(operationData.result);
}

function extractStructuredVideoDownloadUri(
  operationData: Record<string, unknown>,
  geminiBase: string,
): string | undefined {
  const response = getOperationResponse(operationData);
  if (!response) return undefined;

  const gvr = getGenerateVideoResponse(response);
  if (gvr) {
    for (const sample of getGeneratedSamples(gvr) ?? []) {
      const uri = uriFromSampleLike(sample, geminiBase);
      if (uri) return uri;
    }
  }

  for (const entry of getGeneratedVideos(response) ?? []) {
    const uri = uriFromSampleLike(entry, geminiBase);
    if (uri) return uri;
  }

  for (const entry of getTopLevelVideos(response) ?? []) {
    const uri = uriFromSampleLike(entry, geminiBase);
    if (uri) return uri;
  }

  return undefined;
}

export function extractVideoDownloadUri(
  operationData: Record<string, unknown>,
  geminiBase: string = DEFAULT_GEMINI_BASE,
): string | undefined {
  return (
    extractStructuredVideoDownloadUri(operationData, geminiBase) ??
    findDownloadUriDeep(operationData, geminiBase)
  );
}

export function extractInlineVideoPayload(
  operationData: Record<string, unknown>,
): { data: Buffer; mimeType: string } | undefined {
  const response = getOperationResponse(operationData);
  return findInlineVideoDeep(response) ?? findInlineVideoDeep(operationData);
}

export function veoCompletionFailureMessage(
  operationData: Record<string, unknown>,
): string {
  const response = getOperationResponse(operationData);
  if (!response) {
    const preview = JSON.stringify(operationData).slice(0, 500);
    return `Veo completed without a response payload. Debug: ${preview}`;
  }

  const gvr = getGenerateVideoResponse(response);
  if (gvr) {
    const reasons = firstStringArray(
      gvr.raiMediaFilteredReasons ?? gvr.rai_media_filtered_reasons,
    );
    const filteredCount =
      gvr.raiMediaFilteredCount ?? gvr.rai_media_filtered_count;
    const samples = getGeneratedSamples(gvr) ?? [];
    if (reasons?.length && samples.length === 0) {
      const countSuffix =
        filteredCount != null ? ` (${filteredCount} filtered)` : "";
      return `Veo blocked the video${countSuffix}: ${reasons.join("; ")}`;
    }
  }

  const keys = Object.keys(response).slice(0, 12).join(", ");
  const preview = JSON.stringify(response).slice(0, 500);
  return `Veo forge could not read a video download URL (response keys: ${keys || "none"}). Debug: ${preview}`;
}

export function buildOperationPollUrl(
  operationName: string,
  geminiBase: string = DEFAULT_GEMINI_BASE,
  modelId = "veo-3.1-generate-preview",
): string {
  const trimmed = operationName.replace(/^\//, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("models/")) {
    return `${geminiBase}/${trimmed}`;
  }
  if (trimmed.startsWith("operations/")) {
    return `${geminiBase}/models/${modelId}/${trimmed}`;
  }
  return `${geminiBase}/${trimmed}`;
}
