import { OpenClawBlockEvent } from "../contracts/openclaw";
import { openclawBlockReducer } from "./openclawReducer";
import { useCanvasStore } from "./canvasStore";

// BREADCRUMB (A2A Message Fabric):
// When the @iem/core Message Bus is implemented, import it here.
// import { messageBus } from "@iem/core";

/**
 * High-performance orchestrator for syncing asynchronous OpenClaw events
 * to the synchronous spatial canvas UI.
 *
 * It buffers incoming events and flushes them to the Zustand store in batches
 * at 60fps to prevent React render storms.
 */
class CanvasEventSyncOrchestrator {
  private eventBuffer: OpenClawBlockEvent[] = [];
  private flushIntervalId: any = null;
  private isListening = false;

  public startListening() {
    if (this.isListening) return;
    this.isListening = true;

    // BREADCRUMB (A2A Message Fabric):
    // Bind to the real message bus wildcard route for OpenClaw events.
    // This will replace the manual push-based buffer currently used by the hooks.
    // messageBus.subscribe("openclaw.event.*", (envelope) => {
    //    this.bufferEvent(envelope.payload as OpenClawBlockEvent);
    // });

    // Start the flush loop (approx 60fps / 16ms)
    this.flushIntervalId = setInterval(() => this.flush(), 16);
  }

  public stopListening() {
    this.isListening = false;
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
    }
    // messageBus.unsubscribe("openclaw.event.*");
  }

  /**
   * Pushes an event into the central buffer for scheduled flushing.
   */
  public bufferEvent(event: OpenClawBlockEvent) {
    this.eventBuffer.push(event);
  }

  private flush() {
    if (this.eventBuffer.length === 0) return;

    // Extract the buffer and clear it immediately
    const eventsToProcess = [...this.eventBuffer];
    this.eventBuffer = [];

    // Group events by blockId to compute the final collapsed state transition
    const updatesByBlockId = new Map<string, OpenClawBlockEvent[]>();
    for (const event of eventsToProcess) {
      if (!updatesByBlockId.has(event.blockId)) {
        updatesByBlockId.set(event.blockId, []);
      }
      updatesByBlockId.get(event.blockId)!.push(event);
    }

    const { objects, batchUpdateObjects } = useCanvasStore.getState();
    const statePatches: Record<string, any> = {};

    for (const [blockId, events] of updatesByBlockId.entries()) {
      const currentObj = objects[blockId];
      if (!currentObj) continue;

      let currentMetadata = currentObj.metadata as any;

      // Reduce all buffered events into a single atomic update for this block
      for (const event of events) {
        currentMetadata = openclawBlockReducer(currentMetadata, event);
      }

      statePatches[blockId] = { metadata: currentMetadata };
    }

    if (Object.keys(statePatches).length > 0) {
      // ONE render pass for all blocks updated in this 16ms window
      batchUpdateObjects(statePatches);
    }
  }
}

export const CanvasEventSync = new CanvasEventSyncOrchestrator();
