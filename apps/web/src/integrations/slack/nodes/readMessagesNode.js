import { getSlackClient } from "../slackClient.js";

export async function execute(params) {
  const client = getSlackClient();

  const channel = typeof params?.channel === "string" ? params.channel.trim() : "";
  if (!channel) {
    throw new Error('Missing required parameter: "channel"');
  }

  const limitRaw = params?.limit;
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(1000, Number(limitRaw))) : 20;

  let result;
  try {
    result = await client.conversations.history({
      channel,
      limit,
    });
  } catch (error) {
    const errorCode = error.data?.error || error.code || error.message;
    if (errorCode === "not_in_channel") {
      try {
        await client.conversations.join({ channel });
        result = await client.conversations.history({
          channel,
          limit,
        });
      } catch (joinError) {
        throw new Error(`Slack API error. Original: not_in_channel. Join attempt failed with: ${joinError.data?.error || joinError.message}`);
      }
    } else {
      throw new Error(`Slack API error: ${errorCode}`);
    }
  }

  if (!result || !result.ok) {
    throw new Error((result && result.error) || "Slack API error: conversations.history failed");
  }

  return {
    messages: result.messages ?? [],
    hasMore: Boolean(result.has_more),
    responseMetadata: result.response_metadata ?? null,
  };
}
