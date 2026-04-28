import { A2APolicyEngine, BalnceEnvelope, PolicyDecision } from "./protocol";
import * as dbModule from "@iem/db";
import { eq } from "drizzle-orm";

const { db, customAgents } = dbModule as any;

export class DatabasePolicyEngine implements A2APolicyEngine {
  async evaluatePublish(args: {
    topic: string;
    envelope: BalnceEnvelope;
  }): Promise<PolicyDecision> {
    const { envelope } = args;

    // 1. Redaction logic based on sensitivity
    if (envelope.policy?.sensitivity === "secret") {
      // If we're publishing a secret, we might want to redact the payload for general topics
      if (args.topic.includes("broadcast") || args.topic.includes("canvas")) {
        return {
          allowed: true,
          modifiedEnvelope: {
            ...envelope,
            payload: { redacted: true, message: "Content is secret" },
          },
        };
      }
    }

    // 2. Capability check for agents
    if (envelope.source.type === "agent") {
      try {
        const [agent] = await db
          .select()
          .from(customAgents)
          .where(eq(customAgents.id, envelope.source.id));

        if (agent) {
          const allowedCaps = (agent.capabilities as string[]) || [];
          const requestedCaps = envelope.policy?.allowedCapabilities || [];

          for (const cap of requestedCaps) {
            if (!allowedCaps.includes(cap)) {
              return {
                allowed: false,
                reason: `Agent missing required capability: ${cap}`,
              };
            }
          }
        }
      } catch (e) {
        console.error("[Policy] DB capability check failed", e);
      }
    }

    return { allowed: true };
  }

  async evaluateDelivery(args: {
    topic: string;
    envelope: BalnceEnvelope;
    subscriber?: any;
  }): Promise<PolicyDecision> {
    // Visibility checks
    const visibility = envelope.policy?.visibility || "workspace";

    if (
      visibility === "private" &&
      args.subscriber?.id !== envelope.source.id
    ) {
      return { allowed: false, reason: "Message is private to source" };
    }

    return { allowed: true };
  }

  async evaluateInputAdaptation(args: {
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
    toolName?: string;
  }): Promise<PolicyDecision> {
    // Check for "untrusted" origins being passed to high-risk tools
    const highRiskTools = ["shell_execute", "filesystem_write", "wallet_send"];
    if (args.toolName && highRiskTools.includes(args.toolName)) {
      for (const env of args.envelopes) {
        if (env.instruction?.trust === "untrusted") {
          return {
            allowed: false,
            reason: "Untrusted instruction passed to high-risk tool",
          };
        }
      }
    }

    return { allowed: true };
  }
}
