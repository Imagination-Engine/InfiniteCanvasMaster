export class A2AGateway {
  localTransport;
  rules = [];
  constructor(localTransport) {
    this.localTransport = localTransport;
  }
  addRule(rule) {
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
