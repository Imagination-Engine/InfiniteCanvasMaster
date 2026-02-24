import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const ollamaUrl =
  process.env.OLLAMA_URL ??
  "http://localhost:11434/api/generate";
const ollamaModel =
  process.env.OLLAMA_MODEL ?? "llama3";
const ollamaTimeoutMs = Number(
  process.env.OLLAMA_TIMEOUT_MS ?? 60_000,
);
const maxFiles = Number(process.env.ANALYZE_MAX_FILES ?? 20);
const maxCharsPerFile = Number(
  process.env.ANALYZE_MAX_CHARS_PER_FILE ?? 3_000,
);
const maxCorpusChars = Number(
  process.env.ANALYZE_MAX_TOTAL_CHARS ?? 45_000,
);

type AnalyzeFileInput = {
  name: string;
  path: string;
  content: string;
};

type AnalyzeRequestBody = {
  files?: AnalyzeFileInput[];
};

app.use(express.json({ limit: "20mb" }));

const buildCorpus = (files: AnalyzeFileInput[]) =>
  files
    .slice(0, maxFiles)
    .map(
      (file) =>
        `FILE: ${file.path}\n${file.content.slice(0, maxCharsPerFile)}`,
    )
    .join("\n\n-----\n\n")
    .slice(0, maxCorpusChars);

const parseAnalysisResponse = (responseText: string) => {
  const normalized = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  const jsonText =
    firstBrace >= 0 && lastBrace > firstBrace
      ? normalized.slice(firstBrace, lastBrace + 1)
      : normalized;

  const parsed = JSON.parse(jsonText) as Partial<{
    summary: string;
    connections: string;
    keyTerms: string;
    organization: string;
  }>;

  return {
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary.trim()
        : "No summary available.",
    connections:
      typeof parsed.connections === "string"
        ? parsed.connections.trim()
        : "No connections available.",
    keyTerms:
      typeof parsed.keyTerms === "string"
        ? parsed.keyTerms.trim()
        : "No key terms available.",
    organization:
      typeof parsed.organization === "string"
        ? parsed.organization.trim()
        : "No organization suggestions available.",
  };
};

const callOllama = async (corpus: string) => {
  const prompt = [
    "You are analyzing a set of user-selected files from a filesystem workspace.",
    "Return STRICT JSON only with exactly these keys:",
    'summary, connections, keyTerms, organization.',
    "Each value should be concise markdown-friendly text.",
    "",
    "FILES:",
    corpus,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ollamaTimeoutMs,
  );

  let response: Response;
  try {
    response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 500,
        },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(
      `Ollama request failed (${response.status})`,
    );
  }

  const payload = (await response.json()) as {
    response?: string;
  };

  if (!payload.response?.trim()) {
    throw new Error("Ollama returned an empty response.");
  }

  return parseAnalysisResponse(payload.response);
};

app.post(
  "/api/analyze",
  async (
    req: express.Request<
      Record<string, never>,
      unknown,
      AnalyzeRequestBody
    >,
    res: express.Response,
  ) => {
    try {
      const files = Array.isArray(req.body?.files)
        ? req.body.files.filter(
            (file): file is AnalyzeFileInput =>
              Boolean(
                file &&
                  typeof file.name === "string" &&
                  typeof file.path === "string" &&
                  typeof file.content === "string",
              ),
          )
        : [];

      if (files.length === 0) {
        return res.status(400).json({
          error:
            "Expected body.files with at least one text file.",
        });
      }

      const corpus = buildCorpus(files);

      const result = await callOllama(corpus);
      return res.json(result);
    } catch (error) {
      const isTimeoutError =
        error instanceof Error &&
        error.name === "AbortError";

      return res.status(500).json({
        error: isTimeoutError
          ? `Ollama timed out after ${ollamaTimeoutMs}ms`
          : error instanceof Error
            ? error.message
            : "Analysis failed.",
      });
    }
  },
);

app.listen(port, () => {
  console.log(
    `Filesystem analyzer API running at http://localhost:${port}`,
  );
});
