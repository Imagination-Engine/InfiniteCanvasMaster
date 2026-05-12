import { useState, useEffect } from "react";
import type { BalnceEnvelope } from "@iem/core";

export interface UseA2ASubscriptionOptions {
  lanes?: string[];
  topic?: string;
  enabled?: boolean;
  onMessage?: (envelope: BalnceEnvelope) => void;
}

export function useA2ASubscription(options: UseA2ASubscriptionOptions) {
  const { topic, lanes, enabled = true, onMessage } = options;
  const [lastEnvelope, setLastEnvelope] = useState<BalnceEnvelope | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // In a real app, you'd get the token from auth store
    const token =
      (globalThis as any).localStorage?.getItem?.("auth_token") || "dummy";
    const lanesQuery = lanes ? `&lanes=${lanes.join(",")}` : "";
    const url = `/api/a2a/stream?topic=${encodeURIComponent(topic || "#")}${lanesQuery}&token=${token}`;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = (e) => {
      console.error("SSE Error:", e);
      setIsConnected(false);
      setError(new Error("SSE Connection failed"));
      eventSource.close();
    };

    eventSource.addEventListener("envelope", (event: MessageEvent) => {
      try {
        const envelope = JSON.parse(event.data) as BalnceEnvelope;
        setLastEnvelope(envelope);
        if (onMessage) onMessage(envelope);

        // Push into the global projection store if it's a ui_projection
        if (envelope.lane === "ui_projection") {
          import("./useBlockProjection").then(
            ({ useCanvasProjectionStore }) => {
              useCanvasProjectionStore.getState().applyEnvelope(envelope);
            },
          );
        }
      } catch (err) {
        console.error("Failed to parse A2A envelope", err);
      }
    });

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [topic, enabled, onMessage]);

  return { lastEnvelope, isConnected, error };
}

export interface UseA2AHistoryOptions {
  traceId?: string;
  runId?: string;
}

export function useA2AHistory(options: UseA2AHistoryOptions) {
  const [history, setHistory] = useState<BalnceEnvelope[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (options.traceId) queryParams.append("traceId", options.traceId);
      if (options.runId) queryParams.append("runId", options.runId);

      const response = await fetch(
        `/api/a2a/history?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch A2A history");

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [options.traceId, options.runId]);

  return { history, isLoading, error, refetch: fetchHistory };
}
