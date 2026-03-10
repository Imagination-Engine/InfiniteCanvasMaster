import { getSlackClient } from "../slackClient.js";

export async function execute(_params) {
  const client = getSlackClient();

  const result = await client.users.list({
    limit: 200,
  });

  if (!result.ok) {
    throw new Error(result.error || "Slack API error: users.list failed");
  }

  return {
    members: result.members ?? [],
    responseMetadata: result.response_metadata ?? null,
  };
}

