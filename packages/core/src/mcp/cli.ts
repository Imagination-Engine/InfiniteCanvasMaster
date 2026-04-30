#!/usr/bin/env node
import { EngineMCPServer } from "./server.js";

// Ensure any async setup is awaited
async function main() {
  const server = new EngineMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error("Fatal error in MCP Server:", error);
  process.exit(1);
});
