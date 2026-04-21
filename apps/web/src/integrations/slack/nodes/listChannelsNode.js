import { getSlackClient } from "../slackClient.js";

export async function execute(_params) {
  const client = getSlackClient();

  const result = await client.conversations.list({
    limit: 200,
    types: "public_channel,private_channel",
    exclude_archived: true,
  });

  if (!result.ok) {
    throw new Error(result.error || "Slack API error: conversations.list failed");
  }

  return {
    channels: result.channels ?? [],
    responseMetadata: result.response_metadata ?? null,
  };
}

