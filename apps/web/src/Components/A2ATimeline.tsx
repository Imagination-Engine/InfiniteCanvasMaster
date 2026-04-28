import React, { useState, useEffect } from "react";
import { useA2AHistory, useA2ASubscription } from "../hooks/useA2A";
import { BalnceEnvelope } from "@iem/core";

export interface A2ATimelineProps {
  runId: string;
}

export const A2ATimeline: React.FC<A2ATimelineProps> = ({ runId }) => {
  const { history, isLoading } = useA2AHistory({ runId });
  const [events, setEvents] = useState<BalnceEnvelope[]>([]);

  useEffect(() => {
    if (history.length > 0) {
      setEvents(history);
    }
  }, [history]);

  useA2ASubscription({
    topic: `dag.${runId}.#`, // Assuming wildcard support for observation
    onMessage: (envelope) => {
      setEvents((prev) => [...prev, envelope]);
    },
  });

  if (isLoading && events.length === 0) {
    return <div className="p-4 text-gray-500">Loading Timeline...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden border-l border-gray-200 bg-white w-80">
      <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold flex justify-between items-center">
        <span>A2A Timeline</span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {events.length} Events
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No events captured for this run.
          </div>
        ) : (
          events.map((event, i) => (
            <div
              key={event.id || i}
              className="p-2 text-xs border border-gray-100 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono text-blue-600 font-bold uppercase tracking-tight">
                  {event.event.type}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(event.event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-600 truncate">
                Source: {event.source.id}
              </div>
              {event.instruction && (
                <div className="mt-1 p-1 bg-amber-50 border border-amber-100 rounded text-amber-800">
                  Instruction: {event.instruction.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
