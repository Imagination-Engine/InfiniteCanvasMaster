/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  build: {
    rollupOptions: {
      external: [
        "stream/web",
        "node:process",
        "crypto",
        "@mastra/core",
        "@modelcontextprotocol/sdk",
        "zod-to-json-schema",
        "ai",
        "@ai-sdk/google",
      ],
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
