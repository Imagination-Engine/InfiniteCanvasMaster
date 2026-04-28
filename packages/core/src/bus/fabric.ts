import {
  A2AMessageFabric,
  A2AMessageTransport,
  A2APolicyEngine,
  A2AEventLog,
  BalnceEnvelope,
  A2AReplayQuery,
  Topics,
} from "./protocol";
import * as dbModule from "@iem/db";

const { db, a2aApprovals } = dbModule as any;

export class CoreMessageFabric implements A2AMessageFabric {
  private pendingApprovals = new Map<string, () => Promise<void>>();

  constructor(
    private transport: A2AMessageTransport,
    private policyEngine?: A2APolicyEngine,
    private eventLog?: A2AEventLog,
  ) {
    // Background subscription to catch approval.granted events globally
    this.transport.subscribe("approval.*.event", async (envelope: any) => {
      if (envelope.event?.type === "approval.granted") {
        const originalId = (envelope.payload as any)?.originalEnvelopeId;
        const resume = this.pendingApprovals.get(originalId);
        if (resume) {
          await resume();
          this.pendingApprovals.delete(originalId);

          try {
            await db
              .update(a2aApprovals)
              .set({ status: "granted", decidedAt: new Date() })
              .where((a2aApprovals as any).envelopeId.eq(originalId));
          } catch (e) {
            // Silent fail if DB is not available in test/local
          }
        }
      }
    });
  }

  async publish<TPayload>(
    topic: string,
    envelope: BalnceEnvelope<TPayload>,
  ): Promise<void> {
    // Policy Evaluation
    if (this.policyEngine) {
      const decision = await this.policyEngine.evaluatePublish({
        topic,
        envelope,
      });
      if (!decision.allowed) {
        console.warn(`[A2A] Publish blocked by policy: ${decision.reason}`);
        return;
      }
      if (decision.modifiedEnvelope) {
        envelope = decision.modifiedEnvelope as BalnceEnvelope<TPayload>;
      }
    }

    // Event Logging
    if (this.eventLog) {
      await this.eventLog.append(envelope);
    }

    // Approval Gating
    if (envelope.delivery?.class === "approval_required") {
      await this.handleApprovalRequired(topic, envelope);
      return;
    }

    // Standard Transport Delivery
    await this.transport.publish(topic, envelope);
  }

  private async handleApprovalRequired(
    topic: string,
    envelope: BalnceEnvelope,
  ) {
    console.log(`[A2A] Envelope ${envelope.id} requires approval. Pausing...`);

    // Persist to database
    try {
      await db.insert(a2aApprovals).values({
        envelopeId: envelope.id,
        runId: envelope.runId,
        status: "pending",
        requestedAt: new Date(),
        envelope: envelope,
      });
    } catch (e) {
      // console.error("[A2A] Failed to persist approval record", e);
    }

    // Store the resume function in memory
    this.pendingApprovals.set(envelope.id, async () => {
      console.log(`[A2A] Approval granted for ${envelope.id}. Resuming...`);
      await this.transport.publish(topic, envelope);
    });

    // Emit an approval.required event for the UI
    const approvalEventTopic = Topics.approvalEvent(envelope.runId);
    const approvalEnvelope: BalnceEnvelope = {
      ...envelope,
      id: `${envelope.id}-approval-req`,
      event: {
        type: "approval.required",
        sequence: 0,
        timestamp: new Date().toISOString(),
      },
      payload: {
        originalEnvelopeId: envelope.id,
        topic,
      },
      delivery: { class: "ephemeral" },
    };

    await this.transport.publish(approvalEventTopic, approvalEnvelope);
  }

  subscribe<TPayload>(
    topic: string,
    handler: (envelope: BalnceEnvelope<TPayload>) => void | Promise<void>,
    options?: any,
  ): { unsubscribe: () => void } {
    const wrappedHandler = async (envelope: BalnceEnvelope<TPayload>) => {
      if (this.policyEngine) {
        const decision = await this.policyEngine.evaluateDelivery({
          topic,
          envelope,
          subscriber: options?.subscriber,
        });
        if (!decision.allowed) {
          return;
        }
      }
      return handler(envelope);
    };

    return this.transport.subscribe(topic, wrappedHandler, options);
  }

  async replay(query: A2AReplayQuery): Promise<BalnceEnvelope[]> {
    if (!this.eventLog) {
      throw new Error("No EventLog configured for replay");
    }
    return this.eventLog.query(query);
  }
}
