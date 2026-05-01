import { BalnceEnvelope } from "../envelope";
import { FabricRouter } from "../transport";

export interface DocumentStateAdapter {
  /**
   * Commits a change to the canonical collaborative state.
   * This is called when an agent output is accepted or a user makes a manual edit.
   */
  commitChange(envelope: BalnceEnvelope): Promise<void>;

  /**
   * Observes the document state lane.
   */
  observe(handler: (envelope: BalnceEnvelope) => void): void;
}

/**
 * Interface boundary for Yjs/tldraw sync.
 * Prevents agent_stream from polluting canonical state.
 */
export class BaseDocumentStateAdapter implements DocumentStateAdapter {
  constructor(private router: FabricRouter) {}

  async commitChange(envelope: BalnceEnvelope): Promise<void> {
    if (envelope.lane !== "document_state") {
      throw new Error(
        "Only envelopes in the document_state lane can be committed to canonical state.",
      );
    }

    // In a real implementation, this would update Yjs or tldraw store
    console.log(
      `[DOC-STATE] Committing change ${envelope.id} to canonical store.`,
    );
    await this.router.publish(envelope);
  }

  observe(handler: (envelope: BalnceEnvelope) => void): void {
    this.router.subscribe({ lanes: ["document_state"] }, handler);
  }
}
