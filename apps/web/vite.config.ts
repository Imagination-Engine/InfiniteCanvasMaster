/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  resolve: {
    alias: {
      "lucide-react": "lucide-react/dist/esm/lucide-react",
      "@iem/core":
        new URL("../../packages/core/src/index.ts", import.meta.url).pathname,
      "@iem/agents":
        new URL("../../packages/agents/src/index.ts", import.meta.url).pathname,
      "@iem/db": new URL("../../packages/db/src/index.ts", import.meta.url).pathname,
      "@iem/chat-interaction-kit":
        new URL("../../packages/chat-interaction-kit/src/index.ts", import.meta.url).pathname,
      "@iem/imagination-canvas-kit":
        new URL("../../packages/imagination-canvas-kit/src/index.ts", import.meta.url).pathname,
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
} as any);
