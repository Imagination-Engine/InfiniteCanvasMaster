import { A2AMessageTransport, BalnceEnvelope } from "./protocol";

export interface GatewayRule {
  topicPattern: string;
  action: "forward" | "block" | "rewrite";
  targetTransport?: A2AMessageTransport;
}

export class A2AGateway {
  private rules: GatewayRule[] = [];

  constructor(private localTransport: A2AMessageTransport) {}

  addRule(rule: GatewayRule) {
    this.rules.push(rule);

    // Subscribe to matching local topics
    this.localTransport.subscribe(rule.topicPattern, async (envelope) => {
      if (rule.action === "forward" && rule.targetTransport) {
        console.log(
          `[GATEWAY] Forwarding ${envelope.id} from ${rule.topicPattern}`,
        );
        await rule.targetTransport.publish(
          envelope.target?.topic || rule.topicPattern,
          envelope,
        );
      }
    });
  }
}
