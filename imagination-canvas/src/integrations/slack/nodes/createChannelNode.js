import { getSlackClient } from "../slackClient.js";

export async function execute(params) {
  const client = getSlackClient();

  const name = typeof params?.name === "string" ? params.name.trim() : "";
  if (!name) {
    throw new Error('Missing required parameter: "name"');
  }

  const isPrivate = typeof params?.is_private === "boolean" ? params.is_private : undefined;

  const result = await client.conversations.create({
    name,
    is_private: isPrivate,
  });

  if (!result.ok) {
    throw new Error(result.error || "Slack API error: conversations.create failed");
  }

  return {
    channel: result.channel,
  };
}

