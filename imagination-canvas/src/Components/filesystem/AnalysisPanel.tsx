import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AnalyzeResponse,
  FileSystemNodeData,
} from "./types";

type AnalysisPanelProps = {
  selectedNodes: FileSystemNodeData[];
};

export function AnalysisPanel({
  selectedNodes,
}: AnalysisPanelProps) {
  const [result, setResult] =
    useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef =
    useRef<AbortController | null>(null);

  const selectedFiles = useMemo(
    () =>
      selectedNodes.filter(
        (node) =>
          node.type === "file" &&
          typeof node.content === "string",
      ),
    [selectedNodes],
  );

  useEffect(() => {
    controllerRef.current?.abort();
    setIsLoading(false);
    setResult(null);
    setError(null);
  }, [selectedFiles]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const runAnalysis = async () => {
    if (selectedFiles.length === 0 || isLoading) {
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          files: selectedFiles.map((file) => ({
            name: file.name,
            path: file.path,
            content: file.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Analyze request failed (${response.status})`,
        );
      }

      const payload =
        (await response.json()) as AnalyzeResponse;
      setResult(payload);
    } catch (analysisError) {
      if (
        analysisError instanceof Error &&
        analysisError.name === "AbortError"
      ) {
        return;
      }
      setResult(null);
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Failed to analyze selected files.",
      );
    } finally {
      setIsLoading(false);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="h-full overflow-auto p-4">
        <p className="text-sm text-slate-600">
          Select which files you want to analyze.
        </p>
      </div>
    );
  }

  if (selectedFiles.length === 0) {
    return (
      <div className="h-full overflow-auto p-4">
        <p className="text-sm text-slate-600">
          Selected nodes include folders only. Select one or
          more files.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Selected {selectedFiles.length} file
          {selectedFiles.length === 1 ? "" : "s"}
        </div>
        <button
          type="button"
          className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={runAnalysis}
          disabled={selectedFiles.length === 0 || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {!isLoading && !error && !result ? (
        <p className="text-sm text-slate-600">
          Click Analyze to run AI analysis on selected files.
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Summary
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {result.summary}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Connections
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {result.connections}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Proper Nouns & Key Terms
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {result.keyTerms}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Organization Suggestions
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {result.organization}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
