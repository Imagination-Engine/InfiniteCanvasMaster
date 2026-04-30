import { getSlackClient } from "../slackClient.js";

export async function execute(params) {
  const client = getSlackClient();

  const channel = typeof params?.channel === "string" ? params.channel.trim() : "";
  if (!channel) {
    throw new Error('Missing required parameter: "channel"');
  }

  const text = typeof params?.text === "string" ? params.text : "";
  if (!text.trim()) {
    throw new Error('Missing required parameter: "text"');
  }

  let result;
  try {
    result = await client.chat.postMessage({
      channel,
      text,
    });
  } catch (error) {
    const errorCode = error.data?.error || error.code || error.message;
    if (errorCode === "not_in_channel") {
      try {
        await client.conversations.join({ channel });
        result = await client.chat.postMessage({
          channel,
          text,
        });
      } catch (joinError) {
        throw new Error(`Slack API error. Original: not_in_channel. Join attempt failed with: ${joinError.data?.error || joinError.message}`);
      }
    } else {
      throw new Error(`Slack API error: ${errorCode}`);
    }
  }

  if (!result || !result.ok) {
    throw new Error((result && result.error) || "Slack API error: chat.postMessage failed");
  }

  return {
    channel: result.channel,
    ts: result.ts,
    message: result.message,
  };
}
