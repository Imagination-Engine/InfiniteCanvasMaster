/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { fileURLToPath } from "url";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITEST;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Exclude during test runs: this plugin injects virtual shim imports
    // (e.g. vite-plugin-node-polyfills/shims/buffer) into processed source files.
    // Those virtual modules are only resolvable inside Vite's plugin container —
    // Vitest cannot resolve them, causing import-analysis failures. The test
    // environment runs in Node.js which already provides Buffer/global natively.
    ...(!isTest
      ? [
          nodePolyfills({
            include: ["stream", "crypto", "buffer", "util"],
            globals: {
              Buffer: true,
              global: true,
              process: true,
            },
          }),
        ]
      : []),
  ],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      "lucide-react",
      "@ai-sdk/react",
      "framer-motion",
      "clsx",
      "tailwind-merge",
    ],
    exclude: [
      "@iem/imagination-canvas-kit",
      "@iem/core",
      "@iem/agents",
      "@iem/chat-interaction-kit",
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "lucide-react": "lucide-react/dist/esm/lucide-react",
      "stream/web": require.resolve("web-streams-polyfill"),
      "@iem/core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url),
      ),
      "@iem/db": fileURLToPath(
        new URL("../../packages/db/src/index.ts", import.meta.url),
      ),
      "@iem/chat-interaction-kit": fileURLToPath(
        new URL(
          "../../packages/chat-interaction-kit/src/index.ts",
          import.meta.url,
        ),
      ),
      "@iem/imagination-canvas-kit": fileURLToPath(
        new URL(
          "../../packages/imagination-canvas-kit/src/index.ts",
          import.meta.url,
        ),
      ),
    },
  },
  build: {
    commonjsOptions: {
      include: [/packages/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "lucide-react",
        "framer-motion",
        "zustand",
        "zod",
        "google",
      ],
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/generated-media": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
} as any);
