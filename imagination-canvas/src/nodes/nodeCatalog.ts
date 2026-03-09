import type { NodeCatalog, NodeCatalogEntry, Schema } from "./types";

const createEntry = (
  type: string,
  category: "creative" | "workflow",
  label: string,
  description: string,
  inputSchema: Schema,
  outputSchema: Schema,
  defaults: {
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    config?: Record<string, unknown>;
  } = {},
  role?: "trigger" | "action" | "tool",
): NodeCatalogEntry => ({
  category,
  role,
  inputSchema,
  outputSchema,
  defaultData: {
    id: "",
    type,
    label,
    description,
    inputs: defaults.inputs ?? {},
    outputs: defaults.outputs ?? {},
    config: defaults.config ?? {},
    metadata: { category, label, description },
  },
});

export const NODE_CATALOG: NodeCatalog = {
  summarizer: createEntry(
    "summarizer",
    "creative",
    "Summarizer",
    "Summarize and analyze mixed media inputs.",
    { sources: ["text", "audio", "image"] },
    { summary: "text", analysis: "text" },
    { inputs: { sources: [""] }, outputs: { summary: "", analysis: "" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  translator: createEntry(
    "translator",
    "creative",
    "Translator",
    "Translate text/audio to a target language.",
    { source: ["text", "audio"], targetLanguage: "language", outputType: ["text", "audio"] },
    { result: ["text", "audio"], detectedLanguage: "text" },
    { inputs: { source: "", targetLanguage: "Spanish", outputType: "text" }, outputs: { result: "", detectedLanguage: "" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  refiner: createEntry(
    "refiner",
    "creative",
    "Refiner",
    "Refine text or clean up image content.",
    { source: ["text", "image"], mode: "text" },
    { refined: ["text", "image"] },
    { inputs: { source: "", mode: "text" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  colorSwapper: createEntry(
    "colorSwapper",
    "creative",
    "Color Swapper",
    "Transfer palette from one image to another.",
    { imagePrimary: "image", imagePaletteSource: "image" },
    { image: "image" },
    { inputs: { imagePrimary: "", imagePaletteSource: "" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  filter: createEntry(
    "filter",
    "creative",
    "Filter",
    "Filter text or JSON with custom conditions.",
    { source: ["text", "json"], conditions: "text" },
    { filtered: ["text", "json"] },
    { inputs: { source: "", conditions: "" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  webScraper: createEntry(
    "webScraper",
    "creative",
    "Web Scraper",
    "Scrape URL and return a JSON summary (mocked).",
    { url: "text" },
    { summary: "json" },
    { inputs: { url: "https://" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  formatter: createEntry(
    "formatter",
    "creative",
    "Formatter",
    "Reformat files into requested output format.",
    { file: "file", desiredFormat: "text" },
    { formattedFile: "file" },
    { inputs: { file: "", desiredFormat: "json" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  programmer: createEntry(
    "programmer",
    "creative",
    "Programmer",
    "Generate code from prompt and optional source code.",
    { code: "code", prompt: "text" },
    { generatedCode: "code" },
    { inputs: { code: "", prompt: "" }, config: { additionalInstructions: "" } },
    "tool",
  ),
  fileUpload: createEntry(
    "fileUpload",
    "creative",
    "Upload Node",
    "Represents an uploaded text/JSON/image file for downstream nodes.",
    {},
    { file: "file", text: "text", json: "json", image: "image" },
    {
      inputs: {
        fileName: "",
        mimeType: "",
      },
      outputs: {
        file: {},
      },
    },
    "tool",
  ),

  "trigger.time": createEntry(
    "trigger.time",
    "workflow",
    "Time Trigger",
    "Emits payload from a cron-like schedule.",
    {},
    { payload: "trigger" },
    { config: { cron: "0 14 * * 2", timezone: "America/Los_Angeles" } },
    "trigger",
  ),
  "trigger.webhook": createEntry(
    "trigger.webhook",
    "workflow",
    "Webhook Trigger",
    "Emits payload when webhook receives data.",
    {},
    { payload: "trigger" },
    { config: { path: "/hooks/main" } },
    "trigger",
  ),
  "trigger.slackMessage": createEntry(
    "trigger.slackMessage",
    "workflow",
    "Slack Message Trigger",
    "Emits payload when a Slack message event arrives.",
    {},
    { payload: "trigger", message: "message" },
    { config: { channel: "#general" } },
    "trigger",
  ),
  "trigger.calendlyEvent": createEntry(
    "trigger.calendlyEvent",
    "workflow",
    "Calendly Event Trigger",
    "Emits payload when a Calendly event is created.",
    {},
    { payload: "trigger", event: "json" },
    { config: { eventType: "30-min-intro" } },
    "trigger",
  ),

  "zoom.createMeeting": createEntry("zoom.createMeeting", "workflow", "Zoom Create Meeting", "Create a Zoom meeting.", { payload: ["trigger", "json"], topic: "text", when: "text" }, { meeting: "meeting" }, { inputs: { topic: "Weekly Sync", when: "next Tuesday 2pm" } }, "action"),
  "zoom.getMeetingSummary": createEntry("zoom.getMeetingSummary", "workflow", "Zoom Get Meeting Summary", "Retrieve mocked meeting summary.", { payload: ["trigger", "json"], meetingId: "text" }, { summary: "text", json: "json" }, { inputs: { meetingId: "" } }, "action"),

  "discord.sendChannelMessage": createEntry("discord.sendChannelMessage", "workflow", "Discord Send Channel Message", "Send a channel message (mock).", { payload: ["trigger", "json", "text"], channelId: "text", message: "text" }, { result: "json" }, { inputs: { channelId: "", message: "" } }, "action"),
  "discord.sendDm": createEntry("discord.sendDm", "workflow", "Discord Send DM", "Send a DM (mock).", { payload: ["trigger", "json", "text"], userId: "text", message: "text" }, { result: "json" }, { inputs: { userId: "", message: "" } }, "action"),
  "discord.getChannelMessage": createEntry("discord.getChannelMessage", "workflow", "Discord Retrieve Channel Message", "Get channel message by id (mock).", { payload: ["trigger", "json"], channelId: "text", messageId: "text" }, { message: "message", json: "json" }, { inputs: { channelId: "", messageId: "" } }, "action"),

  "slack.inviteUserToChannel": createEntry("slack.inviteUserToChannel", "workflow", "Slack Invite User to Channel", "Invite user to channel (mock).", { payload: ["trigger", "json"], userId: "text", channelId: "text" }, { result: "json" }, { inputs: { userId: "", channelId: "" } }, "action"),
  "slack.sendChannelMessage": createEntry("slack.sendChannelMessage", "workflow", "Slack Send Channel Message", "Send a Slack channel message (mock).", { payload: ["trigger", "json", "text"], channelId: "text", message: "text" }, { result: "json" }, { inputs: { channelId: "", message: "" } }, "action"),
  "slack.sendDm": createEntry("slack.sendDm", "workflow", "Slack Send DM", "Send Slack DM (mock).", { payload: ["trigger", "json", "text"], userId: "text", message: "text" }, { result: "json" }, { inputs: { userId: "", message: "" } }, "action"),
  "slack.getMessage": createEntry("slack.getMessage", "workflow", "Slack Get Message", "Retrieve Slack message (mock).", { payload: ["trigger", "json"], channelId: "text", messageTs: "text" }, { message: "message", json: "json" }, { inputs: { channelId: "", messageTs: "" } }, "action"),

  "trello.createBoard": createEntry("trello.createBoard", "workflow", "Trello Create Board", "Create Trello board (mock).", { payload: ["trigger", "json"], name: "text" }, { board: "json" }, { inputs: { name: "Sprint Board" } }, "action"),
  "trello.createCard": createEntry("trello.createCard", "workflow", "Trello Create Card", "Create Trello card (mock).", { payload: ["trigger", "json", "text"], listId: "text", title: "text", description: "text" }, { card: "json" }, { inputs: { listId: "", title: "", description: "" } }, "action"),
  "trello.updateCard": createEntry("trello.updateCard", "workflow", "Trello Update Card", "Update Trello card (mock).", { payload: ["trigger", "json", "text"], cardId: "text", title: "text", description: "text" }, { card: "json" }, { inputs: { cardId: "", title: "", description: "" } }, "action"),
  "trello.getCard": createEntry("trello.getCard", "workflow", "Trello Get Card", "Fetch Trello card (mock).", { payload: ["trigger", "json"], cardId: "text" }, { card: "json" }, { inputs: { cardId: "" } }, "action"),
  "trello.getBoard": createEntry("trello.getBoard", "workflow", "Trello Get Board", "Fetch Trello board (mock).", { payload: ["trigger", "json"], boardId: "text" }, { board: "json" }, { inputs: { boardId: "" } }, "action"),

  "calendly.sendInviteLink": createEntry("calendly.sendInviteLink", "workflow", "Calendly Send Invite Link", "Send Calendly invite link (mock).", { payload: ["trigger", "json", "text"], recipientEmail: "email" }, { invite: "json" }, { inputs: { recipientEmail: "" } }, "action"),
  "calendly.retrieveAvailability": createEntry("calendly.retrieveAvailability", "workflow", "Calendly Retrieve Availability", "Get Calendly availability (mock).", { payload: ["trigger", "json"], range: "text" }, { availability: "json" }, { inputs: { range: "next 7 days" } }, "action"),

  "gmail.sendEmail": createEntry("gmail.sendEmail", "workflow", "Gmail Send Email", "Send Gmail email (mock).", { payload: ["trigger", "json", "text"], to: "email", subject: "text", body: "text" }, { result: "json" }, { inputs: { to: "", subject: "", body: "" } }, "action"),
  "gmail.retrieveEmail": createEntry("gmail.retrieveEmail", "workflow", "Gmail Retrieve Email", "Retrieve Gmail email (mock).", { payload: ["trigger", "json"], query: "text" }, { email: "email", json: "json" }, { inputs: { query: "" } }, "action"),

  "sheets.createSpreadsheet": createEntry("sheets.createSpreadsheet", "workflow", "Google Sheets Create Spreadsheet", "Create spreadsheet (mock).", { payload: ["trigger", "json"], title: "text" }, { spreadsheet: "sheet" }, { inputs: { title: "Automation Output" } }, "action"),
  "sheets.updateSpreadsheet": createEntry("sheets.updateSpreadsheet", "workflow", "Google Sheets Update Spreadsheet", "Update spreadsheet (mock).", { payload: ["trigger", "json"], spreadsheetId: "text", range: "text", values: "json" }, { spreadsheet: "sheet", json: "json" }, { inputs: { spreadsheetId: "", range: "A1", values: "[]" } }, "action"),
  "sheets.readSpreadsheet": createEntry("sheets.readSpreadsheet", "workflow", "Google Sheets Read Spreadsheet", "Read spreadsheet (mock).", { payload: ["trigger", "json"], spreadsheetId: "text", range: "text" }, { rows: "json" }, { inputs: { spreadsheetId: "", range: "A1:C20" } }, "action"),
};

export const CREATIVE_NODE_TYPES = Object.keys(NODE_CATALOG).filter(
  (type) => NODE_CATALOG[type]?.category === "creative",
);

export const WORKFLOW_NODE_TYPES = Object.keys(NODE_CATALOG).filter(
  (type) => NODE_CATALOG[type]?.category === "workflow",
);
