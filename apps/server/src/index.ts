import "./env.js";
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { initializeBlockRegistry } from "./registry-init.js";

console.log("Environment Variables Loaded:", {
  GOOGLE_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  DATABASE_URL: !!process.env.DATABASE_URL,
  JWT_SECRET: !!process.env.JWT_SECRET,
});

// Initialize Registry
initializeBlockRegistry();

const port = 3001;

console.log(`Starting server on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  },
);
