import { Hono } from "hono";

const slackRouter = new Hono();
const gmailRouter = new Hono();

slackRouter.get("/status", (c) => {
  return c.json({
    connected: true,
    teamName: "Local Mock Slack",
    mocked: true,
  });
});

slackRouter.get("/connect", (c) => {
  return c.text("Slack OAuth is mocked in local development mode.");
});

slackRouter.post("/nodes/*", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  return c.json({
    ok: true,
    mocked: true,
    route: c.req.path,
    result: payload,
    text: "Mock Slack node executed locally.",
  });
});

gmailRouter.get("/status", (c) => {
  return c.json({
    connected: true,
    email: "mock-user@localhost",
    mocked: true,
  });
});

gmailRouter.get("/connect", (c) => {
  return c.text("Gmail OAuth is mocked in local development mode.");
});

gmailRouter.post("/nodes/*", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  return c.json({
    ok: true,
    mocked: true,
    route: c.req.path,
    result: payload,
    text: "Mock Gmail node executed locally.",
  });
});

export { slackRouter, gmailRouter };
