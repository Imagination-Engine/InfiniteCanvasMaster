// @ts-nocheck
import { useEffect, useState } from "react";
import { useOpenClawAdapter } from "../adapters/openclaw/OpenClawAdapterProvider";
import { OpenClawBlockEvent } from "../contracts/openclaw";
import { redactSensitivePayload } from "../utils/redaction";
import { CanvasEventSync } from "../state/CanvasEventSync";

/**
 * Connects a specific block to the adapter's event stream.
 * Events are redacted and then pushed to the central CanvasEventSync buffer
 * to be batched and flushed to the global store at 60fps.
 */
export function useOpenClawEventStream(blockId: string) {
  const adapter = useOpenClawAdapter();
  const [events, setEvents] = useState<OpenClawBlockEvent[]>([]);

  useEffect(() => {
    if (!blockId) return;

    // Ensure the central orchestrator is running
    CanvasEventSync.startListening();

    let active = true;

    async function stream() {
      try {
        for await (const rawEvent of adapter.streamEvents(blockId)) {
          if (!active) break;

          const safeEvent = redactSensitivePayload(rawEvent);

          // Local state for the specific component's timeline
          setEvents((prev) => [...prev, safeEvent]);

          // Push to central orchestrator for global state syncing
          CanvasEventSync.bufferEvent(safeEvent);
        }
      } catch (err) {
        console.error("OpenClaw event stream error:", err);
      }
    }

    stream();

    return () => {
      active = false;
    };
  }, [blockId, adapter]);

  return { events };
}
