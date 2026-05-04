/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

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
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "lucide-react": "lucide-react/dist/esm/lucide-react",
      "stream/web": require.resolve("web-streams-polyfill"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      "@iem/core": new URL("../../packages/core/src/index.ts", import.meta.url)
        .pathname,
      "@iem/db": new URL("../../packages/db/src/index.ts", import.meta.url)
        .pathname,
      "@iem/chat-interaction-kit": new URL(
        "../../packages/chat-interaction-kit/src/index.ts",
        import.meta.url,
      ).pathname,
      "@iem/imagination-canvas-kit": new URL(
        "../../packages/imagination-canvas-kit/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
  build: {
    commonjsOptions: {
      include: [/packages/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [nodePolyfills()],
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
