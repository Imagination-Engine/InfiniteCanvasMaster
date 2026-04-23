import React, { useState } from "react";

export default function DiagnosticPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    setLogs(["Starting raw fetch test to /api/health/stream-test..."]);

    try {
      const response = await fetch("/api/health/stream-test");

      if (!response.body) {
        setLogs((prev) => [...prev, "ERROR: No response body found."]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLogs((prev) => [...prev, "--- STREAM FINISHED ---"]);
          break;
        }

        const text = decoder.decode(value);
        console.log("RAW CHUNK RECEIVED:", text);
        setLogs((prev) => [...prev, `CHUNK: ${text}`]);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `FETCH ERROR: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-20 bg-slate-950 text-slate-200 min-h-screen font-mono">
      <h1 className="text-3xl font-bold mb-8">System Stream Diagnostic</h1>
      <button
        onClick={runTest}
        disabled={isRunning}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold mb-8 disabled:opacity-50"
      >
        {isRunning ? "Testing..." : "Run Plumbing Test"}
      </button>

      <div className="bg-black/50 p-6 rounded-xl border border-white/10 space-y-2 max-h-[600px] overflow-y-auto">
        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.startsWith("ERROR") ? "text-red-400" : "text-green-400"
            }
          >
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-500">Ready for diagnostic run.</div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
        <strong>Senior Engineer's Note:</strong> This test bypasses the Vercel
        AI SDK and Mastra entirely. If this works, our issue is definitely the
        Vercel AI SDK configuration. If this fails, the Vite proxy or the
        Node.js server itself is buffering chunks.
      </div>
    </div>
  );
}
