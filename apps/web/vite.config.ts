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
        "/Users/zacharyschenkler/icmaster/packages/core/src/index.ts",
      "@iem/agents":
        "/Users/zacharyschenkler/icmaster/packages/agents/src/index.ts",
      "@iem/db": "/Users/zacharyschenkler/icmaster/packages/db/src/index.ts",
      "@iem/chat-interaction-kit":
        "/Users/zacharyschenkler/icmaster/packages/chat-interaction-kit/src/index.ts",
      "@iem/imagination-canvas-kit":
        "/Users/zacharyschenkler/icmaster/packages/imagination-canvas-kit/src/index.ts",
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
