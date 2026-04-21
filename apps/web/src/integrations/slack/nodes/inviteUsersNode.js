import { getSlackClient } from "../slackClient.js";

export async function execute(params) {
  const client = getSlackClient();

  const channel = typeof params?.channel === "string" ? params.channel.trim() : "";
  if (!channel) {
    throw new Error('Missing required parameter: "channel"');
  }

  const users = Array.isArray(params?.users) ? params.users.map((u) => String(u).trim()).filter(Boolean) : [];
  if (users.length === 0) {
    throw new Error('Missing required parameter: "users" (non-empty array)');
  }

  let result;
  try {
    result = await client.conversations.invite({
      channel,
      users: users.join(","),
    });
  } catch (error) {
    const errorCode = error.data?.error || error.code || error.message;
    if (errorCode === "not_in_channel") {
      try {
        await client.conversations.join({ channel });
        result = await client.conversations.invite({
          channel,
          users: users.join(","),
        });
      } catch (joinError) {
        throw new Error(`Slack API error. Original: not_in_channel. Join attempt failed with: ${joinError.data?.error || joinError.message}`);
      }
    } else {
      throw new Error(`Slack API error: ${errorCode}`);
    }
  }

  if (!result || !result.ok) {
    throw new Error((result && result.error) || "Slack API error: conversations.invite failed");
  }

  return {
    channel: result.channel,
  };
}
