import { apiRequest } from "../../lib/api";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runTriggerNode(
  nodeType: string,
  config: Record<string, unknown>,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await sleep(200);

  return {
    payload: {
      nodeType,
      timestamp: new Date().toISOString(),
      config,
      inputs,
    },
  };
}

export async function runIntegrationNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  await sleep(300);

  if (nodeType.startsWith("slack.")) {
    return runSlackNode(nodeType, inputs, accessToken);
  }
  if (nodeType.startsWith("gmail.")) {
    return runGmailNode(nodeType, inputs, accessToken);
  }

  return {
    result: {
      nodeType,
      status: "mocked",
      inputs,
      config,
      executedAt: new Date().toISOString(),
    },
  };
}

const toStringValue = (value: unknown) => (typeof value === "string" ? value : String(value ?? ""));

const toTextLines = (values: string[]) => values.filter((v) => v.trim().length > 0).join("\n");

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    const text = toStringValue(value).trim();
    if (text.length > 0) {
      return text;
    }
  }
  return "";
};

async function runSlackNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  switch (nodeType) {
    case "slack.sendChannelMessage": {
      const channelId = toStringValue(inputs.channelId).trim();
      const message = toStringValue(inputs.message);
      return apiRequest(
        "/api/slack/nodes/sendMessage",
        {
          method: "POST",
          body: JSON.stringify({ channelId, message }),
        },
        accessToken,
      );
    }
    case "slack.inviteUserToChannel": {
      const channelId = toStringValue(inputs.channelId).trim();
      const userId = toStringValue(inputs.userId).trim();
      return apiRequest(
        "/api/slack/nodes/inviteUsers",
        {
          method: "POST",
          body: JSON.stringify({ channelId, userId }),
        },
        accessToken,
      );
    }
    case "slack.sendDm": {
      const userId = toStringValue(inputs.userId).trim();
      const message = toStringValue(inputs.message);
      return apiRequest(
        "/api/slack/nodes/sendDm",
        {
          method: "POST",
          body: JSON.stringify({ userId, message }),
        },
        accessToken,
      );
    }
    case "slack.inviteUserToWorkspace": {
      const email = toStringValue(inputs.email).trim();
      const teamId = toStringValue(inputs.teamId).trim();
      return apiRequest(
        "/api/slack/nodes/inviteToWorkspace",
        {
          method: "POST",
          body: JSON.stringify({ email, teamId }),
        },
        accessToken,
      );
    }
    case "slack.getMessage": {
      const channelId = toStringValue(inputs.channelId).trim();
      const messageTs = toStringValue(inputs.messageTs).trim();
      return apiRequest(
        "/api/slack/nodes/getMessage",
        {
          method: "POST",
          body: JSON.stringify({ channelId, messageTs }),
        },
        accessToken,
      );
    }
    case "slack.readMessages": {
      const channelId = toStringValue(inputs.channelId).trim();
      const limit = toStringValue(inputs.limit).trim();
      return apiRequest(
        "/api/slack/nodes/readMessages",
        {
          method: "POST",
          body: JSON.stringify({ channelId, limit }),
        },
        accessToken,
      );
    }
    case "slack.listChannels":
      return apiRequest("/api/slack/nodes/listChannels", { method: "POST" }, accessToken);
    case "slack.listUsers":
      return apiRequest("/api/slack/nodes/listUsers", { method: "POST" }, accessToken);
    case "slack.createChannel": {
      const name = toStringValue(inputs.name).trim();
      const isPrivate = toStringValue(inputs.is_private).trim();
      return apiRequest(
        "/api/slack/nodes/createChannel",
        {
          method: "POST",
          body: JSON.stringify({ name, is_private: isPrivate }),
        },
        accessToken,
      );
    }
    default: {
      const type = nodeType;
      return {
        result: { nodeType: type, status: "unsupported" },
        text: toTextLines([`Slack node not implemented: ${type}`, JSON.stringify(inputs)]),
      };
    }
  }
}

async function runGmailNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  switch (nodeType) {
    case "gmail.sendEmail": {
      const to = firstNonEmpty(inputs.to, inputs.recipient, inputs.recipientEmail);
      const subject = firstNonEmpty(inputs.subject, inputs.title, inputs.topic);
      const body = firstNonEmpty(
        inputs.body,
        inputs.result,
        inputs.text,
        inputs.summary,
        inputs.analysis,
        inputs.message,
      );
      return apiRequest(
        "/api/gmail/nodes/sendEmail",
        {
          method: "POST",
          body: JSON.stringify({ to, subject, body }),
        },
        accessToken,
      );
    }
    case "gmail.retrieveEmail": {
      const query = firstNonEmpty(inputs.query, inputs.q);
      const maxResults = firstNonEmpty(inputs.maxResults, "10");
      const includeSpamTrash = firstNonEmpty(inputs.includeSpamTrash, "false");
      return apiRequest(
        "/api/gmail/nodes/retrieveEmail",
        {
          method: "POST",
          body: JSON.stringify({ query, maxResults, includeSpamTrash }),
        },
        accessToken,
      );
    }
    default: {
      const type = nodeType;
      return {
        result: { nodeType: type, status: "unsupported" },
        text: toTextLines([`Gmail node not implemented: ${type}`, JSON.stringify(inputs)]),
      };
    }
  }
}
