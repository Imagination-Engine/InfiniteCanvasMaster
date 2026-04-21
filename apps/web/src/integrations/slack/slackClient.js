import { WebClient } from "@slack/web-api";

export function getSlackClient() {
  if (!global.slackIntegration?.botToken) {
    throw new Error("Slack not connected");
  }

  return new WebClient(global.slackIntegration.botToken);
}

